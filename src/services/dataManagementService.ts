import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { AuditLog, MovimentacaoAeronave } from '../types';

const STORAGE_KEYS = {
  MOVIMENTACOES: 'cgb_movimentacoes_data_v1',
  LOGS: 'cgb_audit_logs_v1',
  MODELS: 'cgb_aircraft_models_v1',
  LAST_AUTO_BACKUP: 'cgb_last_auto_backup',
  BACKUP_CONFIG: 'cgb_backup_config'
};

const BACKUP_DIR = 'CGB_Snapshots';

export interface BackupConfig {
  autoEnabled: boolean;
  frequency: 'DAILY' | 'WEEKLY' | 'FORTNIGHTLY' | 'MONTHLY';
}

export interface SnapshotMetadata {
  name: string;
  path: string;
  timestamp: string;
  isAuto: boolean;
  size?: number;
}

// Helper to ensure directory exists
const ensureDir = async () => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await Filesystem.mkdir({
      path: BACKUP_DIR,
      directory: Directory.Documents,
      recursive: true
    });
  } catch (e) {
    // Already exists
  }
};

export const exportToCSV = async (filename: string, headers: string[], rows: any[][]) => {
  const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
  const fullContent = '\uFEFF' + csvContent;

  if (Capacitor.isNativePlatform()) {
    try {
      const path = `${filename}_${Date.now()}.csv`;
      await Filesystem.writeFile({
        path,
        data: btoa(unescape(encodeURIComponent(fullContent))),
        directory: Directory.Cache,
      });

      const uriResult = await Filesystem.getUri({
        directory: Directory.Cache,
        path
      });

      await Share.share({
        title: `Exportação CGB - ${filename}`,
        url: uriResult.uri,
      });
    } catch (error) {
      console.error('Erro ao exportar CSV no mobile:', error);
    }
  } else {
    const blob = new Blob([fullContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const saveInternalSnapshot = async (name: string, isAuto: boolean = false) => {
  await ensureDir();

  const data = {
    movimentacoes: JSON.parse(localStorage.getItem(STORAGE_KEYS.MOVIMENTACOES) || '[]'),
    logs: JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS) || '[]'),
    models: JSON.parse(localStorage.getItem(STORAGE_KEYS.MODELS) || '[]'),
    metadata: {
      name,
      timestamp: new Date().toISOString(),
      isAuto,
      appVersion: '1.7.0'
    }
  };

  const jsonString = JSON.stringify(data);
  const fileName = `${isAuto ? 'AUTO' : 'MANUAL'}_${Date.now()}.json`;

  if (Capacitor.isNativePlatform()) {
    await Filesystem.writeFile({
      path: `${BACKUP_DIR}/${fileName}`,
      data: btoa(unescape(encodeURIComponent(jsonString))),
      directory: Directory.Documents,
    });
    if (isAuto) localStorage.setItem(STORAGE_KEYS.LAST_AUTO_BACKUP, new Date().toISOString());
  } else {
    // Web mock for snapshots using localStorage
    const snapshots = JSON.parse(localStorage.getItem('cgb_web_snapshots') || '[]');
    snapshots.push({ ...data.metadata, content: jsonString, id: fileName });
    localStorage.setItem('cgb_web_snapshots', JSON.stringify(snapshots));
  }
};

export const listInternalSnapshots = async (): Promise<SnapshotMetadata[]> => {
  if (Capacitor.isNativePlatform()) {
    await ensureDir();
    try {
      const result = await Filesystem.readdir({
        path: BACKUP_DIR,
        directory: Directory.Documents,
      });

      const snapshots: SnapshotMetadata[] = [];
      for (const file of result.files) {
        try {
          const content = await Filesystem.readFile({
            path: `${BACKUP_DIR}/${file.name}`,
            directory: Directory.Documents,
          });
          const raw = decodeURIComponent(escape(atob(content.data as string)));
          const data = JSON.parse(raw);
          snapshots.push({
            name: data.metadata.name,
            path: file.name,
            timestamp: data.metadata.timestamp,
            isAuto: data.metadata.isAuto,
            size: file.size
          });
        } catch (e) { console.error('Skip file', file.name); }
      }
      return snapshots.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    } catch (e) { return []; }
  } else {
    const webSnapshots = JSON.parse(localStorage.getItem('cgb_web_snapshots') || '[]');
    return webSnapshots.map((s: any) => ({
      name: s.name,
      path: s.id,
      timestamp: s.timestamp,
      isAuto: s.isAuto
    })).sort((a: any, b: any) => b.timestamp.localeCompare(a.timestamp));
  }
};

export const restoreFromSnapshot = async (path: string) => {
  let data;
  if (Capacitor.isNativePlatform()) {
    const content = await Filesystem.readFile({
      path: `${BACKUP_DIR}/${path}`,
      directory: Directory.Documents,
    });
    data = JSON.parse(decodeURIComponent(escape(atob(content.data as string))));
  } else {
    const webSnapshots = JSON.parse(localStorage.getItem('cgb_web_snapshots') || '[]');
    const snap = webSnapshots.find((s: any) => s.id === path);
    if (snap) data = JSON.parse(snap.content);
  }

  if (data) {
    localStorage.setItem(STORAGE_KEYS.MOVIMENTACOES, JSON.stringify(data.movimentacoes || []));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(data.logs || []));
    localStorage.setItem(STORAGE_KEYS.MODELS, JSON.stringify(data.models || []));
    return true;
  }
  return false;
};

export const deleteSnapshot = async (path: string) => {
  if (Capacitor.isNativePlatform()) {
    await Filesystem.deleteFile({
      path: `${BACKUP_DIR}/${path}`,
      directory: Directory.Documents,
    });
  } else {
    const webSnapshots = JSON.parse(localStorage.getItem('cgb_web_snapshots') || '[]');
    const filtered = webSnapshots.filter((s: any) => s.id !== path);
    localStorage.setItem('cgb_web_snapshots', JSON.stringify(filtered));
  }
};

export const checkAndRunAutoBackup = async (config: BackupConfig) => {
  if (!config.autoEnabled || !Capacitor.isNativePlatform()) return;

  const lastBackup = localStorage.getItem(STORAGE_KEYS.LAST_AUTO_BACKUP);
  if (!lastBackup) {
    await saveInternalSnapshot('Backup Automático Inicial', true);
    return;
  }

  const lastDate = new Date(lastBackup);
  const now = new Date();
  const diffDays = (now.getTime() - lastDate.getTime()) / (1000 * 3600 * 24);

  let shouldBackup = false;
  if (config.frequency === 'DAILY' && diffDays >= 1) shouldBackup = true;
  else if (config.frequency === 'WEEKLY' && diffDays >= 7) shouldBackup = true;
  else if (config.frequency === 'FORTNIGHTLY' && diffDays >= 15) shouldBackup = true;
  else if (config.frequency === 'MONTHLY' && diffDays >= 30) shouldBackup = true;

  if (shouldBackup) {
    await saveInternalSnapshot(`Auto Backup (${config.frequency})`, true);
  }
};

export const generateBackup = async () => {
  const data = {
    movimentacoes: JSON.parse(localStorage.getItem(STORAGE_KEYS.MOVIMENTACOES) || '[]'),
    logs: JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS) || '[]'),
    models: JSON.parse(localStorage.getItem(STORAGE_KEYS.MODELS) || '[]'),
    version: '1.7.0',
    timestamp: new Date().toISOString()
  };

  const jsonString = JSON.stringify(data, null, 2);

  if (Capacitor.isNativePlatform()) {
    try {
      const path = `backup_cgb_${Date.now()}.json`;
      await Filesystem.writeFile({
        path,
        data: btoa(unescape(encodeURIComponent(jsonString))),
        directory: Directory.Cache,
      });

      const uriResult = await Filesystem.getUri({
        directory: Directory.Cache,
        path
      });

      await Share.share({
        title: 'Backup Total Dashboard CGB',
        url: uriResult.uri,
      });
    } catch (error) { console.error(error); }
  } else {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `backup_cgb_total_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const restoreBackup = (file: File): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        localStorage.setItem(STORAGE_KEYS.MOVIMENTACOES, JSON.stringify(data.movimentacoes || []));
        localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(data.logs || []));
        localStorage.setItem(STORAGE_KEYS.MODELS, JSON.stringify(data.models || []));
        resolve(true);
      } catch (err) { reject(false); }
    };
    reader.readAsText(file);
  });
};

export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEYS.MOVIMENTACOES);
  localStorage.removeItem(STORAGE_KEYS.LOGS);
  localStorage.removeItem(STORAGE_KEYS.MODELS);
};

export const clearLogs = () => localStorage.removeItem(STORAGE_KEYS.LOGS);
export const clearMovimentacoes = () => localStorage.removeItem(STORAGE_KEYS.MOVIMENTACOES);

export const getDatabaseStats = () => {
  try {
    const mov = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOVIMENTACOES) || '[]');
    const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS) || '[]');
    const models = JSON.parse(localStorage.getItem(STORAGE_KEYS.MODELS) || '[]');

    return {
      totalMov: Array.isArray(mov) ? mov.length : 0,
      totalLogs: Array.isArray(logs) ? logs.length : 0,
      totalModels: Array.isArray(models) ? models.length : 0
    };
  } catch (err) {
    return { totalMov: 0, totalLogs: 0, totalModels: 0 };
  }
};
