import React, { useState, useMemo } from 'react';
import { FlightRecord } from '../types';
import { Plane, Search, Edit2, RefreshCw, Calendar, Clock, Filter, PlusCircle, CheckCircle2, X, FileText, ArrowUp, ArrowDown, ArrowLeft, ListOrdered, ChevronLeft, ChevronRight } from 'lucide-react';
import { AirlineLogo } from './AirlineLogo';

interface RecentLandingsScreenProps {
  movimentacoes: FlightRecord[];
  onEditRecord: (record: FlightRecord) => void;
  onRequestDeleteRecord?: (record: FlightRecord) => void;
  onToggleHibrido: (id_registro: string) => void;
  onNavigateToCadastro: () => void;
  onClose?: () => void;
  onOpenExport?: (data: FlightRecord[], filters: { dataInicio: string, dataFim: string }, auto?: 'OPERATIONAL' | 'MANAGEMENT' | 'SHIFTHANDOVER' | 'AIRLINE') => void;
}

export const RecentLandingsScreen: React.FC<RecentLandingsScreenProps> = ({
  movimentacoes,
  onEditRecord,
  onRequestDeleteRecord,
  onToggleHibrido,
  onNavigateToCadastro,
  onClose,
  onOpenExport,
}) => {
  const getTodayISO = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayISO();
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterHibrido, setFilterHibrido] = useState<'TODOS' | 'Sim' | 'Não'>('TODOS');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Filtered and sorted landings by date, search term, hybrid status, and sort order
  const filteredLandings = useMemo(() => {
    const list = movimentacoes.filter((rec) => {
      if (selectedDate && rec.data_cadastro !== selectedDate) {
        return false;
      }
      if (filterHibrido !== 'TODOS' && rec.desembarque_hibrido !== filterHibrido) {
        return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toUpperCase().trim();
        const matchMatricula = rec.matricula.toUpperCase().includes(term);
        const matchCompany = rec.nome_companhia.toUpperCase().includes(term);
        return matchMatricula || matchCompany;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      const dateTimeA = `${a.data_cadastro || ''} ${a.horario_cadastro || ''}`;
      const dateTimeB = `${b.data_cadastro || ''} ${b.horario_cadastro || ''}`;
      const comp = dateTimeA.localeCompare(dateTimeB);
      return sortOrder === 'desc' ? -comp : comp;
    });
  }, [movimentacoes, selectedDate, filterHibrido, searchTerm, sortOrder]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredLandings.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const paginatedLandings = filteredLandings.slice(startIndex, startIndex + pageSize);

  const formatDateBR = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const isToday = selectedDate === todayStr;

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full pb-20 px-2 sm:px-0">
      {/* Header Card Standard (Sky Blue matching Pousos tile color) */}
      <div className="bg-sky-600 text-white p-6 sm:p-8 rounded-[32px] shadow-xl relative overflow-hidden border border-sky-500">
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
               <div className="p-3 bg-white/20 rounded-2xl shadow-md"><ListOrdered className="w-6 h-6 text-white" /></div>
               <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Histórico de Pousos (CGB)</h2>
            </div>
            <p className="text-sky-100 text-xs font-bold uppercase tracking-widest pl-1">Consulta e acompanhamento de aeronaves</p>
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

      {/* Date Filter & Search Control Bar */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          {/* Date Picker */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800">
              <Calendar className="w-4 h-4 text-sky-800" />
              <span>Data:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => { setSelectedDate(e.target.value); setCurrentPage(1); }}
                className="bg-transparent font-extrabold text-sky-950 focus:outline-none cursor-pointer"
              />
            </div>

            <button
              type="button"
              onClick={() => { setSelectedDate(todayStr); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                isToday
                  ? 'bg-amber-400 text-sky-950 shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Hoje ({formatDateBR(todayStr)})
            </button>

            {selectedDate && (
              <button
                type="button"
                onClick={() => { setSelectedDate(''); setCurrentPage(1); }}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                title="Exibir pousos de todas as datas"
              >
                Todas as Datas
              </button>
            )}
          </div>

          {/* Search Input */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3" />
            <input
              type="text"
              placeholder="Buscar matrícula/empresa..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full sm:w-52 pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>
        </div>

        {/* Filters and Counters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase px-2">Status:</span>
              <button
                type="button"
                onClick={() => { setFilterHibrido('TODOS'); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                  filterHibrido === 'TODOS' ? 'bg-white text-sky-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => { setFilterHibrido('Sim'); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                  filterHibrido === 'Sim' ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-600'
                }`}
              >
                Híbrido
              </button>
              <button
                type="button"
                onClick={() => { setFilterHibrido('Não'); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                  filterHibrido === 'Não' ? 'bg-sky-800 text-white shadow-2xs' : 'text-slate-600'
                }`}
              >
                Padrão
              </button>
            </div>

            {/* Items Per Page Selector (Above data) */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase">Por página:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer text-xs"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
            <span className="text-slate-500 font-semibold">
              Total: <strong className="text-sky-950 font-black">{filteredLandings.length}</strong>
            </span>

            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs border border-slate-200 transition-all cursor-pointer"
              title="Alternar ordem cronológica"
            >
              {sortOrder === 'desc' ? (
                <><span>Recentes Primeiro</span><ArrowDown className="w-3.5 h-3.5 text-sky-800" /></>
              ) : (
                <><span>Antigas Primeiro</span><ArrowUp className="w-3.5 h-3.5 text-sky-800" /></>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Landings List Container */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
        {paginatedLandings.length === 0 ? (
          <div className="p-16 text-center text-slate-400 italic text-xs">
            Nenhuma movimentação de pátio encontrada para os filtros selecionados.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {paginatedLandings.map((rec, index) => {
              const isHybrid = rec.desembarque_hibrido === 'Sim';
              const isEven = index % 2 === 0;

              return (
                <div
                  key={rec.id_registro}
                  className={`relative p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    isEven ? 'bg-white hover:bg-sky-50/50' : 'bg-slate-50/80 hover:bg-sky-50/50'
                  }`}
                >
                  {/* Left Info */}
                  <div className="flex items-center gap-3 pr-12 sm:pr-0">
                    {/* Tail Registration Badge */}
                    <div className="bg-sky-950 text-amber-300 border border-sky-800 px-3 py-1.5 rounded-xl font-mono font-black text-sm sm:text-base shrink-0 shadow-xs tracking-wider">
                      {rec.matricula}
                    </div>

                    <div className="flex items-center gap-3">
                      <AirlineLogo nomeCompanhia={rec.nome_companhia} size="sm" />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                            {rec.nome_companhia}
                          </h4>

                          {/* Hybrid Badge Pill */}
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                              isHybrid
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-sky-100 text-sky-900 border-sky-300'
                            }`}
                          >
                            {isHybrid ? 'Híbrido' : 'Padrão'}
                          </span>

                          {/* Posição no Pátio Badge */}
                          {rec.posicao_patio && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider bg-sky-900 text-amber-300 border border-sky-950 font-mono shadow-2xs">
                              {rec.posicao_patio}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 font-mono mt-1">
                          <span className="flex items-center gap-1 font-semibold">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {formatDateBR(rec.data_cadastro)}
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-slate-700">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {rec.horario_cadastro}
                          </span>
                          <span className="text-[10px] text-slate-400 hidden sm:inline">
                            • {rec.id_registro}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top Right Action Button: ONLY Edit Button */}
                  <div className="absolute top-3 right-3 sm:relative sm:top-0 sm:right-0 flex items-center">
                    <button
                      type="button"
                      onClick={() => onEditRecord(rec)}
                      className="p-2 bg-sky-50 hover:bg-sky-100 active:bg-sky-200 text-sky-800 hover:text-sky-950 rounded-xl border border-sky-200 transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 flex items-center gap-1.5 text-xs font-bold"
                      title="Editar registro de pouso"
                    >
                      <Edit2 className="w-4 h-4 text-sky-800" />
                      <span className="hidden md:inline">Editar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3.5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-[11px] text-slate-500 font-medium">
            Mostrando <strong className="text-slate-800">{paginatedLandings.length}</strong> de <strong className="text-slate-800">{filteredLandings.length}</strong> pousos filtrados
          </span>

          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1">
              <span className="text-slate-400 font-medium">Por página:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <span className="text-slate-500">
              Página <strong>{validCurrentPage}</strong> de <strong>{totalPages}</strong>
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={validCurrentPage === 1}
                className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors cursor-pointer"
                title="Página Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={validCurrentPage === totalPages}
                className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors cursor-pointer"
                title="Próxima Página"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
