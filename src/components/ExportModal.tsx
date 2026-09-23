import React, { useState, useEffect } from 'react';
import { X, Download, FileSpreadsheet, Printer, FileText, BarChart3, ChevronRight, Check, RefreshCw, Plane, AlertCircle, Share2, Loader2, ArrowLeft } from 'lucide-react';
import { MovimentacaoAeronave, StatSummary } from '../types';
import { MOCK_MOVIMENTACOES } from '../data/mockData';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  movimentacoes: MovimentacaoAeronave[];
  stats: StatSummary;
  onPreparePrint: (data: MovimentacaoAeronave[], stats: StatSummary, mode: 'OPERATIONAL' | 'MANAGEMENT' | 'SHIFTHANDOVER' | 'AIRLINE', period: string, airline?: string) => void;
  initialFilters?: { dataInicio: string; dataFim: string };
  companhias: { id_companhia: number | string; nome_companhia: string }[];
  autoTriggerMode?: 'OPERATIONAL' | 'MANAGEMENT' | 'SHIFTHANDOVER' | 'AIRLINE' | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  movimentacoes = [],
  stats,
  onPreparePrint,
  initialFilters,
  companhias = [],
  autoTriggerMode
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'HOJE' | 'SEMANA' | 'MES' | 'TUDO' | 'CUSTOM'>(
    initialFilters?.dataInicio || initialFilters?.dataFim ? 'CUSTOM' : 'TUDO'
  );
  const [selectedAirline, setSelectedAirline] = useState<string>('TODAS');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [customDates, setCustomDates] = useState({
    inicio: initialFilters?.dataInicio || '',
    fim: initialFilters?.dataFim || '',
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // Detect platform correctly using Capacitor
  const isNativeApp = Capacitor.isNativePlatform();

  // Auto trigger report if requested
  useEffect(() => {
    if (autoTriggerMode && isOpen && !isGenerating) {
      const timer = setTimeout(() => {
        handleAction(autoTriggerMode);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [autoTriggerMode, isOpen]);

  if (!isOpen) return null;

  const getFilteredData = () => {
    let list = Array.isArray(movimentacoes) && movimentacoes.length > 0 ? movimentacoes : [];
    if (list.length === 0) {
      try {
        const saved = localStorage.getItem('cgb_movimentacoes_data_v1');
        if (saved) list = JSON.parse(saved);
      } catch (e) {}
    }
    if (list.length === 0) {
      list = MOCK_MOVIMENTACOES;
    }

    const filtered = list.filter((item) => {
      if (!item) return false;
      // Filtro de Companhia
      if (selectedAirline !== 'TODAS' && item.nome_companhia !== selectedAirline) return false;

      // Filtro de Período
      const itemDate = new Date((item.data_cadastro || '2026-01-01') + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedPeriod === 'HOJE') {
        const todayStr = new Date().toISOString().split('T')[0];
        if (item.data_cadastro !== todayStr) return false;
      } else if (selectedPeriod === 'SEMANA') {
        const now = new Date();
        const day = now.getDay();
        const diffToMonday = day === 0 ? -6 : 1 - day;
        const mondayDate = new Date(now);
        mondayDate.setDate(now.getDate() + diffToMonday);
        const sundayDate = new Date(mondayDate);
        sundayDate.setDate(mondayDate.getDate() + 6);
        const mondayStr = `${mondayDate.getFullYear()}-${String(mondayDate.getMonth() + 1).padStart(2, '0')}-${String(mondayDate.getDate()).padStart(2, '0')}`;
        const sundayStr = `${sundayDate.getFullYear()}-${String(sundayDate.getMonth() + 1).padStart(2, '0')}-${String(sundayDate.getDate()).padStart(2, '0')}`;
        if (item.data_cadastro < mondayStr || item.data_cadastro > sundayStr) return false;
      } else if (selectedPeriod === 'MES') {
        if (itemDate.getMonth() !== today.getMonth() || itemDate.getFullYear() !== today.getFullYear()) return false;
      } else if (selectedPeriod === 'CUSTOM') {
        if (customDates.inicio && !customDates.fim) {
           if (item.data_cadastro !== customDates.inicio) return false;
        } else {
           if (customDates.inicio && item.data_cadastro < customDates.inicio) return false;
           if (customDates.fim && item.data_cadastro > customDates.fim) return false;
        }
      }
      return true;
    });

    // Sort strictly by timestamp (date + hours, minutes, seconds)
    return filtered.sort((a, b) => {
      const timeA = new Date(`${a.data_cadastro || '1970-01-01'}T${a.horario_cadastro || '00:00:00'}`).getTime() || 0;
      const timeB = new Date(`${b.data_cadastro || '1970-01-01'}T${b.horario_cadastro || '00:00:00'}`).getTime() || 0;
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
  };

  const dadosParaExportar = getFilteredData();

  // Calcular stats para os dados filtrados
  const totalMov = dadosParaExportar.length;
  const totalHib = dadosParaExportar.filter(m => m.desembarque_hibrido === 'Sim').length;
  const statsFiltrados: StatSummary = stats || {
    totalMovimentacoes: totalMov,
    totalHibrido: totalHib,
    taxaHibrido: totalMov > 0 ? (totalHib / totalMov) * 100 : 0,
    topCompanhia: { nome: 'N/A', total: 0, percentual: 0 }
  };

  const getPeriodDescription = () => {
    const formatD = (d: string) => d.split('-').reverse().join('/');
    if (selectedPeriod === 'HOJE') return `DIA ${new Date().toLocaleDateString('pt-BR')}`;
    if (selectedPeriod === 'SEMANA') return 'ÚLTIMA SEMANA';
    if (selectedPeriod === 'MES') return 'MÊS ATUAL';
    if (selectedPeriod === 'CUSTOM') {
      const start = customDates.inicio ? formatD(customDates.inicio) : 'INÍCIO';
      const end = customDates.fim ? formatD(customDates.fim) : '';
      if (customDates.inicio && (!customDates.fim || customDates.inicio === customDates.fim)) return `DIA ${start}`;
      return `PERÍODO: ${start} a ${end || 'HOJE'}`;
    }
    return 'HISTÓRICO COMPLETO';
  };

  const handlePrint = (mode: 'OPERATIONAL' | 'MANAGEMENT' | 'SHIFTHANDOVER' | 'AIRLINE') => {
    const dataAtualizada = getFilteredData();
    const totalM = dataAtualizada.length;
    const totalH = dataAtualizada.filter(m => m.desembarque_hibrido === 'Sim').length;
    const statsAtuais: StatSummary = {
      ...(stats || { totalMovimentacoes: totalM, totalHibrido: totalH, taxaHibrido: 0, topCompanhia: { nome: 'N/A', total: 0, percentual: 0 } }),
      totalMovimentacoes: totalM,
      totalHibrido: totalH,
      taxaHibrido: totalM > 0 ? (totalH / totalM) * 100 : 0,
    };
    onPreparePrint(dataAtualizada, statsAtuais, mode, getPeriodDescription(), selectedAirline !== 'TODAS' ? selectedAirline : undefined);
    setTimeout(() => {
      window.print();
    }, 800);
  };

  const handleNativeShare = async (mode: 'OPERATIONAL' | 'MANAGEMENT' | 'SHIFTHANDOVER' | 'AIRLINE') => {
    try {
      setIsGenerating(true);
      const dataAtualizada = getFilteredData();
      const totalM = dataAtualizada.length;
      const totalH = dataAtualizada.filter(m => m.desembarque_hibrido === 'Sim').length;
      const statsAtuais: StatSummary = {
        ...(stats || { totalMovimentacoes: totalM, totalHibrido: totalH, taxaHibrido: 0, topCompanhia: { nome: 'N/A', total: 0, percentual: 0 } }),
        totalMovimentacoes: totalM,
        totalHibrido: totalH,
        taxaHibrido: totalM > 0 ? (totalH / totalM) * 100 : 0,
      };
      onPreparePrint(dataAtualizada, statsAtuais, mode, getPeriodDescription(), selectedAirline !== 'TODAS' ? selectedAirline : undefined);

      await new Promise(resolve => setTimeout(resolve, 1500));

      const element = document.getElementById('report-container');
      if (!element) throw new Error('Container do relatório não encontrado');

      const originalDisplay = element.style.display;
      const originalOpacity = element.style.opacity;
      const originalPosition = element.style.position;
      const originalZIndex = element.style.zIndex;
      const originalWidth = element.style.width;

      element.style.display = 'block';
      element.style.opacity = '1';
      element.style.position = 'absolute';
      element.style.left = '-9999px';
      element.style.top = '0';
      element.style.width = '794px';
      element.style.zIndex = '9999';

      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        windowWidth: 794,
        onclone: (clonedDoc) => {
          const styleTags = Array.from(clonedDoc.getElementsByTagName('style'));
          styleTags.forEach(tag => tag.remove());
          const linkTags = Array.from(clonedDoc.getElementsByTagName('link'));
          linkTags.forEach(link => { if (link.rel === 'stylesheet') link.remove(); });
        }
      });

      element.style.display = originalDisplay;
      element.style.opacity = originalOpacity;
      element.style.position = originalPosition;
      element.style.zIndex = originalZIndex;
      element.style.width = originalWidth;

      const imgData = canvas.toDataURL('image/jpeg', 0.75);
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', compress: true });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      const pdfBase64 = pdf.output('datauristring').split(',')[1];
      const fileName = `Relatorio_${mode}_${Date.now()}.pdf`;

      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: pdfBase64,
        directory: Directory.Cache
      });

      await Share.share({
        title: `Relatório CGB - ${mode}`,
        text: 'Documento gerado pelo sistema Patio-CGB.',
        url: savedFile.uri,
        dialogTitle: 'Compartilhar Relatório'
      });
    } catch (error: any) {
      alert(`Falha ao gerar PDF: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToCSV = () => {
    const dataAtualizada = getFilteredData();
    const headers = ['id_registro', 'data_cadastro', 'horario_cadastro', 'matricula', 'nome_companhia', 'desembarque_hibrido', 'posicao_patio', 'tipo_aeronave'];
    const rows = dataAtualizada.map((item) => [
      item.id_registro, item.data_cadastro, item.horario_cadastro, item.matricula, `"${item.nome_companhia}"`, item.desembarque_hibrido, item.posicao_patio || '', `"${item.tipo_aeronave || ''}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_patio_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAction = (mode: 'OPERATIONAL' | 'MANAGEMENT' | 'SHIFTHANDOVER' | 'AIRLINE') => {
    if (isNativeApp) handleNativeShare(mode);
    else handlePrint(mode);
  };

  return (
    <>
      {isGenerating && (
        <div className="fixed inset-0 z-[100] bg-sky-950/70 backdrop-blur-md flex flex-col items-center justify-center text-white p-6 text-center left-0 top-0 w-screen h-screen">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 shadow-2xl border border-white/20">
            <Loader2 className="w-12 h-12 animate-spin text-amber-400" />
          </div>
          <h3 className="font-black text-xl uppercase tracking-widest mb-2 shadow-sm">Processando Documento</h3>
          <p className="text-sm text-sky-200 max-w-xs font-medium leading-relaxed">
            Renderizando dados operacionais em alta qualidade.<br/>
            O menu de compartilhamento abrirá em instantes.
          </p>
        </div>
      )}

      <div className="flex-1 flex flex-col bg-slate-50 animate-in fade-in duration-150 w-full h-full overflow-hidden box-border">
        {/* Header Card Standard (Emerald Green matching Relatórios tile color) */}
        <div className="bg-emerald-600 text-white p-6 sm:p-8 rounded-[32px] shadow-xl relative overflow-hidden border border-emerald-500 m-4 sm:m-6 mb-0">
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                 <div className="p-3 bg-white/20 rounded-2xl shadow-md"><Download className="w-6 h-6 text-white" /></div>
                 <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Central de Relatórios (CGB)</h2>
              </div>
              <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest pl-1">Exportação de documentos e dados operacionais</p>
            </div>
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all active:scale-95 text-xs font-black uppercase tracking-wider border border-white/20 cursor-pointer text-white shadow-md"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
        </div>

        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-200 pb-24">
          {/* 1. Filtro de Período */}
          <div className="space-y-4">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-amber-500" />
              1. Período Selecionado
            </label>
            <div className="grid grid-cols-3 xs:grid-cols-5 gap-2">
              {(['HOJE', 'SEMANA', 'MES', 'TUDO', 'CUSTOM'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`py-3 px-1 rounded-2xl text-[11px] font-black border-2 transition-all truncate shadow-xs cursor-pointer ${
                    selectedPeriod === period ? 'bg-sky-900 border-sky-900 text-white' : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  {period === 'CUSTOM' ? 'OUTRO' : period}
                </button>
              ))}
            </div>

            {selectedPeriod === 'CUSTOM' && (
              <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 p-4 bg-white rounded-3xl border-2 border-slate-100 shadow-xs animate-in slide-in-from-top-2">
                <div className="flex-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1 tracking-widest">Início:</p>
                  <input type="date" value={customDates.inicio} onChange={(e) => setCustomDates({...customDates, inicio: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-sm font-bold text-slate-700 outline-hidden focus:border-sky-500 focus:bg-white" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1 tracking-widest">Fim:</p>
                  <input type="date" value={customDates.fim} onChange={(e) => setCustomDates({...customDates, fim: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-sm font-bold text-slate-700 outline-hidden focus:border-sky-500 focus:bg-white" />
                </div>
              </div>
            )}
          </div>

          {/* 2. Filtro de Empresa */}
          <div className="space-y-4">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-amber-500" />
              2. Empresa Aérea
            </label>
            <select
              value={selectedAirline}
              onChange={(e) => setSelectedAirline(e.target.value)}
              className="w-full bg-white border-2 border-slate-200 rounded-3xl p-4 text-sm font-black text-slate-800 outline-hidden focus:border-sky-600 shadow-xs appearance-none transition-all cursor-pointer"
            >
              <option value="TODAS">Todas as Companhias Operantes</option>
              {companhias.map(c => <option key={c.id_companhia} value={c.nome_companhia}>{c.nome_companhia}</option>)}
            </select>
          </div>

          {/* 3. Ordem de Exibição */}
          <div className="space-y-4">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-amber-500" />
              3. Ordem de Exibição (Data e Hora)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSortOrder('desc')}
                className={`py-3.5 px-4 rounded-2xl text-xs font-black border-2 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                  sortOrder === 'desc' ? 'bg-sky-900 border-sky-900 text-white' : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                ↓ Decrescente (Mais Recentes)
              </button>
              <button
                onClick={() => setSortOrder('asc')}
                className={`py-3.5 px-4 rounded-2xl text-xs font-black border-2 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                  sortOrder === 'asc' ? 'bg-sky-900 border-sky-900 text-white' : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                ↑ Crescente (Mais Antigas)
              </button>
            </div>
          </div>

          {/* 4. Seleção de Formato */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-amber-500" />
              4. Gerar Documento
            </label>

            <div className="grid grid-cols-1 gap-3">
              {/* Relatório de Pátio */}
              <button
                onClick={() => handleAction('OPERATIONAL')}
                disabled={isGenerating}
                className="group flex items-center justify-between p-4 bg-white border-2 border-slate-100 hover:border-sky-600 rounded-3xl transition-all active:scale-95 shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="p-3.5 bg-amber-100 text-amber-700 rounded-2xl shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors shadow-2xs">
                    <Printer className="w-7 h-7" />
                  </div>
                  <div className="text-left overflow-hidden">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase truncate">Relatório de Pátio (PDF)</h3>
                    <p className="text-xs text-slate-500 font-medium truncate">Documento oficial para assinaturas.</p>
                  </div>
                </div>
                <Share2 className="w-5 h-5 text-sky-600 shrink-0 ml-2" />
              </button>

              {/* Resumo BI */}
              <button
                onClick={() => handleAction('MANAGEMENT')}
                disabled={isGenerating}
                className="group flex items-center justify-between p-4 bg-white border-2 border-slate-100 hover:border-sky-600 rounded-3xl transition-all active:scale-95 shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="p-3.5 bg-sky-100 text-sky-700 rounded-2xl shrink-0 group-hover:bg-sky-600 group-hover:text-white transition-colors shadow-2xs">
                    <BarChart3 className="w-7 h-7" />
                  </div>
                  <div className="text-left overflow-hidden">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase truncate">Resumo Gerencial (PDF)</h3>
                    <p className="text-xs text-slate-500 font-medium truncate">Análise de Market Share e Performance.</p>
                  </div>
                </div>
                <Share2 className="w-5 h-5 text-sky-600 shrink-0 ml-2" />
              </button>

              {/* Passagem de Turno */}
              <button
                onClick={() => handleAction('SHIFTHANDOVER')}
                disabled={isGenerating}
                className="group flex items-center justify-between p-4 bg-white border-2 border-slate-100 hover:border-amber-600 rounded-3xl transition-all active:scale-95 shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="p-3.5 bg-amber-50 text-amber-700 rounded-2xl shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors shadow-2xs">
                    <RefreshCw className="w-7 h-7" />
                  </div>
                  <div className="text-left overflow-hidden">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase truncate">Passagem de Turno (PDF)</h3>
                    <p className="text-xs text-slate-500 font-medium truncate">Ocorrências e pendências de solo.</p>
                  </div>
                </div>
                <Share2 className="w-5 h-5 text-sky-600 shrink-0 ml-2" />
              </button>

              {/* Planilha CSV */}
              <button
                onClick={exportToCSV}
                className="group flex items-center justify-between p-4 bg-white border-2 border-emerald-100 hover:border-emerald-600 rounded-3xl transition-all active:scale-95 shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="p-3.5 bg-emerald-100 text-emerald-700 rounded-2xl shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-2xs">
                    <FileSpreadsheet className="w-7 h-7" />
                  </div>
                  <div className="text-left overflow-hidden">
                    <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase truncate">Planilha de Dados (CSV)</h3>
                    <p className="text-xs text-slate-500 font-medium truncate">Exportar para Excel ou Google Sheets.</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-emerald-400 shrink-0 ml-2" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-white border-t border-slate-200 p-5 flex justify-between items-center px-6 shrink-0 shadow-sm">
          <p className="text-sm text-slate-500 font-black flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-700" />
            {dadosParaExportar.length} POUSOS FILTRADOS
          </p>
          <div className="flex items-center gap-3">
             <button
               onClick={onClose}
               className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-2xl uppercase tracking-widest shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-2"
             >
               <ArrowLeft className="w-4 h-4" /> Voltar
             </button>
          </div>
        </div>
      </div>
    </>
  );
};
