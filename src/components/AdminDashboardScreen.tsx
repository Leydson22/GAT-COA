import React, { useState, useMemo } from 'react';
import { MovimentacaoAeronave, StatSummary } from '../types';
import { KPIScorecards } from './KPIScorecards';
import { VisualCharts } from './VisualCharts';
import { Trophy, Award, Users, TrendingUp, BarChart3, Plane, CheckCircle2, Shield, Smartphone, ListOrdered, Download, ShieldCheck, LogOut, Globe, MapPin, Tag, Calendar, List, PieChart as PieChartIcon, LayoutGrid } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  CartesianGrid, Cell, PieChart, Pie, LineChart, Line
} from 'recharts';

interface AdminDashboardScreenProps {
  movimentacoes: MovimentacaoAeronave[];
  stats: StatSummary;
  onNavigate: (screen: any) => void;
  onOpenExport: () => void;
  handleExitApp: () => void;
}

type TimeframeFilter = 'HOJE' | 'SEMANA' | 'MES' | 'TUDO';
type ChartMode = 'LIST' | 'BAR' | 'PIE' | 'LINE';

const CHART_COLORS = ['#7e22ce', '#0284c7', '#d97706', '#312e81', '#10b981', '#f43f5e', '#8b5cf6', '#0ea5e9'];

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({
  movimentacoes,
  stats: initialStats,
  onNavigate,
  onOpenExport,
  handleExitApp,
}) => {
  const [timeframe, setTimeframe] = useState<TimeframeFilter>('TUDO');
  const [operatorMode, setOperatorMode] = useState<ChartMode>('LIST');
  const [airlineMode, setAirlineMode] = useState<ChartMode>('LIST');
  const [positionMode, setPositionMode] = useState<ChartMode>('LIST');
  const [modelMode, setModelMode] = useState<ChartMode>('LIST');

  const getLocalDateISO = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalDateISO(new Date());

  // Filtered movements based on timeframe (Dia, Semana, Mês, Tudo)
  const movimentacoesFiltradas = useMemo(() => {
    return movimentacoes.filter(m => {
      if (timeframe === 'HOJE') {
        return m.data_cadastro === todayStr;
      }
      if (timeframe === 'SEMANA') {
        const now = new Date();
        const day = now.getDay();
        const diffToMonday = day === 0 ? -6 : 1 - day;
        const mondayDate = new Date(now);
        mondayDate.setDate(now.getDate() + diffToMonday);
        const sundayDate = new Date(mondayDate);
        sundayDate.setDate(mondayDate.getDate() + 6);
        const mondayStr = getLocalDateISO(mondayDate);
        const sundayStr = getLocalDateISO(sundayDate);
        return m.data_cadastro >= mondayStr && m.data_cadastro <= sundayStr;
      }
      if (timeframe === 'MES') {
        const now = new Date();
        const itemDate = new Date(m.data_cadastro + 'T00:00:00');
        return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
      }
      return true; // TUDO
    });
  }, [movimentacoes, timeframe, todayStr]);

  const stats: StatSummary = useMemo(() => {
    const total = movimentacoesFiltradas.length;
    const hibrido = movimentacoesFiltradas.filter(i => i.desembarque_hibrido === 'Sim').length;
    const counts: any = {};
    movimentacoesFiltradas.forEach(i => { counts[i.nome_companhia] = (counts[i.nome_companhia] || 0) + 1; });
    let top = 'N/A'; let topC = 0;
    Object.entries(counts).forEach(([n, c]: any) => { if (c > topC) { topC = c; top = n; } });
    return { totalMovimentacoes: total, totalHibrido: hibrido, taxaHibrido: total > 0 ? (hibrido/total)*100 : 0, topCompanhia: { nome: top, total: topC, percentual: total > 0 ? (topC/total)*100 : 0 } };
  }, [movimentacoesFiltradas]);

  // 1. Top 5 Operators Ranking
  const operatorRanking = useMemo(() => {
    const map: Record<string, { total: number, hibrido: number }> = {};
    movimentacoesFiltradas.forEach(m => {
      const agent = m.usuario_dispositivo || m.user_email || 'Operador Padrão';
      if (!map[agent]) map[agent] = { total: 0, hibrido: 0 };
      map[agent].total++;
      if (m.desembarque_hibrido === 'Sim') map[agent].hibrido++;
    });
    const totalOps = movimentacoesFiltradas.length || 1;
    return Object.entries(map)
      .map(([agent, data], index) => ({
        name: agent,
        value: data.total,
        hibrido: data.hibrido,
        percentual: parseFloat(((data.total / totalOps) * 100).toFixed(1)),
        taxaHibrido: data.total > 0 ? (data.hibrido / data.total) * 100 : 0,
        color: CHART_COLORS[index % CHART_COLORS.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [movimentacoesFiltradas]);

  // 2. Top 5 Airlines Ranking
  const airlineRanking = useMemo(() => {
    const map: Record<string, number> = {};
    movimentacoesFiltradas.forEach(m => {
      map[m.nome_companhia] = (map[m.nome_companhia] || 0) + 1;
    });
    const total = movimentacoesFiltradas.length || 1;
    return Object.entries(map)
      .map(([nome, count], index) => ({
        name: nome,
        value: count,
        percentual: parseFloat(((count / total) * 100).toFixed(1)),
        color: CHART_COLORS[index % CHART_COLORS.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [movimentacoesFiltradas]);

  // 3. Top 5 Positions / Boxes Ranking
  const positionRanking = useMemo(() => {
    const map: Record<string, number> = {};
    movimentacoesFiltradas.forEach(m => {
      const pos = m.posicao_patio ? `Box ${m.posicao_patio}` : 'N/I';
      map[pos] = (map[pos] || 0) + 1;
    });
    const total = movimentacoesFiltradas.length || 1;
    return Object.entries(map)
      .map(([posicao, count], index) => ({
        name: posicao,
        value: count,
        percentual: parseFloat(((count / total) * 100).toFixed(1)),
        color: CHART_COLORS[index % CHART_COLORS.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [movimentacoesFiltradas]);

  // 4. Top 5 Aircraft Models Ranking
  const modelRanking = useMemo(() => {
    const map: Record<string, number> = {};
    movimentacoesFiltradas.forEach(m => {
      const modelo = m.tipo_aeronave ? m.tipo_aeronave.toUpperCase() : 'N/I';
      map[modelo] = (map[modelo] || 0) + 1;
    });
    const total = movimentacoesFiltradas.length || 1;
    return Object.entries(map)
      .map(([modelo, count], index) => ({
        name: modelo,
        value: count,
        percentual: parseFloat(((count / total) * 100).toFixed(1)),
        color: CHART_COLORS[index % CHART_COLORS.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [movimentacoesFiltradas]);

  const topOperator = operatorRanking[0] || { name: 'Nenhum registro', value: 0 };
  const topAirline = airlineRanking[0] || { name: 'N/A', value: 0, percentual: 0 };
  const topPosition = positionRanking[0] || { name: 'N/A', value: 0 };
  const topModel = modelRanking[0] || { name: 'N/A', value: 0 };

  const renderChartContent = (data: any[], mode: ChartMode, dataKeyName: string) => {
    if (data.length === 0) {
      return <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">Sem dados disponíveis</div>;
    }

    if (mode === 'PIE') {
      return (
        <ResponsiveContainer width="100%" height={210}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={65}
              paddingAngle={3}
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
              isAnimationActive={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
            <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '9px', fontWeight: 'bold' }} />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    if (mode === 'BAR') {
      return (
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} angle={-20} textAnchor="end" height={35} axisLine={{ stroke: '#f1f5f9' }} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={{ stroke: '#f1f5f9' }} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} name={dataKeyName}>
              {data.map((entry, index) => (
                <Cell key={`bar-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (mode === 'LINE') {
      return (
        <ResponsiveContainer width="100%" height={210}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} angle={-20} textAnchor="end" height={35} axisLine={{ stroke: '#f1f5f9' }} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={{ stroke: '#f1f5f9' }} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
            <Line type="monotone" dataKey="value" stroke="#7e22ce" strokeWidth={3} dot={{ r: 4, fill: '#7e22ce' }} name={dataKeyName} />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    // LIST (Colorful progress bar list without scrollbars)
    return (
      <div className="space-y-2.5">
        {data.map((item, idx) => (
          <div key={item.name} className="group">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-black text-slate-700 flex items-center gap-2 uppercase text-[10px]">
                <span className="w-4 h-4 rounded-full text-white font-black text-[9px] flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: item.color }}>
                  {idx + 1}º
                </span>
                <span className="truncate max-w-[150px]">{item.name}</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[10px] font-bold">{item.value}</span>
                <span className="font-black text-slate-900 w-10 text-right">{item.percentual}%</span>
              </div>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/40">
              <div className="h-full rounded-full transition-all duration-700 ease-out shadow-xs" style={{ width: `${Math.max(item.percentual, 5)}%`, backgroundColor: item.color }}></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Metro Tile Navigation Menu */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-3 sm:gap-4">
        <button
          onClick={() => onNavigate('programacao')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-5 sm:p-6 rounded-3xl shadow-lg flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer border border-indigo-500/30"
        >
          <div className="p-3 bg-white/20 rounded-2xl group-hover:scale-110 transition-transform">
            <Globe className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <span className="text-[11px] sm:text-xs font-black tracking-widest uppercase text-white">Programação</span>
        </button>

        <button
          onClick={() => onNavigate('cadastro')}
          className="bg-blue-600 hover:bg-blue-700 text-white p-5 sm:p-6 rounded-3xl shadow-lg flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer border border-blue-500/30"
        >
          <div className="p-3 bg-white/20 rounded-2xl group-hover:scale-110 transition-transform">
            <Smartphone className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <span className="text-[11px] sm:text-xs font-black tracking-widest uppercase text-white">Pátio</span>
        </button>

        <button
          onClick={() => onNavigate('pousos')}
          className="bg-sky-500 hover:bg-sky-600 text-white p-5 sm:p-6 rounded-3xl shadow-lg flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer border border-sky-400/30"
        >
          <div className="p-3 bg-white/20 rounded-2xl group-hover:scale-110 transition-transform">
            <ListOrdered className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <span className="text-[11px] sm:text-xs font-black tracking-widest uppercase text-white">Pousos</span>
        </button>

        <button
          onClick={onOpenExport}
          className="bg-emerald-500 hover:bg-emerald-600 text-white p-5 sm:p-6 rounded-3xl shadow-lg flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer border border-emerald-400/30"
        >
          <div className="p-3 bg-white/20 rounded-2xl group-hover:scale-110 transition-transform">
            <Download className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <span className="text-[11px] sm:text-xs font-black tracking-widest uppercase text-white">Relatórios</span>
        </button>

        <button
          onClick={() => onNavigate('seguranca')}
          className="bg-amber-500 hover:bg-amber-600 text-white p-5 sm:p-6 rounded-3xl shadow-lg flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer border border-amber-400/30"
        >
          <div className="p-3 bg-white/20 rounded-2xl group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <span className="text-[11px] sm:text-xs font-black tracking-widest uppercase text-white">Segurança</span>
        </button>

        <button
          onClick={() => onNavigate('usuarios')}
          className="bg-teal-600 hover:bg-teal-700 text-white p-5 sm:p-6 rounded-3xl shadow-lg flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer border border-teal-500/30"
        >
          <div className="p-3 bg-white/20 rounded-2xl group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <span className="text-[11px] sm:text-xs font-black tracking-widest uppercase text-white">Equipe</span>
        </button>

        <button
          onClick={() => onNavigate('relatorios')}
          className="bg-purple-600 hover:bg-purple-700 text-white p-5 sm:p-6 rounded-3xl shadow-lg flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer border border-purple-400/30"
        >
          <div className="p-3 bg-white/20 rounded-2xl group-hover:scale-110 transition-transform">
            <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <span className="text-[11px] sm:text-xs font-black tracking-widest uppercase text-white">Administração</span>
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

      {/* Executive BI Banner & Timeframe Filter */}
      <div className="bg-purple-700 text-white p-6 sm:p-8 rounded-[32px] shadow-xl relative overflow-hidden border border-purple-600 space-y-4">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
               <div className="p-3 bg-white/20 rounded-2xl shadow-md"><Trophy className="w-6 h-6 text-amber-300" /></div>
               <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Painel Executivo • BI & Desempenho</h2>
            </div>
            <p className="text-purple-100 text-xs font-bold uppercase tracking-widest pl-1">Visão administrativa com filtros de período e gráficos interativos</p>
          </div>

          {/* Timeframe Filter Buttons */}
          <div className="flex items-center gap-1.5 bg-black/20 p-1.5 rounded-2xl border border-white/20">
            {(['HOJE', 'SEMANA', 'MES', 'TUDO'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
                  timeframe === period ? 'bg-amber-400 text-purple-950 shadow-md' : 'text-white hover:bg-white/10'
                }`}
              >
                {period === 'HOJE' ? 'Hoje' : period === 'SEMANA' ? 'Semana' : period === 'MES' ? 'Mês' : 'Tudo'}
              </button>
            ))}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
      </div>

      {/* Highlights Row (Top 4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Top Operator */}
        <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                1º em Produtividade
              </span>
              <Award className="w-5 h-5 text-amber-500" />
            </div>
            <h4 className="text-base font-black text-slate-900 truncate mt-2">{topOperator.name}</h4>
            <p className="text-[11px] text-slate-500 font-medium uppercase">Colaborador Destaque</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-baseline">
            <span className="text-2xl font-black text-purple-900">{topOperator.value}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Operações</span>
          </div>
        </div>

        {/* Top Airline */}
        <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-sky-700 uppercase tracking-widest bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                Líder de Mercado
              </span>
              <Plane className="w-5 h-5 text-sky-600" />
            </div>
            <h4 className="text-base font-black text-slate-900 truncate mt-2">{topAirline.name}</h4>
            <p className="text-[11px] text-slate-500 font-medium uppercase">Companhia Destaque</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-baseline">
            <span className="text-2xl font-black text-sky-950">{topAirline.value}</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">{topAirline.percentual}% da Base</span>
          </div>
        </div>

        {/* Top Position / Box */}
        <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Box Mais Utilizado
              </span>
              <MapPin className="w-5 h-5 text-amber-600" />
            </div>
            <h4 className="text-base font-black text-slate-900 truncate mt-2">{topPosition.name}</h4>
            <p className="text-[11px] text-slate-500 font-medium uppercase">Posição Mais Requisitada</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-baseline">
            <span className="text-2xl font-black text-amber-700">{topPosition.value}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Utilizações</span>
          </div>
        </div>

        {/* Top Aircraft Model */}
        <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                Modelo Destaque
              </span>
              <Tag className="w-5 h-5 text-indigo-600" />
            </div>
            <h4 className="text-base font-black text-slate-900 truncate mt-2">{topModel.name}</h4>
            <p className="text-[11px] text-slate-500 font-medium uppercase">Aeronave Mais Frequente</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-baseline">
            <span className="text-2xl font-black text-indigo-950">{topModel.value}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Balizações</span>
          </div>
        </div>
      </div>

      {/* Top 5 Rankings Grid with List / Bar / Pie / Line chart toggles for each of the 4 items (No scrollbars, perfectly sized) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Top 5 Operators */}
        <div className="bg-white rounded-3xl border-2 border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-black text-slate-800 text-xs uppercase tracking-tight">Top 5 • Colaboradores (Produtividade)</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase">Desempenho individual</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button onClick={() => setOperatorMode('LIST')} className={`p-1.5 rounded-lg cursor-pointer ${operatorMode === 'LIST' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-400'}`} title="Lista"><List className="w-4 h-4" /></button>
              <button onClick={() => setOperatorMode('BAR')} className={`p-1.5 rounded-lg cursor-pointer ${operatorMode === 'BAR' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-400'}`} title="Barra"><BarChart3 className="w-4 h-4" /></button>
              <button onClick={() => setOperatorMode('PIE')} className={`p-1.5 rounded-lg cursor-pointer ${operatorMode === 'PIE' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-400'}`} title="Pizza"><PieChartIcon className="w-4 h-4" /></button>
              <button onClick={() => setOperatorMode('LINE')} className={`p-1.5 rounded-lg cursor-pointer ${operatorMode === 'LINE' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-400'}`} title="Linha"><TrendingUp className="w-4 h-4" /></button>
            </div>
          </div>
          <div style={{ width: '100%', height: '210px' }}>
            {renderChartContent(operatorRanking, operatorMode, 'Operações')}
          </div>
        </div>

        {/* 2. Top 5 Airlines */}
        <div className="bg-white rounded-3xl border-2 border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-black text-slate-800 text-xs uppercase tracking-tight">Top 5 • Companhias Aéreas (Market Share)</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase">Empresas com mais pousos</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button onClick={() => setAirlineMode('LIST')} className={`p-1.5 rounded-lg cursor-pointer ${airlineMode === 'LIST' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-400'}`} title="Lista"><List className="w-4 h-4" /></button>
              <button onClick={() => setAirlineMode('BAR')} className={`p-1.5 rounded-lg cursor-pointer ${airlineMode === 'BAR' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-400'}`} title="Barra"><BarChart3 className="w-4 h-4" /></button>
              <button onClick={() => setAirlineMode('PIE')} className={`p-1.5 rounded-lg cursor-pointer ${airlineMode === 'PIE' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-400'}`} title="Pizza"><PieChartIcon className="w-4 h-4" /></button>
              <button onClick={() => setAirlineMode('LINE')} className={`p-1.5 rounded-lg cursor-pointer ${airlineMode === 'LINE' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-400'}`} title="Linha"><TrendingUp className="w-4 h-4" /></button>
            </div>
          </div>
          <div style={{ width: '100%', height: '210px' }}>
            {renderChartContent(airlineRanking, airlineMode, 'Pousos')}
          </div>
        </div>

        {/* 3. Top 5 Positions */}
        <div className="bg-white rounded-3xl border-2 border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-black text-slate-800 text-xs uppercase tracking-tight">Top 5 • Posições / Boxes Mais Utilizados</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase">Box mais requisitado</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button onClick={() => setPositionMode('LIST')} className={`p-1.5 rounded-lg cursor-pointer ${positionMode === 'LIST' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-400'}`} title="Lista"><List className="w-4 h-4" /></button>
              <button onClick={() => setPositionMode('BAR')} className={`p-1.5 rounded-lg cursor-pointer ${positionMode === 'BAR' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-400'}`} title="Barra"><BarChart3 className="w-4 h-4" /></button>
              <button onClick={() => setPositionMode('PIE')} className={`p-1.5 rounded-lg cursor-pointer ${positionMode === 'PIE' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-400'}`} title="Pizza"><PieChartIcon className="w-4 h-4" /></button>
              <button onClick={() => setPositionMode('LINE')} className={`p-1.5 rounded-lg cursor-pointer ${positionMode === 'LINE' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-400'}`} title="Linha"><TrendingUp className="w-4 h-4" /></button>
            </div>
          </div>
          <div style={{ width: '100%', height: '210px' }}>
            {renderChartContent(positionRanking, positionMode, 'Usos')}
          </div>
        </div>

        {/* 4. Top 5 Aircraft Models */}
        <div className="bg-white rounded-3xl border-2 border-slate-100 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-black text-slate-800 text-xs uppercase tracking-tight">Top 5 • Modelos de Aeronaves Mais Balizadas</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase">Equipamento mais frequente</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button onClick={() => setModelMode('LIST')} className={`p-1.5 rounded-lg cursor-pointer ${modelMode === 'LIST' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-400'}`} title="Lista"><List className="w-4 h-4" /></button>
              <button onClick={() => setModelMode('BAR')} className={`p-1.5 rounded-lg cursor-pointer ${modelMode === 'BAR' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-400'}`} title="Barra"><BarChart3 className="w-4 h-4" /></button>
              <button onClick={() => setModelMode('PIE')} className={`p-1.5 rounded-lg cursor-pointer ${modelMode === 'PIE' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-400'}`} title="Pizza"><PieChartIcon className="w-4 h-4" /></button>
              <button onClick={() => setModelMode('LINE')} className={`p-1.5 rounded-lg cursor-pointer ${modelMode === 'LINE' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-400'}`} title="Linha"><TrendingUp className="w-4 h-4" /></button>
            </div>
          </div>
          <div style={{ width: '100%', height: '210px' }}>
            {renderChartContent(modelRanking, modelMode, 'Balizações')}
          </div>
        </div>
      </div>

      {/* Visual Analytics */}
      <VisualCharts movimentacoes={movimentacoesFiltradas} />
    </div>
  );
};
