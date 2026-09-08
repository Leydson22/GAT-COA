import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './lib/supabase';
import { Login } from './components/Login';
import { Header } from './components/Header';
import { QuickFilters } from './components/QuickFilters';
import { KPIScorecards } from './components/KPIScorecards';
import { VisualCharts } from './components/VisualCharts';
import { OperationalTable } from './components/OperationalTable';
import { MobileQuickEntry } from './components/MobileQuickEntry';
import { RecentLandingsScreen } from './components/RecentLandingsScreen';
import { NewRegistrationModal } from './components/NewRegistrationModal';
import { DocumentationModal } from './components/DocumentationModal';
import { ExportModal } from './components/ExportModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { SystemLogViewer } from './components/SystemLogViewer';
import { UserManagement } from './components/UserManagement';
import { DataManagementPanel } from './components/DataManagementPanel';
import { DailyOperationalReport, ManagementReport, ShiftHandoverReport, AirlineSpecificReport } from './components/ReportTemplates';
import { checkAndRunAutoBackup, saveInternalSnapshot } from './services/dataManagementService';
import { syncData, addToSyncQueue } from './services/syncService';
import { getAirlines } from './services/airlineService';
import { MOCK_MOVIMENTACOES } from './data/mockData';
import { MovimentacaoAeronave, FiltrosDashboard, StatSummary, AuditLog, CompanhiaAerea } from './types';
import { getAuditLogs, addAuditLog, clearAuditLogs } from './services/auditLogService';
import { Smartphone, ListOrdered, BarChart3, ChevronRight, Plane, Download, LogOut, ShieldCheck, Loader2, Users, Clock } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';

const STORAGE_KEY = 'cgb_movimentacoes_data_v1';
type ActiveScreen = 'home' | 'cadastro' | 'pousos' | 'relatorios' | 'exportar' | 'seguranca' | 'usuarios';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<{ role: 'admin' | 'operator'; approved: boolean } | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('home');
  const [autoReportMode, setAutoReportMode] = useState<'OPERATIONAL' | 'MANAGEMENT' | 'SHIFTHANDOVER' | 'AIRLINE' | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => getAuditLogs());
  const [companhias, setCompanhias] = useState<CompanhiaAerea[]>(() => getAirlines());
  const [filtros, setFiltros] = useState<FiltrosDashboard>({ nome_companhia: 'TODAS', desembarque_hibrido: 'TODOS', dataInicio: '', dataFim: '', buscaMatricula: '' });

  // 1. Auth Listener
  useEffect(() => {
    const fetchProfile = async (uid: string) => {
      const { data } = await supabase.from('profiles').select('role, approved').eq('id', uid).single();
      setUserProfile(data);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
        syncData();
      }
      setIsAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
        syncData();
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoAeronave[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (err) {}
    return MOCK_MOVIMENTACOES;
  });

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(movimentacoes)); }, [movimentacoes]);

  useEffect(() => {
    if (!session) return;
    const run = async () => {
      const saved = localStorage.getItem('cgb_backup_config');
      const config = saved ? JSON.parse(saved) : { autoEnabled: true, frequency: 'WEEKLY' };
      await checkAndRunAutoBackup(config);
    };
    run();
  }, [session]);

  useEffect(() => {
    if (activeScreen === 'cadastro' || activeScreen === 'relatorios') {
      setCompanhias(getAirlines());
    }
  }, [activeScreen]);

  const movimentacoesOrdenadas = useMemo(() => {
    const filtradas = movimentacoes.filter((item) => {
      if (filtros.nome_companhia === 'SOMENTE_AIRLINES') {
        const nonAirlines = ['outros', 'forças armadas brasileiras'];
        if (nonAirlines.includes(item.nome_companhia.toLowerCase())) return false;
      } else if (filtros.nome_companhia !== 'TODAS' && item.nome_companhia.toLowerCase() !== filtros.nome_companhia.toLowerCase()) {
        return false;
      }
      if (filtros.desembarque_hibrido !== 'TODOS' && item.desembarque_hibrido !== filtros.desembarque_hibrido) return false;
      if (filtros.buscaMatricula.trim() && !item.matricula.toUpperCase().includes(filtros.buscaMatricula.toUpperCase())) return false;
      if (filtros.dataInicio && item.data_cadastro < filtros.dataInicio) return false;
      if (filtros.dataFim && item.data_cadastro > filtros.dataFim) return false;
      return true;
    });
    return [...filtradas].sort((a, b) => `${b.data_cadastro}T${b.horario_cadastro}`.localeCompare(`${a.data_cadastro}T${a.horario_cadastro}`));
  }, [movimentacoes, filtros]);

  const stats: StatSummary = useMemo(() => {
    const total = movimentacoesOrdenadas.length;
    const hibrido = movimentacoesOrdenadas.filter(i => i.desembarque_hibrido === 'Sim').length;
    const counts: any = {};
    movimentacoesOrdenadas.forEach(i => { counts[i.nome_companhia] = (counts[i.nome_companhia] || 0) + 1; });
    let top = 'N/A'; let topC = 0;
    Object.entries(counts).forEach(([n, c]: any) => { if (c > topC) { topC = c; top = n; } });
    return { totalMovimentacoes: total, totalHibrido: hibrido, taxaHibrido: total > 0 ? (hibrido/total)*100 : 0, topCompanhia: { nome: top, total: topC, percentual: total > 0 ? (topC/total)*100 : 0 } };
  }, [movimentacoesOrdenadas]);

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MovimentacaoAeronave | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<MovimentacaoAeronave | null>(null);
  const [reportMode, setReportMode] = useState<'OPERATIONAL' | 'MANAGEMENT' | 'SHIFTHANDOVER' | 'AIRLINE'>('OPERATIONAL');
  const [exportContext, setExportContext] = useState<any>({ data: [], filters: { dataInicio: '', dataFim: '' } });
  const [printData, setPrintData] = useState<any>({ data: [], stats: { totalMovimentacoes: 0, totalHibrido: 0, taxaHibrido: 0, topCompanhia: { nome: '', total: 0, percentual: 0 } }, period: '' });
  const [selectedAirline, setSelectedAirline] = useState('');

  const handleOpenExport = (data?: any, filters?: any, auto?: any) => {
    const d = data || movimentacoesOrdenadas;
    setExportContext({ data: d, filters: filters || { dataInicio: filtros.dataInicio, dataFim: filtros.dataFim } });
    setPrintData({ data: d, stats: stats, period: '' });
    setAutoReportMode(auto || null);
    setActiveScreen('exportar');
  };

  const handleToggleHibrido = (id: string) => {
    setMovimentacoes(prev => prev.map(item => {
      if (item.id_registro === id) {
        const novoStatus = item.desembarque_hibrido === 'Sim' ? 'Não' : 'Sim';
        return { ...item, desembarque_hibrido: novoStatus };
      }
      return item;
    }));
    addToSyncQueue(id);
    syncData();
    setAuditLogs(getAuditLogs());
  };

  const handleSaveRecord = (data: any, id?: string) => {
    const regId = id || `REG-${Date.now()}`;
    if (id) setMovimentacoes(prev => prev.map(i => i.id_registro === id ? { ...i, ...data } : i));
    else setMovimentacoes(prev => [{ id_registro: regId, ...data }, ...prev]);
    addToSyncQueue(regId);
    syncData();
    setAuditLogs(getAuditLogs());
  };

  const handleRefreshData = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    setMovimentacoes(saved ? JSON.parse(saved) : []);
    setAuditLogs(getAuditLogs());
    setCompanhias(getAirlines());
    setActiveScreen('home');
  };

  const handleExitApp = async () => {
    if (window.confirm("Sair?")) {
      if (window.confirm("Backup antes de sair?")) await saveInternalSnapshot(`Backup Preventivo ${new Date().toLocaleString()}`);
      await supabase.auth.signOut();
      if (Capacitor.isNativePlatform()) CapacitorApp.exitApp();
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-sky-950 flex flex-col items-center justify-center text-white p-6 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-amber-400 mb-4" />
        <p className="text-xs font-black uppercase tracking-widest opacity-50">Iniciando Sistema COA...</p>
      </div>
    );
  }

  if (session && userProfile && userProfile.approved === false) {
    return (
      <div className="min-h-screen bg-sky-950 flex flex-col items-center justify-center text-white p-6 text-center space-y-4">
        <div className="w-16 h-16 bg-amber-400 text-sky-950 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
          <Clock className="w-8 h-8 animate-spin" />
        </div>
        <h2 className="text-xl font-black uppercase tracking-tight">Aprovação Pendente</h2>
        <p className="text-xs text-sky-200 font-medium max-w-sm leading-relaxed">
          Sua conta foi criada com sucesso, mas aguarda a aprovação de um Administrador para liberar o seu acesso ao sistema.
        </p>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            setSession(null);
            setUserProfile(null);
          }}
          className="mt-4 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
        >
          Sair / Voltar
        </button>
      </div>
    );
  }

  if (!session) return <Login />;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 selection:bg-sky-200 overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full opacity-0 pointer-events-none print:opacity-100 print:relative printable-content">
        {reportMode === 'OPERATIONAL' ? <DailyOperationalReport movimentacoes={printData.data} stats={printData.stats} periodo={printData.period} title="Geral" /> :
         reportMode === 'MANAGEMENT' ? <ManagementReport movimentacoes={printData.data} stats={printData.stats} periodo={printData.period} title="BI" /> :
         <ShiftHandoverReport movimentacoes={printData.data} stats={printData.stats} periodo={printData.period} title="Turno" />}
      </div>
      <Header activeScreen={activeScreen} onNavigate={setActiveScreen} />
      <main className="flex-1 flex flex-col w-full mx-auto overflow-x-hidden p-2 sm:p-6 space-y-6">
        {activeScreen === 'home' && (
          <div className="flex-1 flex flex-col items-center justify-center my-auto py-8">
            <div className="max-w-md w-full space-y-4 px-4 text-center">
              <div className="grid grid-cols-1 gap-3">
                <button onClick={() => setActiveScreen('cadastro')} className="p-4 bg-white border-2 border-sky-100 rounded-2xl flex items-center justify-between shadow-sm"><div className="flex items-center gap-3"><div className="p-3 bg-sky-800 text-white rounded-xl shadow-md"><Smartphone /></div><div className="text-left font-black text-sky-950 uppercase text-sm">Pátio</div></div><ChevronRight className="text-sky-300"/></button>
                <button onClick={() => setActiveScreen('pousos')} className="p-4 bg-white border-2 border-amber-100 rounded-2xl flex items-center justify-between shadow-sm"><div className="flex items-center gap-3"><div className="p-3 bg-amber-400 text-sky-950 rounded-xl shadow-md"><ListOrdered /></div><div className="text-left font-black text-slate-900 uppercase text-sm">Pousos</div></div><ChevronRight className="text-amber-300"/></button>
                <button onClick={() => handleOpenExport()} className="p-4 bg-white border-2 border-emerald-100 rounded-2xl flex items-center justify-between shadow-sm"><div className="flex items-center gap-3"><div className="p-3 bg-emerald-600 text-white rounded-xl shadow-md"><Download /></div><div className="text-left font-black text-slate-900 uppercase text-sm">Relatórios</div></div><ChevronRight className="text-emerald-300"/></button>
                <button onClick={() => setActiveScreen('seguranca')} className="p-4 bg-white border-2 border-sky-100 rounded-2xl flex items-center justify-between shadow-sm"><div className="flex items-center gap-3"><div className="p-3 bg-sky-700 text-white rounded-xl shadow-md"><ShieldCheck /></div><div className="text-left font-black text-slate-900 uppercase text-sm">Segurança</div></div><ChevronRight className="text-sky-300"/></button>

                {userProfile?.role === 'admin' && (
                  <>
                    <button onClick={() => setActiveScreen('relatorios')} className="p-4 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-between shadow-sm"><div className="flex items-center gap-3"><div className="p-3 bg-slate-800 text-white rounded-xl shadow-md"><BarChart3 /></div><div className="text-left font-black text-slate-900 uppercase text-sm">Administração</div></div><ChevronRight className="text-slate-300"/></button>
                    <button onClick={() => setActiveScreen('usuarios')} className="p-4 bg-white border-2 border-sky-100 rounded-2xl flex items-center justify-between shadow-sm animate-in zoom-in-95 duration-300"><div className="flex items-center gap-3"><div className="p-3 bg-sky-600 text-white rounded-xl shadow-md"><Users /></div><div className="text-left font-black text-sky-950 uppercase text-sm">Equipe</div></div><ChevronRight className="text-sky-300"/></button>
                  </>
                )}

                <button onClick={handleExitApp} className="p-4 bg-white border-2 border-rose-100 rounded-2xl flex items-center justify-between shadow-sm"><div className="flex items-center gap-3"><div className="p-3 bg-rose-600 text-white rounded-xl shadow-md"><LogOut /></div><div className="text-left font-black text-slate-900 uppercase text-sm leading-none">Sair</div></div><ChevronRight className="text-rose-300"/></button>
              </div>
            </div>
          </div>
        )}
        {activeScreen === 'cadastro' && <MobileQuickEntry companhias={companhias} onSaveRecord={handleSaveRecord} onClose={() => setActiveScreen('home')} />}
        {activeScreen === 'pousos' && <RecentLandingsScreen movimentacoes={movimentacoes} onEditRecord={(r) => { setEditingRecord(r); setIsNewModalOpen(true); }} onToggleHibrido={handleToggleHibrido} onNavigateToCadastro={() => setActiveScreen('cadastro')} onClose={() => setActiveScreen('home')} onOpenExport={handleOpenExport} />}
        {activeScreen === 'relatorios' && (
          <div className="space-y-6">
            <QuickFilters filtros={filtros} setFiltros={setFiltros} companhias={companhias} totalFiltrados={movimentacoesOrdenadas.length} totalGeral={movimentacoes.length} />
            <KPIScorecards stats={stats} />
            <VisualCharts movimentacoes={movimentacoesOrdenadas} />
            <OperationalTable movimentacoes={movimentacoesOrdenadas} onEditRecord={(r) => { setEditingRecord(r); setIsNewModalOpen(true); }} onDeleteRecord={setDeletingRecord} onToggleHibrido={handleToggleHibrido} onOpenExport={handleOpenExport} />
            <SystemLogViewer logs={auditLogs} />
          </div>
        )}
        {activeScreen === 'exportar' && <ExportModal isOpen={true} onClose={() => setActiveScreen('home')} movimentacoes={exportContext.data} stats={stats} onPreparePrint={(d, s, m, p) => { setPrintData({ data: d, stats: s, period: p }); setReportMode(m); }} initialFilters={exportContext.filters} companhias={companhias} autoTriggerMode={autoReportMode} />}
        {activeScreen === 'seguranca' && <DataManagementPanel onDataRestored={handleRefreshData} />}
        {activeScreen === 'usuarios' && <UserManagement />}
      </main>
      <NewRegistrationModal isOpen={isNewModalOpen} onClose={() => { setIsNewModalOpen(false); setEditingRecord(null); }} onSave={handleSaveRecord} companhias={companhias} editingRecord={editingRecord} />
      <ConfirmDeleteModal isOpen={deletingRecord !== null} record={deletingRecord} onClose={() => setDeletingRecord(null)} onConfirm={(id) => { const t = movimentacoes.find(m => m.id_registro === id); setMovimentacoes(prev => prev.filter(i => i.id_registro !== id)); if(t) addAuditLog({ tipo: 'EXCLUSAO', nivel: 'AVISO', origem: 'AREA_ADM', usuarioDispositivo: 'ADM', descricao: `Exclusão`, matriculaAeronave: t.matricula }); setAuditLogs(getAuditLogs()); }} />
    </div>
  );
}
