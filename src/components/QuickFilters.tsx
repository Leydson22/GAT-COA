import React from 'react';
import { Filter, Search, Calendar, X, Check, Layout } from 'lucide-react';
import { FiltrosDashboard, CompanhiaAerea } from '../types';

interface QuickFiltersProps {
  filtros: FiltrosDashboard;
  setFiltros: React.Dispatch<React.SetStateAction<FiltrosDashboard>>;
  companhias: CompanhiaAerea[];
  totalFiltrados: number;
  totalGeral: number;
}

export const QuickFilters: React.FC<QuickFiltersProps> = ({
  filtros,
  setFiltros,
  companhias,
  totalFiltrados,
  totalGeral,
}) => {
  const isFiltered =
    filtros.nome_companhia !== 'TODAS' ||
    filtros.desembarque_hibrido !== 'TODOS' ||
    filtros.buscaMatricula.trim() !== '' ||
    filtros.dataInicio !== '' ||
    filtros.dataFim !== '';

  const getLocalDateISO = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleClearFilters = () => {
    setFiltros({
      nome_companhia: 'TODAS',
      desembarque_hibrido: 'TODOS',
      dataInicio: '',
      dataFim: '',
      buscaMatricula: '',
    });
  };

  const todayStr = getLocalDateISO(new Date());

  return (
    <div className="bg-white border-b border-slate-200 shadow-xs w-full">
      {/* Header Info Bar */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-sky-800" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Painel de Filtros</span>
        </div>
        <div className="text-[10px] font-bold text-slate-400 uppercase">
          Exibindo <span className="text-sky-900 font-black">{totalFiltrados}</span> de <span className="text-slate-600">{totalGeral}</span> registros
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Row 1: Search & Company */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3" />
            <input
              type="text"
              placeholder="Buscar por Matrícula..."
              value={filtros.buscaMatricula}
              onChange={(e) => setFiltros({ ...filtros, buscaMatricula: e.target.value.toUpperCase() })}
              className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-sky-500 outline-none transition-all"
            />
          </div>

          <div className="relative flex items-center">
            <Layout className="w-4 h-4 text-slate-400 absolute left-3 z-10" />
            <select
              value={filtros.nome_companhia}
              onChange={(e) => setFiltros({ ...filtros, nome_companhia: e.target.value })}
              className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-sky-500 outline-none cursor-pointer appearance-none"
            >
              <option value="TODAS">Todas as Empresas</option>
              <option value="SOMENTE_AIRLINES">Somente Companhias Aéreas</option>
              {companhias.map((c) => (
                <option key={c.id_companhia} value={c.nome_companhia}>{c.nome_companhia}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Status & Time Shortcuts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setFiltros({ ...filtros, desembarque_hibrido: 'TODOS' })}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all ${filtros.desembarque_hibrido === 'TODOS' ? 'bg-white text-sky-900 shadow-sm' : 'text-slate-50'}`}
            >
              TODOS
            </button>
            <button
              onClick={() => setFiltros({ ...filtros, desembarque_hibrido: 'Sim' })}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all ${filtros.desembarque_hibrido === 'Sim' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500'}`}
            >
              HÍBRIDO
            </button>
            <button
              onClick={() => setFiltros({ ...filtros, desembarque_hibrido: 'Não' })}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all ${filtros.desembarque_hibrido === 'Não' ? 'bg-sky-800 text-white shadow-sm' : 'text-slate-500'}`}
            >
              PADRÃO
            </button>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => {
                setFiltros({ ...filtros, dataInicio: todayStr, dataFim: todayStr, buscaMatricula: '' });
              }}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all uppercase ${
                filtros.dataInicio === todayStr && filtros.dataFim === todayStr ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              Hoje
            </button>
            <button
              onClick={() => {
                const now = new Date();
                const day = now.getDay();
                const diffToMonday = day === 0 ? -6 : 1 - day;
                const mondayDate = new Date(now);
                mondayDate.setDate(now.getDate() + diffToMonday);
                const sundayDate = new Date(mondayDate);
                sundayDate.setDate(mondayDate.getDate() + 6);
                const monday = getLocalDateISO(mondayDate);
                const sunday = getLocalDateISO(sundayDate);
                setFiltros({ ...filtros, dataInicio: monday, dataFim: sunday, buscaMatricula: '' });
              }}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all uppercase ${
                filtros.dataInicio && filtros.dataInicio !== todayStr && !filtros.dataInicio.endsWith('-01') ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => {
                const now = new Date();
                const firstDay = getLocalDateISO(new Date(now.getFullYear(), now.getMonth(), 1));
                setFiltros({ ...filtros, dataInicio: firstDay, dataFim: todayStr, buscaMatricula: '' });
              }}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all uppercase ${
                filtros.dataInicio && filtros.dataInicio.endsWith('-01') ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              Mês
            </button>
          </div>
        </div>

        {/* Row 3: Dates & Clear */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch">
          <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="flex items-center gap-2 flex-1">
              <input
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
                className="bg-transparent text-[11px] font-bold text-slate-700 outline-none w-full"
              />
              <span className="text-slate-300 font-black">/</span>
              <input
                type="date"
                value={filtros.dataFim}
                onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
                className="bg-transparent text-[11px] font-bold text-slate-700 outline-none w-full"
              />
            </div>
          </div>

          {isFiltered && (
            <button
              onClick={handleClearFilters}
              className="px-6 py-2.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 active:bg-rose-100 transition-all shadow-2xs"
            >
              <X className="w-3.5 h-3.5" />
              Limpar Filtros
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
