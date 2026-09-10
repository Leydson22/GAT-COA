import React, { useState, useMemo } from 'react';
import { FlightRecord } from '../types';
import { Plane, Search, Edit2, RefreshCw, Calendar, Clock, Filter, PlusCircle, CheckCircle2, X, FileText, ArrowUp, ArrowDown } from 'lucide-react';

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
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // Default: newest first

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
    <div className="space-y-4 max-w-4xl mx-auto w-full">
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
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent font-extrabold text-sky-950 focus:outline-none cursor-pointer"
              />
            </div>

            <button
              type="button"
              onClick={() => setSelectedDate(todayStr)}
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
                onClick={() => setSelectedDate('')}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                title="Exibir pousos de todas as datas"
              >
                Todas as Datas
              </button>
            )}

            {/* Sort Toggle Button: Recentes / Antigos */}
            <button
              type="button"
              onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 border border-sky-200 rounded-xl text-xs font-black text-sky-950 hover:bg-sky-100 transition-all cursor-pointer shadow-2xs"
              title={sortOrder === 'desc' ? 'Exibindo mais recentes primeiro (Clique para alternar para antigos)' : 'Exibindo mais antigos primeiro (Clique para alternar para recentes)'}
            >
              {sortOrder === 'desc' ? <ArrowUp className="w-3.5 h-3.5 text-sky-800" /> : <ArrowDown className="w-3.5 h-3.5 text-sky-800" />}
              <span>{sortOrder === 'desc' ? 'Recentes' : 'Antigos'}</span>
            </button>
          </div>

          {/* Landing Count Badge */}
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <span className="text-xs font-bold text-slate-500">
              {isToday ? 'Pousos de Hoje:' : selectedDate ? `Pousos em ${formatDateBR(selectedDate)}:` : 'Total de Pousos:'}
            </span>
            <span className="bg-sky-950 text-amber-300 font-black text-xs px-3 py-1 rounded-full shadow-2xs">
              {filteredLandings.length}
            </span>
          </div>

          {onOpenExport && (
            <button
              onClick={() => onOpenExport(filteredLandings, { dataInicio: selectedDate, dataFim: selectedDate }, 'OPERATIONAL')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-black rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>GERAR PDF</span>
            </button>
          )}
        </div>

        {/* Search & Hybrid Filter */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por matrícula (cauda) ou empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Hybrid Quick Filter */}
          <div className="flex items-center gap-1.5 text-xs shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400 hidden xs:inline" />
            <span className="text-slate-500 font-bold hidden sm:inline">Híbrido:</span>
            {(['TODOS', 'Sim', 'Não'] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setFilterHibrido(opt)}
                className={`px-3 py-1.5 rounded-lg font-extrabold transition-all cursor-pointer ${
                  filterHibrido === opt
                    ? 'bg-sky-900 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {opt === 'TODOS' ? 'Todos' : opt === 'Sim' ? 'Híbridos' : 'Padrão'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Landings List with Zebra Striping (Alternating Row Shading) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {filteredLandings.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <p className="text-sm font-bold text-slate-500">
              Nenhum pouso encontrado para os filtros selecionados.
            </p>
            <p className="text-xs text-slate-400">
              Tente ajustar a busca por matrícula ou adicionar um novo registro.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200/70">
            {filteredLandings.map((rec, index) => {
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
      </div>
    </div>
  );
};
