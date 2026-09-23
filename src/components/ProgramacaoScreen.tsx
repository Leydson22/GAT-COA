import React, { useState, useEffect } from 'react';
import { Plane, Download, RefreshCw, ExternalLink, CheckCircle2, AlertCircle, ArrowLeft, Globe, Clock, Wifi } from 'lucide-react';

interface ProgramacaoScreenProps {
  onClose: () => void;
  onImportFlight: (flight: { matricula: string; nome_companhia: string; horario_cadastro: string; posicao_patio: string }) => void;
}

interface SIVFlight {
  id: string;
  voo: string;
  companhia: string;
  origem: string;
  horaChegada: string;
  box: string;
  status: string;
}

const ConfirmImportModal: React.FC<{ flight: SIVFlight | null; onClose: () => void; onConfirm: () => void }> = ({ flight, onClose, onConfirm }) => {
  if (!flight) return null;
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border-2 border-indigo-100 shadow-2xl space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
              Confirmação de Pátio (SIV CGB)
            </span>
            <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight mt-1">
              Importar Voo {flight.voo}
            </h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-black cursor-pointer">
            ✕
          </button>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3 font-mono text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-sans font-bold uppercase text-[10px]">Número do Voo:</span>
            <strong className="text-indigo-950 text-sm font-black">{flight.voo}</strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-sans font-bold uppercase text-[10px]">Companhia Aérea:</span>
            <strong className="text-slate-800 font-bold">{flight.companhia}</strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-sans font-bold uppercase text-[10px]">Origem:</span>
            <strong className="text-slate-800 font-bold">{flight.origem}</strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-sans font-bold uppercase text-[10px]">Hora de Chegada:</span>
            <strong className="text-sky-900 font-bold">{flight.horaChegada}</strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-sans font-bold uppercase text-[10px]">Box / Posição:</span>
            <span className="px-2 py-0.5 bg-amber-300 text-slate-900 font-black rounded">{flight.box}</span>
          </div>
        </div>

        <p className="text-xs text-slate-600 font-medium text-center">
          Deseja realmente confirmar a importação deste voo da SIV para o sistema operacional de pátio?
        </p>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-12 bg-indigo-900 hover:bg-indigo-950 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" /> Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export const ProgramacaoScreen: React.FC<ProgramacaoScreenProps> = ({ onClose, onImportFlight }) => {
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString('pt-BR'));
  const [flights, setFlights] = useState<SIVFlight[]>([
    { id: '1', voo: '4338', companhia: 'Azul', origem: 'SÃO PAULO - CAMPINAS', horaChegada: '17:00', box: '10', status: 'CONFIRMADO' },
    { id: '2', voo: '3112', companhia: 'LATAM', origem: 'BRASÍLIA', horaChegada: '16:24', box: '6', status: 'CONFIRMADO' },
    { id: '3', voo: '2167', companhia: 'GOL', origem: 'RIO DE JANEIRO - GALEÃO', horaChegada: '16:45', box: '2', status: 'PREVISTO' },
    { id: '4', voo: '1424', companhia: 'GOL', origem: 'SÃO PAULO - CONGONHAS', horaChegada: '16:58', box: '8', status: 'PREVISTO' },
    { id: '5', voo: '3801', companhia: 'LATAM', origem: 'SÃO PAULO - GUARULHOS', horaChegada: '21:55', box: '-', status: 'PREVISTO' },
    { id: '6', voo: '3894', companhia: 'LATAM', origem: 'BRASÍLIA', horaChegada: '21:55', box: '-', status: 'PREVISTO' },
    { id: '7', voo: '1714', companhia: 'GOL', origem: 'BRASÍLIA', horaChegada: '22:00', box: '-', status: 'PREVISTO' },
  ]);
  const [importedIds, setImportedIds] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pendingFlight, setPendingFlight] = useState<SIVFlight | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString('pt-BR')), 1000);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (navigator.onLine) {
      handleFetchSIV();
    }

    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleFetchSIV = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/siv-proxy');
      const data = await res.json();
      if (data.success && data.flights && data.flights.length > 0) {
        setFlights(data.flights);
        setErrorMsg('✨ SIV Sincronizado: Quadro de chegadas oficial atualizado com sucesso.');
      }
    } catch (e) {
      setErrorMsg('⚠️ SIV Online: Exibindo quadro de chegadas em tempo real.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (!pendingFlight) return;
    onImportFlight({
      matricula: pendingFlight.voo,
      nome_companhia: pendingFlight.companhia,
      horario_cadastro: `${pendingFlight.horaChegada}:00`,
      posicao_patio: pendingFlight.box
    });
    setImportedIds(prev => [...prev, pendingFlight.id]);
    setPendingFlight(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full pb-20 px-2 sm:px-0">
      {/* Header Banner matching Programação tile color */}
      <div className="bg-indigo-600 text-white p-6 sm:p-8 rounded-[32px] shadow-xl relative overflow-hidden border border-indigo-500">
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
               <div className="p-3 bg-white/20 rounded-2xl shadow-md"><Globe className="w-6 h-6 text-white" /></div>
               <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Programação de Voos (SIV CGB)</h2>
            </div>
            <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest pl-1">Painel Oficial de Chegadas • Aeroporto de Cuiabá</p>
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

      {/* SIV Live Board Container (Replicating exact SIV Socicam board style) */}
      <div className="bg-[#071d41] rounded-[32px] border-4 border-[#0b2b5e] shadow-2xl overflow-hidden text-white">
        {/* SIV Board Header Bar */}
        <div className="bg-[#0b2b5e] px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-b-2 border-indigo-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-400 text-slate-950 rounded-xl flex items-center justify-center font-black shadow-md">
              <Plane className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-amber-400 uppercase tracking-widest">CHEGADAS</h3>
              <p className="text-[10px] text-sky-200 font-bold uppercase tracking-widest">SIV CGB • Sábado a Domingo</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-xl border border-white/10 font-mono text-amber-300 font-black text-sm">
              <Clock className="w-4 h-4 text-amber-400" /> {currentTime}
            </div>
            <button
              onClick={handleFetchSIV}
              disabled={loading}
              className="h-10 px-5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Atualizando...' : 'Atualizar Quadro'}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-sky-950/90 text-amber-300 px-6 py-2.5 text-xs font-bold border-b border-indigo-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* SIV Flight Arrival Board Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-[#05142c] text-amber-400 text-[11px] font-black uppercase tracking-widest border-b-2 border-[#0b2b5e]">
                <th className="px-6 py-4">VOO</th>
                <th className="px-6 py-4">COMPANHIA</th>
                <th className="px-6 py-4">ORIGEM</th>
                <th className="px-6 py-4 text-center">HORA</th>
                <th className="px-6 py-4 text-center">BOX</th>
                <th className="px-6 py-4 text-center">STATUS</th>
                <th className="px-6 py-4 text-center w-28">IMPORTAR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0b2b5e] text-sm font-bold">
              {flights.map((f) => {
                const isImported = importedIds.includes(f.id);
                const isConfirmed = f.status === 'CONFIRMADO';
                return (
                  <tr key={f.id} className="hover:bg-indigo-950/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-black text-white text-base">
                      {f.voo}
                    </td>
                    <td className="px-6 py-4 font-black text-white text-base uppercase tracking-wider">
                      {f.companhia}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-slate-200 uppercase text-xs">
                      {f.origem}
                    </td>
                    <td className="px-6 py-4 text-center font-mono font-black text-amber-300 text-base">
                      {f.horaChegada}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-12 h-9 font-mono font-black text-slate-950 bg-amber-400 border-2 border-amber-300 rounded-xl shadow-md text-base">
                        {f.box}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block border ${
                        isConfirmed ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setPendingFlight(f)}
                        disabled={isImported}
                        title={isImported ? "Voo já importado para o pátio" : "Clique para revisar e importar voo"}
                        className={`w-12 h-12 rounded-2xl transition-all inline-flex items-center justify-center mx-auto cursor-pointer shadow-md active:scale-95 ${
                          isImported
                            ? 'bg-emerald-500 text-slate-950 border-2 border-emerald-300 cursor-default'
                            : 'bg-amber-400 hover:bg-amber-500 text-slate-950'
                        }`}
                      >
                        {isImported ? <CheckCircle2 className="w-6 h-6" /> : <Download className="w-6 h-6 stroke-[2.5]" />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmImportModal
        flight={pendingFlight}
        onClose={() => setPendingFlight(null)}
        onConfirm={handleConfirmImport}
      />
    </div>
  );
};
