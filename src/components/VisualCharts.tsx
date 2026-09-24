import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  CartesianGrid, Cell, PieChart, Pie, LineChart, Line,
} from 'recharts';
import { LayoutGrid, BarChart3, PieChart as PieChartIcon, Layers, List, TrendingUp } from 'lucide-react';
import { MovimentacaoAeronave } from '../types';

interface VisualChartsProps {
  movimentacoes: MovimentacaoAeronave[];
}

type ChartType = 'STACKED' | 'GROUPED' | 'PIE' | 'LINE';
type MarketChartType = 'LIST' | 'BAR' | 'PIE';

const AIRLINE_COLORS: Record<string, string> = {
  'Azul': '#0284c7', 'LATAM': '#0f172a', 'GOL': '#f97316', 'Azul Conecta': '#0ea5e9',
  'Mercado Livre (Meli)': '#facc15', 'Voepass': '#16a34a', 'Total': '#312e81',
  'Modern Logistics': '#d97706', 'Sideral': '#dc2626', 'Outros': '#64748b',
  'Forças Armadas Brasileiras': '#1e3a8a'
};

export const VisualCharts: React.FC<VisualChartsProps> = ({ movimentacoes }) => {
  const [chartType, setChartType] = useState<ChartType>('STACKED');
  const [marketChartType, setMarketChartType] = useState<MarketChartType>('LIST');

  const chartDataByDate = useMemo(() => {
    const mapByDate: Record<string, { data: string; Hibrido_Sim: number; Hibrido_Nao: number; Total: number }> = {};
    movimentacoes.forEach((item) => {
      const parts = item.data_cadastro.split('-');
      const formatted = parts.length === 3 ? `${parts[2]}/${parts[1]}` : item.data_cadastro;
      if (!mapByDate[formatted]) mapByDate[formatted] = { data: formatted, Hibrido_Sim: 0, Hibrido_Nao: 0, Total: 0 };
      if (item.desembarque_hibrido === 'Sim') mapByDate[formatted].Hibrido_Sim += 1;
      else mapByDate[formatted].Hibrido_Nao += 1;
      mapByDate[formatted].Total += 1;
    });
    return Object.values(mapByDate).sort((a, b) => {
      const [dA, mA] = a.data.split('/'); const [dB, mB] = b.data.split('/');
      return Number(mA) - Number(mB) || Number(dA) - Number(dB);
    });
  }, [movimentacoes]);

  const pieData = useMemo(() => {
    let s = 0; let n = 0;
    movimentacoes.forEach(m => { if (m.desembarque_hibrido === 'Sim') s++; else n++; });
    return [
      { name: 'Híbrido', value: s, color: '#f59e0b' },
      { name: 'Padrão', value: n, color: '#0369a1' }
    ].filter(i => i.value > 0);
  }, [movimentacoes]);

  const chartDataByAirline = useMemo(() => {
    const map: Record<string, number> = {};
    movimentacoes.forEach((item) => { map[item.nome_companhia] = (map[item.nome_companhia] || 0) + 1; });
    const total = movimentacoes.length || 1;
    return Object.entries(map).map(([nome, count]) => ({
      nome, count, percentual: parseFloat(((count / total) * 100).toFixed(1)),
      color: AIRLINE_COLORS[nome] || '#0369a1',
    })).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [movimentacoes]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Performance e Híbridos */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-3">
          <div className="space-y-1">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest text-nowrap">Performance e Híbridos</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase">{chartType === 'PIE' ? 'Distribuição Total' : 'Tendência de Operações'}</p>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button onClick={() => setChartType('LINE')} className={`p-1.5 rounded-lg cursor-pointer ${chartType === 'LINE' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-400'}`} title="Linha"><TrendingUp className="w-4 h-4" /></button>
            <button onClick={() => setChartType('STACKED')} className={`p-1.5 rounded-lg cursor-pointer ${chartType === 'STACKED' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-400'}`} title="Empilhado"><Layers className="w-4 h-4" /></button>
            <button onClick={() => setChartType('GROUPED')} className={`p-1.5 rounded-lg cursor-pointer ${chartType === 'GROUPED' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-400'}`} title="Agrupado"><LayoutGrid className="w-4 h-4" /></button>
            <button onClick={() => setChartType('PIE')} className={`p-1.5 rounded-lg cursor-pointer ${chartType === 'PIE' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-400'}`} title="Pizza"><PieChartIcon className="w-4 h-4" /></button>
          </div>
        </div>
        <div style={{ width: '100%', height: '256px' }}>
          {movimentacoes.length > 0 ? (
            <ResponsiveContainer width="100%" height={256}>
              {chartType === 'PIE' ? (
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}`} isAnimationActive={false}>
                    {pieData.map((e, i) => <Cell key={`cell-${i}`} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              ) : chartType === 'LINE' ? (
                <LineChart data={chartDataByDate} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="data" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} axisLine={{ stroke: '#f1f5f9' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={{ stroke: '#f1f5f9' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '15px', fontSize: '10px', fontWeight: 'bold' }} />
                  <Line type="monotone" dataKey="Total" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, fill: '#0ea5e9' }} name="Total" />
                  <Line type="monotone" dataKey="Hibrido_Sim" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" name="Híbrido" />
                </LineChart>
              ) : (
                <BarChart data={chartDataByDate} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="data" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} axisLine={{ stroke: '#f1f5f9' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={{ stroke: '#f1f5f9' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '15px', fontSize: '10px', fontWeight: 'bold' }} />
                  <Bar dataKey="Hibrido_Nao" stackId={chartType === 'STACKED' ? "a" : undefined} fill="#0369a1" radius={chartType === 'STACKED' ? [0,0,0,0] : [4,4,0,0]} name="Padrão" />
                  <Bar dataKey="Hibrido_Sim" stackId={chartType === 'STACKED' ? "a" : undefined} fill="#f59e0b" radius={[4,4,0,0]} name="Híbrido" />
                </BarChart>
              )}
            </ResponsiveContainer>
          ) : <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">Nenhuma movimentação encontrada</div>}
        </div>
      </div>

      {/* Chart 2: Market Share Operacional */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-3">
          <div className="space-y-1">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest text-nowrap">Market Share Operacional</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase">Top 5 Companhias</p>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button onClick={() => setMarketChartType('LIST')} className={`p-1.5 rounded-lg cursor-pointer ${marketChartType === 'LIST' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-400'}`} title="Lista"><List className="w-4 h-4" /></button>
            <button onClick={() => setMarketChartType('BAR')} className={`p-1.5 rounded-lg cursor-pointer ${marketChartType === 'BAR' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-400'}`} title="Barras"><BarChart3 className="w-4 h-4" /></button>
            <button onClick={() => setMarketChartType('PIE')} className={`p-1.5 rounded-lg cursor-pointer ${marketChartType === 'PIE' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-400'}`} title="Pizza"><PieChartIcon className="w-4 h-4" /></button>
          </div>
        </div>
        <div style={{ width: '100%', height: '256px' }}>
          {chartDataByAirline.length > 0 ? (
            <>
              {marketChartType === 'PIE' ? (
                <ResponsiveContainer width="100%" height={256}>
                  <PieChart>
                    <Pie data={chartDataByAirline} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="count" nameKey="nome" label={({ name, value }) => `${name}: ${value}`} isAnimationActive={false}>
                      {chartDataByAirline.map((e, i) => <Cell key={`airline-cell-${i}`} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} formatter={(v: number) => [`${v} Pousos`, 'Total']} />
                    <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '9px', fontWeight: 'bold' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : marketChartType === 'BAR' ? (
                <ResponsiveContainer width="100%" height={256}>
                  <BarChart data={chartDataByAirline} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="nome" tick={{ fontSize: 8, fill: '#64748b', fontWeight: 'bold' }} angle={-45} textAnchor="end" height={50} axisLine={{ stroke: '#f1f5f9' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={{ stroke: '#f1f5f9' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Legend verticalAlign="top" wrapperStyle={{ fontSize: '9px', fontWeight: 'bold' }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Pousos">{chartDataByAirline.map((e, i) => <Cell key={`bar-${i}`} fill={e.color} />)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="space-y-3.5 max-h-64 overflow-y-auto pr-2 scrollbar-none">
                  {chartDataByAirline.map((item) => (
                    <div key={item.nome} className="group">
                      <div className="flex justify-between items-center text-xs mb-1.5"><span className="font-black text-slate-700 flex items-center gap-2 uppercase text-[9px]"><span className="w-2 h-2 rounded-full inline-block shrink-0 shadow-sm" style={{ backgroundColor: item.color }}></span>{item.nome}</span><div className="flex items-center gap-2"><span className="text-slate-400 text-[9px] font-bold">{item.count} OPS</span><span className="font-black text-sky-950 w-10 text-right">{item.percentual}%</span></div></div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/30"><div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${item.percentual}%`, backgroundColor: item.color }}></div></div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : <div className="py-12 text-center text-xs text-slate-400 italic">Sem dados de mercado</div>}
        </div>
      </div>
    </div>
  );
};
