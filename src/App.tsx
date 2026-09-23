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
import { ProgramacaoScreen } from './components/ProgramacaoScreen';
import { AdminDashboardScreen } from './components/AdminDashboardScreen';
import { DailyOperationalReport, ManagementReport, ShiftHandoverReport, AirlineSpecificReport } from './components/ReportTemplates';
import { checkAndRunAutoBackup, saveInternalSnapshot } from './services/dataManagementService';
import { syncData, addToSyncQueue } from './services/syncService';
import { getAirlines } from './services/airlineService';
import { MOCK_MOVIMENTACOES } from './data/mockData';
import { MovimentacaoAeronave, FiltrosDashboard, StatSummary, AuditLog, CompanhiaAerea } from './types';
import { getAuditLogs, addAuditLog, clearAuditLogs } from './services/auditLogService';
import { Smartphone, ListOrdered, BarChart3, ChevronRight, Plane, Download, LogOut, ShieldCheck, Loader2, Users, Clock, Globe } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';

const STORAGE_KEY = 'cgb_movimentacoes_data_v1';
type ActiveScreen = 'home' | 'cadastro' | 'pousos' | 'relatorios' | 'exportar' | 'seguranca' | 'usuarios' | 'programacao';

export default function App() {
  const [session, setSession] = useState<any>(() => {
    try {
      const cached = localStorage.getItem('cgb_cached_session');
      return cached ? JSON.parse(cached) : null;
    } catch (e) { return null; }
  });

  const [userProfile, setUserProfile] = useState<{ role: 'admin' | 'operator'; approved: boolean } | null>(() => {
    try {
      const cached = localStorage.getItem('cgb_cached_profile');
      return cached ? JSON.parse(cached) : null;
    } catch (e) { return null; }
  });

  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('home');
  const [autoReportMode, setAutoReportMode] = useState<'OPERATIONAL' | 'MANAGEMENT' | 'SHIFTHANDOVER' | 'AIRLINE' | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => getAuditLogs());
  const [companhias, setCompanhias] = useState<CompanhiaAerea[]>(() => getAirlines());
  const [filtros, setFiltros] = useState<FiltrosDashboard>({ nome_companhia: 'TODAS', desembarque_hibrido: 'TODOS', dataInicio: '', dataFim: '', buscaMatricula: '' });

  // 1. Auth & Persistent Offline Session
  useEffect(() => {
    const fetchProfile = async (uid: string, userEmail?: string) => {
      if (!navigator.onLine) {
        const cachedProfile = localStorage.getItem('cgb_cached_profile');
        if (cachedProfile) {
          setUserProfile(JSON.parse(cachedProfile));
        } else {
          setUserProfile({ role: 'operator', approved: true });
        }
        return;
      }

      try {
        let { data, error } = await supabase.from('profiles').select('role, approved').eq('id', uid).single();
        if (error || !data) {
          const { data: newProfile } = await supabase
            .from('profiles')
            .upsert({ id: uid, email: userEmail || '', role: 'operator', approved: false })
            .select('role, approved')
            .single();
          data = newProfile;
        }
        if (data) {
          setUserProfile(data);
          localStorage.setItem('cgb_cached_profile', JSON.stringify(data));
        }
      } catch (err) {
        const cachedProfile = localStorage.getItem('cgb_cached_profile');
        if (cachedProfile) setUserProfile(JSON.parse(cachedProfile));
      }
    };

    const initAuth = async () => {
      try {
        if (navigator.onLine) {
          const { data: { session: remoteSession } } = await supabase.auth.getSession();
          if (remoteSession) {
            setSession(remoteSession);
            localStorage.setItem('cgb_cached_session', JSON.stringify(remoteSession));
            await fetchProfile(remoteSession.user.id, remoteSession.user.email);
            syncData();
          }
        }
      } catch (err) {
      } finally {
        setIsAuthLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, remoteSession) => {
      if (remoteSession) {
        setSession(remoteSession);
        localStorage.setItem('cgb_cached_session', JSON.stringify(remoteSession));
        await fetchProfile(remoteSession.user.id, remoteSession.user.email);
        if (navigator.onLine) syncData();
      }
    });

    const handleOnline = () => {
      if (navigator.onLine) {
        syncData();
      }
    };
    window.addEventListener('online', handleOnline);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('online', handleOnline);
    };
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

  const movimentacoesPermitidas = useMemo(() => {
    if (userProfile?.role === 'operator' && session?.user?.id) {
      return movimentacoes.filter(item => !item.user_id || item.user_id === session.user.id);
    }
    return movimentacoes;
  }, [movimentacoes, userProfile, session]);

  const movimentacoesOrdenadas = useMemo(() => {
    const filtradas = movimentacoesPermitidas.filter((item) => {
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
    return [...filtradas].sort((a, b) => {
      const timeA = new Date(`${a.data_cadastro || '1970-01-01'}T${a.horario_cadastro || '00:00:00'}`).getTime() || 0;
      const timeB = new Date(`${b.data_cadastro || '1970-01-01'}T${b.horario_cadastro || '00:00:00'}`).getTime() || 0;
      return timeB - timeA;
    });
  }, [movimentacoesPermitidas, filtros]);

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
    const d = data || movimentacoesPermitidas;
    setExportContext({ data: d, filters: { dataInicio: '', dataFim: '' } });
    setPrintData({ data: d, stats: stats, period: '' });
    setAutoReportMode(auto || null);
    setActiveScreen('exportar');
  };

  const handleToggleHibrido = (id: string) => {
    const existing = movimentacoes.find(m => m.id_registro === id);
    if (userProfile?.role === 'operator' && existing?.user_id && existing.user_id !== session?.user?.id) {
      alert('⚠️ Permissão negada: você só pode modificar seus próprios registros.');
      return;
    }

    setMovimentacoes(prev => prev.map(item => {
      if (item.id_registro === id) {
        const novoStatus = item.desembarque_hibrido === 'Sim' ? 'Não' : 'Sim';
        return { ...item, desembarque_hibrido: novoStatus };
      }
      return item;
    }));
    addToSyncQueue(id);
    if (navigator.onLine) syncData();
    setAuditLogs(getAuditLogs());
  };

  const handleSaveRecord = (data: any, id?: string) => {
    if (id) {
      const existing = movimentacoes.find(m => m.id_registro === id);
      if (userProfile?.role === 'operator' && existing?.user_id && existing.user_id !== session?.user?.id) {
        alert('⚠️ Permissão negada: você só pode modificar seus próprios registros.');
        return;
      }
    }

    const regId = id || `REG-${Date.now()}`;
    const recordData = {
      ...data,
      user_id: session?.user?.id,
      user_email: session?.user?.email
    };

    if (id) setMovimentacoes(prev => prev.map(i => i.id_registro === id ? { ...i, ...recordData } : i));
    else setMovimentacoes(prev => [{ id_registro: regId, ...recordData }, ...prev]);

    addToSyncQueue(regId);
    if (navigator.onLine) syncData();
    addAuditLog({
      tipo: id ? 'EDICAO' : 'CRIACAO',
      nivel: 'INFO',
      origem: 'PATIO_MOBILE',
      usuarioDispositivo: session?.user?.email || 'Usuário',
      descricao: `${id ? 'Edição' : 'Criação'} de movimentação ${data.matricula} por ${session?.user?.email || 'Usuário'}`,
      matriculaAeronave: data.matricula
    });
    setAuditLogs(getAuditLogs());
  };

  const handleImportFlight = (flight: { matricula: string; nome_companhia: string; horario_cadastro: string; posicao_patio: string }) => {
    const newRecord: MovimentacaoAeronave = {
      id_registro: `siv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      matricula: flight.matricula,
      nome_companhia: flight.nome_companhia,
      id_companhia: 1,
      desembarque_hibrido: 'Não',
      posicao_patio: flight.posicao_patio,
      horario_cadastro: flight.horario_cadastro,
      data_cadastro: new Date().toISOString().split('T')[0],
      user_id: session?.user?.id || 'siv_system',
      user_email: session?.user?.email || 'SIV Bot'
    };
    setMovimentacoes(prev => [newRecord, ...prev]);
    addAuditLog({
      tipo: 'CRIACAO',
      nivel: 'INFO',
      origem: 'PATIO_MOBILE',
      usuarioDispositivo: session?.user?.email || 'SIV Bot',
      descricao: `Importado via Programação SIV: Voo ${flight.matricula} (${flight.nome_companhia}), Box ${flight.posicao_patio}`,
      matriculaAeronave: flight.matricula
    });
    alert(`✅ Voo ${flight.matricula} (${flight.nome_companhia}) importado com sucesso para o pátio de CGB!`);
  };

  const handleRefreshData = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    setMovimentacoes(saved ? JSON.parse(saved) : []);
    setAuditLogs(getAuditLogs());
    setCompanhias(getAirlines());
    setActiveScreen('home');
  };

  const handleExitApp = async () => {
    if (window.confirm("Deseja sair do sistema? Será necessário refazer o login caso queira entrar novamente.")) {
      if (window.confirm("Deseja fazer backup antes de sair?")) await saveInternalSnapshot(`Backup Preventivo ${new Date().toLocaleString()}`);
      localStorage.removeItem('cgb_cached_session');
      localStorage.removeItem('cgb_cached_profile');
      if (navigator.onLine) {
        await supabase.auth.signOut();
      }
      setSession(null);
      setUserProfile(null);
      if (Capacitor.isNativePlatform()) CapacitorApp.exitApp();
    }
  };

  if (!session) return <Login />;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 selection:bg-sky-200 overflow-x-hidden">
      <div id="report-container" className="absolute top-0 left-0 w-full opacity-0 pointer-events-none print:opacity-100 print:relative printable-content">
        {reportMode === 'OPERATIONAL' ? <DailyOperationalReport movimentacoes={printData.data} stats={printData.stats} periodo={printData.period} title="Geral" /> :
         reportMode === 'MANAGEMENT' ? <ManagementReport movimentacoes={printData.data} stats={printData.stats} periodo={printData.period} title="BI" /> :
         <ShiftHandoverReport movimentacoes={printData.data} stats={printData.stats} periodo={printData.period} title="Turno" />}
      </div>
      <Header activeScreen={activeScreen} onNavigate={setActiveScreen} />
      <main className="flex-1 flex flex-col w-full mx-auto overflow-x-hidden p-2 sm:p-6 space-y-6">
        {activeScreen === 'home' && (
          userProfile?.role === 'admin' ? (
            <AdminDashboardScreen movimentacoes={movimentacoesOrdenadas} stats={stats} onNavigate={setActiveScreen} onOpenExport={handleOpenExport} handleExitApp={handleExitApp} />
          ) : (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Metro Tile Navigation Menu (Inspired by reference photo - Fully Responsive for 800x600+) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-3 sm:gap-4">
                <button
                  onClick={() => setActiveScreen('programacao')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-5 sm:p-6 rounded-3xl shadow-lg flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer border border-indigo-500/30"
                >
                  <div className="p-3 bg-white/20 rounded-2xl group-hover:scale-110 transition-transform">
                    <Globe className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-black tracking-widest uppercase text-white">Programação</span>
                </button>

                <button
                  onClick={() => setActiveScreen('cadastro')}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-5 sm:p-6 rounded-3xl shadow-lg flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer border border-blue-500/30"
                >
                  <div className="p-3 bg-white/20 rounded-2xl group-hover:scale-110 transition-transform">
                    <Smartphone className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-black tracking-widest uppercase text-white">Pátio</span>
                </button>

                <button
                  onClick={() => setActiveScreen('pousos')}
                  className="bg-sky-500 hover:bg-sky-600 text-white p-5 sm:p-6 rounded-3xl shadow-lg flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer border border-sky-400/30"
                >
                  <div className="p-3 bg-white/20 rounded-2xl group-hover:scale-110 transition-transform">
                    <ListOrdered className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-black tracking-widest uppercase text-white">Pousos</span>
                </button>

                <button
                  onClick={() => handleOpenExport()}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white p-5 sm:p-6 rounded-3xl shadow-lg flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer border border-emerald-400/30"
                >
                  <div className="p-3 bg-white/20 rounded-2xl group-hover:scale-110 transition-transform">
                    <Download className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-black tracking-widest uppercase text-white">Relatórios</span>
                </button>

                <button
                  onClick={() => setActiveScreen('seguranca')}
                  className="bg-amber-500 hover:bg-amber-600 text-white p-5 sm:p-6 rounded-3xl shadow-lg flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer border border-amber-400/30"
                >
                  <div className="p-3 bg-white/20 rounded-2xl group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-black tracking-widest uppercase text-white">Segurança</span>
                </button>

                <button
                  onClick={() => setActiveScreen('usuarios')}
                  className="bg-teal-600 hover:bg-teal-700 text-white p-5 sm:p-6 rounded-3xl shadow-lg flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer border border-teal-500/30"
                >
                  <div className="p-3 bg-white/20 rounded-2xl group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-black tracking-widest uppercase text-white">Equipe</span>
                </button>

                <button
                  onClick={handleExitApp}
                  className="bg-rose-600 hover:bg-rose-700 text-white p-5 sm:p-6 rounded-3xl shadow-lg flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer border border-rose-500/30"
                >
                  <div className="p-3 bg-white/20 rounded-2xl group-hover:scale-110 transition-transform">
                    <LogOut className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-black tracking-widest uppercase text-white">Sair</span>
                </button>
              </div>

              {/* CRM Quick Filters & KPIs */}
              <QuickFilters filtros={filtros} setFiltros={setFiltros} companhias={companhias} totalFiltrados={movimentacoesOrdenadas.length} totalGeral={movimentacoesPermitidas.length} />
              <KPIScorecards stats={stats} />

              {/* CRM Interactive Visual Charts */}
              <VisualCharts movimentacoes={movimentacoesOrdenadas} />

              {/* CRM Recent Operational Feed */}
              <div className="bg-white rounded-[32px] border-2 border-slate-100 overflow-hidden shadow-sm p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-black text-slate-800 text-sm uppercase tracking-tight">Atividade Recente no Pátio (CRM Stream)</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Últimos pousos e movimentações registradas</p>
                  </div>
                  <button
                    onClick={() => setActiveScreen('pousos')}
                    className="text-xs font-black text-sky-700 hover:text-sky-900 uppercase tracking-widest flex items-center gap-1 cursor-pointer"
                  >
                    Ver Todos os Pousos <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <OperationalTable movimentacoes={movimentacoesOrdenadas} onEditRecord={(r) => { setEditingRecord(r); setIsNewModalOpen(true); }} onDeleteRecord={setDeletingRecord} onToggleHibrido={handleToggleHibrido} onOpenExport={handleOpenExport} />
              </div>
            </div>
          )
        )}
        {activeScreen === 'cadastro' && <MobileQuickEntry companhias={companhias} onSaveRecord={handleSaveRecord} onClose={() => setActiveScreen('home')} />}
        {activeScreen === 'pousos' && <RecentLandingsScreen movimentacoes={movimentacoesPermitidas} onEditRecord={(r) => { setEditingRecord(r); setIsNewModalOpen(true); }} onToggleHibrido={handleToggleHibrido} onNavigateToCadastro={() => setActiveScreen('cadastro')} onClose={() => setActiveScreen('home')} onOpenExport={handleOpenExport} />}
        {activeScreen === 'programacao' && <ProgramacaoScreen onClose={() => setActiveScreen('home')} onImportFlight={handleImportFlight} />}
        {activeScreen === 'relatorios' && (
          <div className="space-y-6">
            <QuickFilters filtros={filtros} setFiltros={setFiltros} companhias={companhias} totalFiltrados={movimentacoesOrdenadas.length} totalGeral={movimentacoesPermitidas.length} />
            <KPIScorecards stats={stats} />
            <VisualCharts movimentacoes={movimentacoesOrdenadas} />
            <OperationalTable movimentacoes={movimentacoesOrdenadas} onEditRecord={(r) => { setEditingRecord(r); setIsNewModalOpen(true); }} onDeleteRecord={setDeletingRecord} onToggleHibrido={handleToggleHibrido} onOpenExport={handleOpenExport} />
            <SystemLogViewer logs={auditLogs} />
          </div>
        )}
        {activeScreen === 'exportar' && <ExportModal isOpen={true} onClose={() => setActiveScreen('home')} movimentacoes={exportContext.data} stats={stats} onPreparePrint={(d, s, m, p) => { setPrintData({ data: d, stats: s, period: p }); setReportMode(m); }} initialFilters={exportContext.filters} companhias={companhias} autoTriggerMode={autoReportMode} />}
        {activeScreen === 'seguranca' && <DataManagementPanel onDataRestored={handleRefreshData} onClose={() => setActiveScreen('home')} />}
        {activeScreen === 'usuarios' && <UserManagement onClose={() => setActiveScreen('home')} />}
      </main>
      <NewRegistrationModal isOpen={isNewModalOpen} onClose={() => { setIsNewModalOpen(false); setEditingRecord(null); }} onSave={handleSaveRecord} companhias={companhias} editingRecord={editingRecord} />
      <ConfirmDeleteModal isOpen={deletingRecord !== null} record={deletingRecord} onClose={() => setDeletingRecord(null)} onConfirm={(id) => {
        const t = movimentacoes.find(m => m.id_registro === id);
        if (userProfile?.role === 'operator' && t?.user_id && t.user_id !== session?.user?.id) {
          alert('⚠️ Permissão negada: você só pode excluir seus próprios registros.');
          return;
        }
        setMovimentacoes(prev => prev.filter(i => i.id_registro !== id));
        if(t) addAuditLog({ tipo: 'EXCLUSAO', nivel: 'AVISO', origem: 'AREA_ADM', usuarioDispositivo: session?.user?.email || 'Usuário', descricao: `Exclusão de ${t.matricula} por ${session?.user?.email || 'Usuário'}`, matriculaAeronave: t.matricula });
        setAuditLogs(getAuditLogs());
      }} />
    </div>
  );
};
