import React, { useState, useEffect } from 'react';
import {
  Building2, MapPin, Plane, Layers, CheckCircle2, Check, X,
  PlusCircle, ChevronRight, ChevronLeft, Trash2, Edit2, Plus,
  Hash, Briefcase, Smartphone, ArrowLeft
} from 'lucide-react';
import { CompanhiaAerea, MovimentacaoAeronave, DesembarqueHibrido } from '../types';
import { AirlineLogo } from './AirlineLogo';
import { getAircraftModels, addAircraftModel, deleteAircraftModel, editAircraftModel } from '../services/aircraftModelService';
import { getPositions, addPosition, deletePosition, editPosition } from '../services/positionService';
import { getAirlines, addAirline, deleteAirline, editAirline } from '../services/airlineService';
import { getQuickPrefixes, addQuickPrefix, deleteQuickPrefix, editQuickPrefix } from '../services/quickRegistrationService';

interface MobileQuickEntryProps {
  companhias: CompanhiaAerea[];
  onSaveRecord: (record: Omit<MovimentacaoAeronave, 'id_registro'>) => void;
  onClose?: () => void;
}

export const MobileQuickEntry: React.FC<MobileQuickEntryProps> = ({
  companhias: initialCompanhias,
  onSaveRecord,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [companhias, setCompanhias] = useState<CompanhiaAerea[]>(() => getAirlines());
  const [selectedCompanhiaId, setSelectedCompanhiaId] = useState<number | string>(
    companhias[0]?.id_companhia || ''
  );

  const [posicaoPatio, setPosicaoPatio] = useState<string>('01');
  const [grupoPosicao, setGrupoPosicao] = useState<'principal' | 'remota'>('principal');
  const [positions, setPositions] = useState(() => getPositions());

  const [matricula, setMatricula] = useState<string>('');
  const [prefixes, setPrefixes] = useState<string[]>(() => getQuickPrefixes());

  const [selectedModelo, setSelectedModelo] = useState<string>('');
  const [modelos, setModelos] = useState<string[]>(() => getAircraftModels());

  const [managementMode, setManagementMode] = useState<'select' | 'edit' | 'delete'>('select');
  const [desembarqueHibrido, setDesembarqueHibrido] = useState<DesembarqueHibrido>('Não');

  const [registeredModal, setRegisteredModal] = useState<{
    matricula: string;
    companhia: string;
    posicao: string;
    horario: string;
    hibrido: string;
    modelo?: string;
  } | null>(null);

  const handleSelectCompany = (id: number | string) => {
    if (managementMode === 'edit') {
      const comp = companhias.find(c => String(c.id_companhia) === String(id));
      if (!comp) return;
      const newName = window.prompt(`Editar nome da empresa:`, comp.nome_companhia);
      const newIcao = window.prompt(`Editar ICAO (3 letras):`, comp.icao);
      if (newName && newName.trim() && newIcao && newIcao.trim()) {
        editAirline(comp.id_companhia, newName.trim(), newIcao.trim().toUpperCase());
        setCompanhias(getAirlines());
      }
      setManagementMode('select');
      return;
    }
    if (managementMode === 'delete') {
      const comp = companhias.find(c => String(c.id_companhia) === String(id));
      if (!comp) return;
      if (window.confirm(`Excluir empresa ${comp.nome_companhia}?`)) {
        deleteAirline(comp.id_companhia);
        setCompanhias(getAirlines());
      }
      setManagementMode('select');
      return;
    }
    setSelectedCompanhiaId(id);
    setCurrentStep(2);
  };

  const handleAddCompany = () => {
    const nome = window.prompt('Nome da nova Companhia Aérea:');
    const icao = window.prompt('Código ICAO (3 letras, ex: AZU):');
    if (nome && nome.trim() && icao && icao.trim()) {
      addAirline(nome.trim(), icao.trim().toUpperCase());
      setCompanhias(getAirlines());
    }
  };

  const handleAddPosition = () => {
    const pos = window.prompt('Número ou Nome do Box (ex: 08, REM 1):');
    if (pos && pos.trim()) {
      addPosition(pos.trim().toUpperCase(), 'principal');
      setPositions(getPositions());
    }
  };

  const handleAddPrefix = () => {
    const pref = window.prompt('Prefixo de matrícula rápido (ex: PR-, PT-):');
    if (pref && pref.trim()) {
      addQuickPrefix(pref.trim().toUpperCase());
      setPrefixes(getQuickPrefixes());
    }
  };

  const handleAddModel = () => {
    const mod = window.prompt('Modelo de Aeronave (ex: A320, B738, AT72):');
    if (mod && mod.trim()) {
      addAircraftModel(mod.trim().toUpperCase());
      setModelos(getAircraftModels());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricula.trim()) {
      alert('Informe a matrícula da aeronave.');
      return;
    }

    const company = companhias.find(c => String(c.id_companhia) === String(selectedCompanhiaId));
    if (!company) {
      alert('Selecione uma companhia válida.');
      return;
    }

    const cleanMatricula = matricula.trim().toUpperCase();
    const now = new Date();
    const autoTime = now.toTimeString().split(' ')[0]; // HH:MM:SS
    const autoDate = now.toISOString().split('T')[0]; // YYYY-MM-DD

    onSaveRecord({
      matricula: cleanMatricula,
      nome_companhia: company.nome_companhia,
      desembarque_hibrido: desembarqueHibrido,
      posicao_patio: posicaoPatio,
      horario_cadastro: autoTime,
      data_cadastro: autoDate,
      tipo_aeronave: selectedModelo
    });

    setRegisteredModal({
      matricula: cleanMatricula,
      companhia: company.nome_companhia,
      posicao: posicaoPatio,
      horario: autoTime,
      hibrido: desembarqueHibrido,
      modelo: selectedModelo
    });
    setMatricula(''); setSelectedModelo(''); setCurrentStep(1);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 w-full h-full overflow-hidden box-border max-w-4xl mx-auto pb-20">
      {/* Header Card Standard (Blue matching Pátio tile color) */}
      <div className="bg-blue-600 text-white p-6 sm:p-8 rounded-[32px] shadow-xl relative overflow-hidden border border-blue-500 m-4 sm:m-6 mb-0">
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
               <div className="p-3 bg-white/20 rounded-2xl shadow-md"><Smartphone className="w-6 h-6 text-white" /></div>
               <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Lançamento de Pátio (CGB)</h2>
            </div>
            <p className="text-blue-100 text-xs font-bold uppercase tracking-widest pl-1">Cadastro rápido de aeronave e posição</p>
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

      {registeredModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[2000] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-6 w-full max-w-[340px] shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto"><CheckCircle2 className="w-9 h-9" /></div>
              <h3 className="text-xl font-black text-slate-900 uppercase">Sucesso!</h3>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs font-mono">
               <div className="flex justify-between border-b pb-2"><span className="text-slate-400">Matrícula:</span><span className="font-black text-sky-950 bg-amber-300 px-2 rounded-lg">{registeredModal.matricula}</span></div>
               <div className="flex justify-between border-b pb-2"><span className="text-slate-400">Empresa:</span><span className="font-black truncate ml-2">{registeredModal.companhia}</span></div>
               <div className="flex justify-between"><span className="text-slate-400">Posição:</span><span className="font-black">BOX {registeredModal.posicao}</span></div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <button onClick={() => {setRegisteredModal(null); setCurrentStep(1);}} className="w-full py-4 bg-sky-900 text-white font-black text-sm rounded-2xl shadow-lg cursor-pointer">NOVO POUSO</button>
              <button onClick={onClose} className="w-full py-3.5 bg-slate-100 text-slate-500 font-black text-xs rounded-2xl uppercase cursor-pointer">Início</button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 pb-24">
        {/* STEP Header Helper */}
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-xs sticky top-0 z-50">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-sky-900 text-white flex items-center justify-center font-black text-sm">{currentStep}</div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase">
                  {currentStep === 1 ? 'Empresa Aérea' : currentStep === 2 ? 'Posição no Pátio' : currentStep === 3 ? 'Matrícula' : currentStep === 4 ? 'Equipamento' : 'Desembarque'}
                </h4>
              </div>
           </div>

           <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 shadow-inner">
              <button type="button" onClick={() => {
                if(currentStep === 1) handleAddCompany();
                else if(currentStep === 2) handleAddPosition();
                else if(currentStep === 3) handleAddPrefix();
                else if(currentStep === 4) handleAddModel();
              }} className="p-2 bg-white text-emerald-600 rounded-lg shadow-xs border border-slate-200 cursor-pointer" title="Adicionar Novo"><Plus className="w-4 h-4 stroke-[3]" /></button>
              <button type="button" onClick={() => setManagementMode(prev => prev === 'edit' ? 'select' : 'edit')} className={`p-2 rounded-lg transition-all cursor-pointer ${managementMode === 'edit' ? 'bg-amber-500 text-white' : 'bg-white text-amber-600 border border-slate-200'}`} title="Editar"><Edit2 className="w-4 h-4" /></button>
              <button type="button" onClick={() => setManagementMode(prev => prev === 'delete' ? 'select' : 'delete')} className={`p-2 rounded-lg transition-all cursor-pointer ${managementMode === 'delete' ? 'bg-rose-600 text-white' : 'bg-white text-rose-600 border border-slate-200'}`} title="Excluir"><Trash2 className="w-4 h-4" /></button>
           </div>
        </div>

        {/* STEP 1: Companhia */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Selecione a Companhia Aérea</h3>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-3">
              {companhias.map((comp) => {
                const isSelected = String(selectedCompanhiaId) === String(comp.id_companhia);
                return (
                  <button
                    key={comp.id_companhia}
                    type="button"
                    onClick={() => handleSelectCompany(comp.id_companhia)}
                    className={`p-4 rounded-3xl border-2 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer active:scale-95 shadow-xs ${
                      managementMode === 'edit'
                        ? 'bg-amber-50 border-amber-400 text-amber-900'
                        : managementMode === 'delete'
                        ? 'bg-rose-50 border-rose-400 text-rose-900'
                        : isSelected
                        ? 'bg-sky-900 border-sky-900 text-white shadow-md'
                        : 'bg-white border-slate-100 text-slate-800 hover:border-sky-300'
                    }`}
                  >
                    <AirlineLogo icao={comp.icao} nome_companhia={comp.nome_companhia} size="lg" />
                    <span className="text-[11px] font-black tracking-tight text-center truncate w-full">{comp.nome_companhia}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Posição Box */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex justify-between items-center px-1">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Selecione o Box / Posição</h3>
               <div className="flex bg-slate-200 p-1 rounded-xl">
                 <button type="button" onClick={() => setGrupoPosicao('principal')} className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${grupoPosicao === 'principal' ? 'bg-sky-900 text-white shadow-xs' : 'text-slate-600'}`}>Principal</button>
                 <button type="button" onClick={() => setGrupoPosicao('remota')} className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${grupoPosicao === 'remota' ? 'bg-sky-900 text-white shadow-xs' : 'text-slate-600'}`}>Remota</button>
               </div>
            </div>

            <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-6 gap-2.5">
              {positions.filter(p => grupoPosicao === 'principal' ? !p.includes('REM') : p.includes('REM')).map((pos) => {
                const isSelected = posicaoPatio === pos;
                return (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => { setPosicaoPatio(pos); setCurrentStep(3); }}
                    className={`py-4 rounded-2xl border-2 font-mono font-black text-base transition-all cursor-pointer active:scale-95 shadow-xs ${
                      isSelected ? 'bg-amber-400 border-amber-500 text-sky-950 shadow-md' : 'bg-white border-slate-100 text-slate-800 hover:border-sky-300'
                    }`}
                  >
                    {pos}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex justify-start">
              <button type="button" onClick={() => setCurrentStep(1)} className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 rounded-xl text-xs font-black uppercase text-slate-700 cursor-pointer flex items-center gap-1.5"><ChevronLeft className="w-4 h-4"/> Voltar</button>
            </div>
          </div>
        )}

        {/* STEP 3: Matrícula */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Informe a Matrícula da Aeronave</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Ex: PR-AXG ou PT-MZY"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value.toUpperCase())}
                autoFocus
                className="w-full bg-white border-2 border-slate-200 rounded-3xl p-5 text-xl font-mono font-black text-sky-950 uppercase outline-hidden focus:border-sky-600 shadow-sm"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {prefixes.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setMatricula(prev => prev ? prev + p : p)}
                  className="py-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl font-mono font-bold text-xs text-slate-700 shadow-2xs cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="pt-4 flex justify-between">
              <button type="button" onClick={() => setCurrentStep(2)} className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 rounded-xl text-xs font-black uppercase text-slate-700 cursor-pointer flex items-center gap-1.5"><ChevronLeft className="w-4 h-4"/> Voltar</button>
              <button type="button" onClick={() => { if(matricula.trim()) setCurrentStep(4); else alert('Informe a matrícula.'); }} className="px-8 py-3 bg-sky-900 text-white rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-md flex items-center gap-1.5">Avançar <ChevronRight className="w-4 h-4"/></button>
            </div>
          </div>
        )}

        {/* STEP 4: Modelo / Equipamento */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Equipamento / Modelo (Opcional)</h3>
            <div className="grid grid-cols-3 xs:grid-cols-4 gap-2.5">
              {modelos.map((mod) => {
                const isSelected = selectedModelo === mod;
                return (
                  <button
                    key={mod}
                    type="button"
                    onClick={() => setSelectedModelo(mod)}
                    className={`py-3.5 px-3 rounded-2xl border-2 font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                      isSelected ? 'bg-sky-900 border-sky-900 text-white shadow-md' : 'bg-white border-slate-100 text-slate-800 hover:border-sky-300'
                    }`}
                  >
                    {mod}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 flex justify-between">
              <button type="button" onClick={() => setCurrentStep(3)} className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 rounded-xl text-xs font-black uppercase text-slate-700 cursor-pointer flex items-center gap-1.5"><ChevronLeft className="w-4 h-4"/> Voltar</button>
              <button type="button" onClick={() => setCurrentStep(5)} className="px-8 py-3 bg-sky-900 text-white rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-md flex items-center gap-1.5">Avançar <ChevronRight className="w-4 h-4"/></button>
            </div>
          </div>
        )}

        {/* STEP 5: Desembarque Híbrido & Finalizar */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="space-y-3">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Tipo de Desembarque (Ponte / Híbrido)</h3>
               <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDesembarqueHibrido('Não')}
                    className={`p-5 rounded-3xl border-2 text-center transition-all cursor-pointer ${
                      desembarqueHibrido === 'Não' ? 'bg-sky-900 border-sky-900 text-white shadow-md' : 'bg-white border-slate-100 text-slate-800'
                    }`}
                  >
                    <span className="block text-sm font-black uppercase">Padrão (Ponte)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDesembarqueHibrido('Sim')}
                    className={`p-5 rounded-3xl border-2 text-center transition-all cursor-pointer ${
                      desembarqueHibrido === 'Sim' ? 'bg-amber-500 border-amber-600 text-white shadow-md' : 'bg-white border-slate-100 text-slate-800'
                    }`}
                  >
                    <span className="block text-sm font-black uppercase">Híbrido (Misto)</span>
                  </button>
               </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border-2 border-slate-100 shadow-xs space-y-2 text-xs font-mono">
               <div className="flex justify-between border-b pb-2"><span className="text-slate-400">Matrícula:</span><strong className="text-sky-950 font-black text-sm">{matricula || 'N/A'}</strong></div>
               <div className="flex justify-between border-b pb-2"><span className="text-slate-400">Posição:</span><strong className="text-slate-900 font-bold">BOX {posicaoPatio}</strong></div>
               <div className="flex justify-between border-b pb-2"><span className="text-slate-400">Modelo:</span><strong className="text-slate-900 font-bold">{selectedModelo || 'Não especificado'}</strong></div>
               <div className="flex justify-between"><span className="text-slate-400">Desembarque:</span><strong className="text-slate-900 font-bold">{desembarqueHibrido === 'Sim' ? 'HÍBRIDO' : 'PADRÃO'}</strong></div>
            </div>

            <div className="pt-4 flex justify-between items-center">
              <button type="button" onClick={() => setCurrentStep(4)} className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 rounded-xl text-xs font-black uppercase text-slate-700 cursor-pointer flex items-center gap-1.5"><ChevronLeft className="w-4 h-4"/> Voltar</button>
              <button
                type="submit"
                className="px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-xl uppercase tracking-wider cursor-pointer active:scale-95 transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" /> Salvar Pouso
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
