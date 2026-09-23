import React, { useRef, useState, useEffect } from 'react';
import {
  Database, Download, Upload, Trash2, AlertTriangle, ShieldCheck,
  FileJson, X, ShieldAlert, CheckCircle2, RefreshCw, Clock,
  History, Settings2, ShieldQuestion, Trash, CloudDownload, CloudUpload,
  FileText, Share2, Info, PlusCircle, Edit2, ChevronRight, Wifi, WifiOff, Shield, ArrowLeft
} from 'lucide-react';
import {
  generateBackup, restoreBackup, clearAllData, clearLogs,
  clearMovimentacoes, getDatabaseStats, listInternalSnapshots,
  saveInternalSnapshot, restoreFromSnapshot, deleteSnapshot,
  SnapshotMetadata, BackupConfig
} from '../services/dataManagementService';
import { syncAllLocalData, pullDataFromCloud, getPendingSyncCount } from '../services/syncService';

interface DataManagementPanelProps {
  onDataRestored: () => void;
  onClose?: () => void;
}

type MaintenanceAction = 'CLEAR_MOV' | 'CLEAR_LOGS' | 'FACTORY_RESET' | 'RESTORE_SNAP' | null;

export const DataManagementPanel: React.FC<DataManagementPanelProps> = ({ onDataRestored, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingSync, setPendingSync] = useState(0);
  const [stats, setStats] = useState({ totalMov: 0, totalLogs: 0, totalModels: 0 });
  const [snapshots, setSnapshots] = useState<SnapshotMetadata[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [syncProgress, setSyncProgress] = useState<number>(0);
  const [syncStatusText, setSyncStatusText] = useState<string>('');

  const cachedProfile = localStorage.getItem('cgb_cached_profile');
  const userProfile = cachedProfile ? JSON.parse(cachedProfile) : { role: 'operator' };
  const isAdmin = userProfile.role === 'admin';

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

    const interval = setInterval(() => {
      setIsOnline(navigator.onLine);
    }, 1500);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const loadInitialData = async () => {
    setStats(getDatabaseStats());
    const list = await listInternalSnapshots();
    setSnapshots(list);
    setPendingSync(getPendingSyncCount());
  };

  const handleExportBackup = async () => {
    try {
      setIsProcessing(true);
      await generateBackup();
    } catch (err: any) {
      alert('Erro ao gerar backup: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      const text = await file.text();
      const success = await restoreBackup(text);
      if (success) {
        alert('✅ Backup restaurado com sucesso!');
        loadInitialData();
        onDataRestored();
      } else {
        alert('❌ Arquivo de backup inválido.');
      }
    } catch (err: any) {
      alert('Erro ao restaurar backup: ' + err.message);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSyncToCloud = async () => {
    try {
      setIsProcessing(true);
      setSyncStatusText('Sincronizando com Supabase...');
      await syncAllLocalData();
      setPendingSync(getPendingSyncCount());
      alert('✅ Sincronização com a nuvem concluída com sucesso!');
    } catch (err: any) {
      alert('Erro na sincronização: ' + err.message);
    } finally {
      setIsProcessing(false);
      setSyncStatusText('');
    }
  };

  const handlePullFromCloud = async () => {
    if (!confirm('Deseja baixar os dados mais recentes da nuvem Supabase?')) return;
    try {
      setIsProcessing(true);
      setSyncStatusText('Baixando dados da nuvem...');
      await pullDataFromCloud();
      loadInitialData();
      onDataRestored();
      alert('✅ Dados atualizados da nuvem com sucesso!');
    } catch (err: any) {
      alert('Erro ao puxar dados da nuvem: ' + err.message);
    } finally {
      setIsProcessing(false);
      setSyncStatusText('');
    }
  };

  const executeConfirmedAction = async () => {
    if (confirmText !== CONFIRM_PHRASE) {
      alert(`Digite "${CONFIRM_PHRASE}" para confirmar.`);
      return;
    }

    try {
      setIsProcessing(true);
      if (pendingAction === 'CLEAR_MOV') {
        clearMovimentacoes();
        alert('Registros de pátio limpos com sucesso.');
      } else if (pendingAction === 'CLEAR_LOGS') {
        clearLogs();
        alert('Logs de auditoria limpos com sucesso.');
      } else if (pendingAction === 'FACTORY_RESET') {
        clearAllData();
        alert('Sistema reiniciado para o estado de fábrica.');
      } else if (pendingAction === 'RESTORE_SNAP' && selectedSnapshotPath) {
        const ok = await restoreFromSnapshot(selectedSnapshotPath);
        if (ok) alert('Ponto de restauração aplicado com sucesso!');
        else alert('Falha ao restaurar snapshot.');
      }
      loadInitialData();
      onDataRestored();
    } catch (err: any) {
      alert('Erro na operação: ' + err.message);
    } finally {
      setIsProcessing(false);
      setPendingAction(null);
      setSelectedSnapshotPath(null);
      setConfirmText('');
    }
  };

  const handleCreateSnapshot = async () => {
    const label = prompt('Nome ou descrição para o Ponto de Restauração:', `Ponto ${new Date().toLocaleString()}`);
    if (!label) return;
    try {
      setIsProcessing(true);
      await saveInternalSnapshot(label);
      const list = await listInternalSnapshots();
      setSnapshots(list);
      alert('📸 Ponto de restauração salvo com sucesso!');
    } catch (err: any) {
      alert('Erro ao criar snapshot: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestoreSnapshotClick = (path: string) => {
    setSelectedSnapshotPath(path);
    setPendingAction('RESTORE_SNAP');
  };

  const handleDeleteSnapshot = async (path: string) => {
    if (confirm('Excluir este ponto de restauração permanentemente?')) {
      await deleteSnapshot(path);
      const list = await listInternalSnapshots();
      setSnapshots(list);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full pb-20 px-2 sm:px-0">
      {/* Header Card Standard (Amber matching Segurança tile color) */}
      <div className="bg-amber-600 text-white p-6 sm:p-8 rounded-[32px] shadow-xl relative overflow-hidden border border-amber-500">
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
               <div className="p-3 bg-white/20 rounded-2xl shadow-md"><ShieldCheck className="w-6 h-6 text-white" /></div>
               <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Segurança & Backup (CGB)</h2>
            </div>
            <p className="text-amber-100 text-xs font-bold uppercase tracking-widest pl-1">Máquina do tempo, restauração e exportação de dados</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all active:scale-95 text-xs font-black uppercase tracking-wider border border-white/20 cursor-pointer text-white shadow-md"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
          )}
        </div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
      </div>

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

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                Digite <strong className="text-rose-600">{CONFIRM_PHRASE}</strong> para autorizar:
              </label>
              <input
                type="text"
                placeholder={CONFIRM_PHRASE}
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                className="w-full bg-slate-100 border-2 border-slate-200 rounded-2xl p-3.5 text-center font-mono font-black text-sm tracking-widest text-slate-800 outline-hidden focus:border-rose-500 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => { setPendingAction(null); setConfirmText(''); setSelectedSnapshotPath(null); }}
                className="py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                disabled={confirmText !== CONFIRM_PHRASE || isProcessing}
                onClick={executeConfirmedAction}
                className="py-3.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Backup & Restore Card */}
        <div className="bg-white p-6 sm:p-8 rounded-[32px] border-2 border-slate-100 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-sky-100 text-sky-800 rounded-2xl"><Database className="w-6 h-6" /></div>
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Backup e Restauração</h3>
                <p className="text-xs text-slate-500 font-medium">Exportar arquivo .json de segurança</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs font-medium text-slate-600">
               <div className="flex justify-between"><span>Registros de Pátio:</span><strong className="font-mono text-sky-950">{stats.totalMov}</strong></div>
               <div className="flex justify-between"><span>Logs de Auditoria:</span><strong className="font-mono text-sky-950">{stats.totalLogs}</strong></div>
               <div className="flex justify-between"><span>Modelos Cadastrados:</span><strong className="font-mono text-sky-950">{stats.totalModels}</strong></div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
            <button
              onClick={handleExportBackup}
              disabled={isProcessing}
              className="w-full py-4 bg-sky-900 hover:bg-sky-950 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" /> Exportar Backup (.JSON)
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-95"
            >
              <Upload className="w-4 h-4" /> Restaurar de Arquivo...
            </button>
          </div>
        </div>

        {/* Cloud Sync Card */}
        <div className="bg-white p-6 sm:p-8 rounded-[32px] border-2 border-slate-100 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 text-indigo-800 rounded-2xl"><CloudUpload className="w-6 h-6" /></div>
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Sincronização na Nuvem</h3>
                <p className="text-xs text-slate-500 font-medium">Supabase Cloud PostgreSQL</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs font-medium text-slate-600">
               <div className="flex justify-between items-center">
                 <span>Status Conexão:</span>
                 <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                   {isOnline ? 'ONLINE' : 'OFFLINE'}
                 </span>
               </div>
               <div className="flex justify-between items-center">
                 <span>Pendentes de Envio:</span>
                 <strong className="font-mono text-indigo-950">{pendingSync} registro(s)</strong>
               </div>
               {syncStatusText && <p className="text-[11px] text-indigo-700 font-bold italic">{syncStatusText}</p>}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            <button
              onClick={handleSyncToCloud}
              disabled={isProcessing || !isOnline}
              className="w-full py-4 bg-indigo-900 hover:bg-indigo-950 disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-95"
            >
              <CloudUpload className="w-4 h-4" /> Sincronizar com a Nuvem
            </button>
            <button
              onClick={handlePullFromCloud}
              disabled={isProcessing || !isOnline}
              className="w-full py-4 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-black text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-95"
            >
              <CloudDownload className="w-4 h-4" /> Baixar Dados da Nuvem
            </button>
          </div>
        </div>

        {/* Time Machine / Snapshots Card */}
        <div className="bg-white p-6 sm:p-8 rounded-[32px] border-2 border-slate-100 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl"><History className="w-6 h-6" /></div>
                <div>
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Máquina do Tempo</h3>
                  <p className="text-xs text-slate-500 font-medium">Pontos de restauração internos</p>
                </div>
              </div>
              <button
                onClick={handleCreateSnapshot}
                disabled={isProcessing}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-sky-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
              >
                + Criar Ponto
              </button>
            </div>

            <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
              {snapshots.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs italic">Nenhum ponto de restauração salvo</div>
              ) : (
                snapshots.map((snap) => (
                  <div key={snap.path} className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
                    <div>
                      <strong className="block text-slate-800 font-bold">{snap.label}</strong>
                      <span className="text-[10px] text-slate-400 font-mono">{new Date(snap.timestamp).toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleRestoreSnapshotClick(snap.path)}
                        className="px-3 py-1.5 bg-sky-900 text-white font-bold rounded-xl text-[10px] uppercase cursor-pointer hover:bg-sky-950"
                      >
                        Restaurar
                      </button>
                      <button
                        onClick={() => handleDeleteSnapshot(snap.path)}
                        className="p-1.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            {isAdmin ? (
              <button
                onClick={() => setPendingAction('FACTORY_RESET')}
                disabled={isProcessing}
                className="w-full py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-black text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Reset de Fábrica (Apagar Tudo)
              </button>
            ) : (
              <p className="text-[11px] text-slate-400 text-center font-medium italic">
                Ações de reset restritas a administradores.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
