import React, { useRef, useState, useEffect } from 'react';
import {
  Database, Download, Upload, Trash2, AlertTriangle, ShieldCheck,
  FileJson, X, ShieldAlert, CheckCircle2, RefreshCw, Clock,
  History, Settings2, ShieldQuestion, Trash, CloudDownload, CloudUpload,
  FileText, Share2, Info, PlusCircle, Edit2, ChevronRight, Wifi, WifiOff
} from 'lucide-react';
import {
  generateBackup, restoreBackup, clearAllData, clearLogs,
  clearMovimentacoes, getDatabaseStats, listInternalSnapshots,
  saveInternalSnapshot, restoreFromSnapshot, deleteSnapshot,
  SnapshotMetadata, BackupConfig
} from '../services/dataManagementService';
import { syncAllLocalData, getPendingSyncCount } from '../services/syncService';

interface DataManagementPanelProps {
  onDataRestored: () => void;
}

type MaintenanceAction = 'CLEAR_MOV' | 'CLEAR_LOGS' | 'FACTORY_RESET' | 'RESTORE_SNAP' | null;

export const DataManagementPanel: React.FC<DataManagementPanelProps> = ({ onDataRestored }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingSync, setPendingSync] = useState(0);
  const [stats, setStats] = useState({ totalMov: 0, totalLogs: 0, totalModels: 0 });
  const [snapshots, setSnapshots] = useState<SnapshotMetadata[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [syncProgress, setSyncProgress] = useState<number>(0);
  const [syncStatusText, setSyncStatusText] = useState<string>('');

  const [config, setConfig] = useState<BackupConfig>(() => {
    const saved = localStorage.getItem('cgb_backup_config');
    return saved ? JSON.parse(saved) : { autoEnabled: true, frequency: 'WEEKLY' };
  });

  const [pendingAction, setPendingAction] = useState<MaintenanceAction>(null);
  const [selectedSnapshotPath, setSelectedSnapshotPath] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const CONFIRM_PHRASE = "CONFIRMAR";

  useEffect(() => {
    loadInitialData();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadInitialData = async () => {
    setStats(getDatabaseStats());
    setPendingSync(getPendingSyncCount());
    const list = await listInternalSnapshots();
    setSnapshots(list);
  };

  const refreshStats = async () => {
    setStats(getDatabaseStats());
    setPendingSync(getPendingSyncCount());
    const list = await listInternalSnapshots();
    setSnapshots(list);
    onDataRestored();
  };

  useEffect(() => {
    localStorage.setItem('cgb_backup_config', JSON.stringify(config));
  }, [config]);

  const handleBackup = async () => {
    setIsProcessing(true);
    await generateBackup();
    setIsProcessing(false);
  };

  const handleSyncCloud = async () => {
    if (!navigator.onLine) {
      alert('⚠️ O dispositivo está offline. Conecte-se à internet para sincronizar com o Supabase.');
      return;
    }

    setIsProcessing(true);
    setSyncProgress(0);
    setSyncStatusText('Iniciando sincronização com o Supabase...');

    const result = await syncAllLocalData((progress, current, total) => {
      setSyncProgress(progress);
      setSyncStatusText(`Enviando ${current} de ${total} registros (${progress}%)`);
    });

    setSyncStatusText(result.message);
    setTimeout(async () => {
      setIsProcessing(false);
      setSyncProgress(0);
      setSyncStatusText('');
      alert(result.message);
      await refreshStats();
    }, 600);
  };

  const handleRestoreClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (confirm('A restauração irá substituir todos os dados atuais. Deseja continuar?')) {
      setIsProcessing(true);
      try {
        const success = await restoreBackup(file);
        if (success) {
          alert('Dados restaurados com sucesso!');
          refreshStats();
        } else {
          alert('Falha ao restaurar dados.');
        }
      } catch (err) {
        alert('Erro durante a restauração.');
      } finally {
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const handleCreateSnapshot = async () => {
    const now = new Date();
    const defaultName = `Backup ${now.toLocaleDateString('pt-BR')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const name = window.prompt("Dê um nome para este ponto de restauração:", defaultName);
    if (name === null) return;

    setIsProcessing(true);
    await saveInternalSnapshot(name || defaultName);
    await refreshStats();
    setIsProcessing(false);
  };

  const handleRestoreSnapshotClick = (path: string) => {
    setSelectedSnapshotPath(path);
    setPendingAction('RESTORE_SNAP');
  };

  const executeAction = async () => {
    if (confirmText !== CONFIRM_PHRASE) return;

    setIsProcessing(true);
    if (pendingAction === 'CLEAR_MOV') clearMovimentacoes();
    else if (pendingAction === 'CLEAR_LOGS') clearLogs();
    else if (pendingAction === 'FACTORY_RESET') clearAllData();
    else if (pendingAction === 'RESTORE_SNAP' && selectedSnapshotPath) {
      await restoreFromSnapshot(selectedSnapshotPath);
    }

    setTimeout(() => {
      setIsProcessing(false);
      setPendingAction(null);
      setConfirmText('');
      setSelectedSnapshotPath(null);
      refreshStats();
      alert('Operação concluída com sucesso!');
    }, 500);
  };

  const handleDeleteSnap = async (path: string) => {
    if (confirm('Excluir este ponto de restauração permanentemente?')) {
      await deleteSnapshot(path);
      const list = await listInternalSnapshots();
      setSnapshots(list);
    }
  };

  return (
    <div className="space-y-6 mt-8">
      {/* Security Modal Overlay */}
      {pendingAction && (
        <div className="fixed inset-0 z-[3000] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-8 w-[92%] max-w-sm border-4 border-rose-500 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <ShieldAlert className="w-10 h-10 animate-pulse" />
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Ação de Segurança</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed px-2">
                {pendingAction === 'RESTORE_SNAP' ?
                  'A restauração irá substituir todos os dados atuais pelos salvos neste ponto.' :
                  `Você vai apagar registros permanentes do sistema. Esta ação não tem volta.`
                }
              </p>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <label className="block text-[10px] font-black text-slate-400 uppercase text-center tracking-[0.2em]">
                Digite <span className="text-rose-600">CONFIRMAR</span> para prosseguir
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                placeholder="..."
                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-center font-black text-sky-950 focus:border-rose-500 outline-none transition-all uppercase"
              />
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={executeAction}
                disabled={confirmText !== CONFIRM_PHRASE || isProcessing}
                className="w-full py-4 bg-rose-600 disabled:bg-slate-200 text-white font-black text-sm rounded-2xl shadow-lg transition-all active:scale-95 uppercase tracking-widest flex items-center justify-center gap-2"
              >
                {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                Confirmar Agora
              </button>
              <button
                onClick={() => setPendingAction(null)}
                className="w-full py-3.5 bg-slate-100 text-slate-500 font-black text-xs rounded-2xl"
              >
                VOLTAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. BACKUP EXTERNO (NUVEM/DRIVE) */}
      <div className="bg-white rounded-3xl border-2 border-slate-100 overflow-hidden shadow-sm">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-600 text-white rounded-xl">
              <CloudUpload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-sm uppercase tracking-tight">Sincronização em Nuvem (Supabase)</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Enviar dados locais para o servidor</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
              isOnline ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200'
            }`}>
              {isOnline ? <Wifi className="w-3 h-3 text-emerald-600 animate-pulse" /> : <WifiOff className="w-3 h-3 text-rose-600" />}
              {isOnline ? 'Online' : 'Offline'}
            </span>
            {pendingSync > 0 && (
              <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-3 py-1 rounded-full animate-pulse border border-amber-200">
                {pendingSync} PENDENTES
              </span>
            )}
          </div>
        </div>

        {/* Progress bar during sync */}
        {isProcessing && syncProgress > 0 && (
          <div className="px-6 pt-4 pb-2 space-y-1.5 bg-sky-50/50 border-b border-sky-100 animate-in fade-in duration-200">
            <div className="flex justify-between items-center text-[11px] font-black uppercase text-sky-950">
              <span>{syncStatusText}</span>
              <span>{syncProgress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3.5 overflow-hidden border border-slate-300 shadow-inner">
              <div
                className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${syncProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleSyncCloud}
              disabled={!isOnline || isProcessing}
              className={`flex items-center justify-between p-5 border-2 rounded-[24px] transition-all active:scale-95 group shadow-xs ${
                !isOnline
                  ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                  : 'bg-sky-50 border-sky-200 hover:border-sky-600 cursor-pointer'
              }`}
              title={!isOnline ? 'Disponível apenas quando o dispositivo estiver online' : 'Enviar base local para o Supabase'}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl shadow-lg transition-transform ${!isOnline ? 'bg-slate-400 text-white' : 'bg-sky-600 text-white group-hover:scale-110'}`}>
                  <RefreshCw className={`w-6 h-6 ${isProcessing ? 'animate-spin' : ''}`} />
                </div>
                <div className="text-left">
                  <span className="block text-sm font-black text-sky-950 uppercase">
                    {!isOnline ? 'Sincronizar (Offline)' : 'Sincronizar Tudo'}
                  </span>
                  <span className="block text-[10px] text-sky-700 font-medium">
                    {!isOnline ? 'Conecte-se à internet para habilitar' : 'Enviar base local para o Supabase'}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-sky-400" />
            </button>

            <button
              onClick={handleBackup}
              disabled={isProcessing}
              className="flex items-center justify-between p-5 bg-white border-2 border-slate-100 hover:border-slate-400 rounded-[24px] transition-all active:scale-95 group shadow-xs cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-800 text-white rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                  <FileJson className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <span className="block text-sm font-black text-slate-800 uppercase">Exportar JSON</span>
                  <span className="block text-[10px] text-slate-500 font-medium">Backup manual (Drive/WhatsApp)</span>
                </div>
              </div>
              <Share2 className="w-5 h-5 text-slate-300" />
            </button>

            <button
              onClick={handleRestoreClick}
              disabled={isProcessing}
              className="flex items-center justify-between p-5 bg-white border-2 border-slate-100 hover:border-sky-400 rounded-[24px] transition-all active:scale-95 group shadow-xs cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-sky-700 text-white rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <span className="block text-sm font-black text-slate-800 uppercase">Importar JSON</span>
                  <span className="block text-[10px] text-slate-500 font-medium">Restaurar arquivo de backup (.json)</span>
                </div>
              </div>
              <CloudUpload className="w-5 h-5 text-slate-300" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
        </div>
      </div>

      {/* 2. PONTOS DE RESTAURAÇÃO INTERNOS */}
      <div className="bg-white rounded-3xl border-2 border-slate-100 overflow-hidden shadow-sm">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400 text-sky-950 rounded-xl">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-sm uppercase tracking-tight">Máquina do Tempo (Interno)</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Restaurar base para estado anterior</p>
            </div>
          </div>
          <button
            onClick={handleCreateSnapshot}
            className="p-2 bg-sky-900 text-white rounded-xl hover:bg-sky-800 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 max-h-[400px] overflow-y-auto">
          {snapshots.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
               Sem pontos salvos no dispositivo
            </div>
          ) : (
            <div className="space-y-3">
              {snapshots.map((snap) => (
                <div key={snap.path} className="flex items-center justify-between p-4 bg-white border-2 border-slate-50 rounded-2xl shadow-xs hover:border-sky-300 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${snap.isAuto ? 'bg-slate-100 text-slate-400' : 'bg-sky-50 text-sky-600'}`}>
                      {snap.isAuto ? <RefreshCw className="w-4 h-4" /> : <FileJson className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="block text-[11px] font-black text-slate-800 uppercase leading-tight">{snap.name}</span>
                      <span className="block text-[9px] text-slate-400 font-mono mt-0.5">{new Date(snap.timestamp).toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleRestoreSnapshotClick(snap.path)}
                      className="px-3 py-1.5 bg-sky-50 text-sky-700 rounded-lg text-[9px] font-black uppercase hover:bg-sky-600 hover:text-white transition-all cursor-pointer"
                    >
                      Voltar
                    </button>
                    <button onClick={() => handleDeleteSnap(snap.path)} className="p-1.5 text-slate-300 hover:text-rose-600 transition-colors cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. LIMPEZA SELETIVA */}
      <div className="bg-white rounded-3xl border-2 border-slate-100 overflow-hidden shadow-sm">
        <div className="bg-rose-50/50 px-6 py-4 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-600 text-white rounded-xl">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-sm uppercase tracking-tight text-rose-900">Limpeza e Manutenção</h3>
              <p className="text-[10px] text-rose-600 font-bold uppercase">Remoção definitiva de registros</p>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
           <button
              onClick={() => setPendingAction('CLEAR_MOV')}
              className="flex items-center gap-3 p-4 bg-white border-2 border-slate-100 hover:border-rose-400 rounded-2xl transition-all active:scale-95 group shadow-xs cursor-pointer"
            >
              <div className="p-2 bg-rose-50 text-rose-500 rounded-xl group-hover:bg-rose-500 group-hover:text-white transition-colors"><Database className="w-5 h-5" /></div>
              <div className="text-left">
                <span className="block text-xs font-black text-slate-700 uppercase">Limpar Pousos</span>
                <span className="block text-[9px] text-slate-400 font-bold uppercase">{stats.totalMov} Itens</span>
              </div>
            </button>

            <button
              onClick={() => setPendingAction('CLEAR_LOGS')}
              className="flex items-center gap-3 p-4 bg-white border-2 border-slate-100 hover:border-rose-400 rounded-2xl transition-all active:scale-95 group shadow-xs cursor-pointer"
            >
              <div className="p-2 bg-rose-50 text-rose-500 rounded-xl group-hover:bg-rose-500 group-hover:text-white transition-colors"><ShieldAlert className="w-5 h-5" /></div>
              <div className="text-left">
                <span className="block text-xs font-black text-slate-700 uppercase">Limpar Logs</span>
                <span className="block text-[9px] text-slate-400 font-bold uppercase">{stats.totalLogs} Itens</span>
              </div>
            </button>

            <button
              onClick={() => setPendingAction('FACTORY_RESET')}
              className="flex items-center justify-center gap-3 p-4 bg-rose-600 text-white rounded-2xl transition-all hover:bg-rose-700 shadow-lg active:scale-95 font-black text-xs uppercase tracking-widest cursor-pointer"
            >
              <RefreshCw className="w-5 h-5" />
              Reset Total
            </button>
        </div>
      </div>
    </div>
  );
};
