import React, { useState, useEffect } from 'react';
import { Plane, X } from 'lucide-react';
import { getPendingSyncCount } from '../services/syncService';

interface HeaderProps {
  activeScreen: 'home' | 'cadastro' | 'pousos' | 'relatorios' | 'exportar' | 'seguranca' | 'usuarios' | 'programacao';
  onNavigate: (screen: 'home' | 'cadastro' | 'pousos' | 'relatorios' | 'exportar' | 'seguranca' | 'usuarios' | 'programacao') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeScreen, onNavigate }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(() => {
      setPendingCount(getPendingSyncCount());
    }, 3000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const getScreenTitle = () => {
    switch (activeScreen) {
      case 'cadastro': return 'Pátio';
      case 'pousos': return 'Pousos';
      case 'relatorios': return 'Administração';
      case 'exportar': return 'Relatórios';
      case 'seguranca': return 'Segurança';
      case 'usuarios': return 'Equipe';
      case 'programacao': return 'Programação SIV';
      default: return '';
    }
  };

  // Dynamic header color matching menu tile color scheme (Equipe is Teal)
  const getHeaderBgClass = () => {
    switch (activeScreen) {
      case 'cadastro': return 'bg-blue-600 border-blue-700';
      case 'pousos': return 'bg-sky-600 border-sky-700';
      case 'exportar': return 'bg-emerald-600 border-emerald-700';
      case 'seguranca': return 'bg-amber-600 border-amber-700';
      case 'relatorios': return 'bg-purple-700 border-purple-800';
      case 'usuarios': return 'bg-teal-600 border-teal-700';
      case 'programacao': return 'bg-indigo-600 border-indigo-700';
      default: return 'bg-sky-950 border-sky-900';
    }
  };

  const getStatusColorClass = () => {
    if (!isOnline) return 'bg-rose-600 text-white shadow-rose-900/50';
    if (pendingCount > 0) return 'bg-amber-400 text-sky-950 animate-pulse shadow-amber-400/50';
    return 'bg-emerald-500 text-white shadow-emerald-500/50';
  };

  const getStatusTooltip = () => {
    if (!isOnline) return 'Modo Offline: Dados salvos localmente';
    if (pendingCount > 0) return `Online: Sincronizando ${pendingCount} registro(s) com Supabase`;
    return 'Online e Sincronizado com Supabase';
  };

  return (
    <header className={`text-white px-3 sm:px-6 py-3 shadow-md sticky top-0 z-30 border-b w-full transition-colors duration-300 ${getHeaderBgClass()}`}>
      <div className="flex items-center justify-between max-w-full mx-auto w-full gap-2">
        {/* Left: Brand logo / Home Link */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 font-extrabold cursor-pointer hover:opacity-90 active:scale-95 transition-transform group"
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-black shadow-md shrink-0 transition-colors ${getStatusColorClass()}`}
              title={getStatusTooltip()}
            >
              <Plane className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="tracking-tight text-amber-300 font-black text-xs sm:text-sm uppercase whitespace-nowrap">
                Gestão e Acompanhamento de Pátio
              </span>
              <span className="text-[8px] font-black text-white/80 uppercase tracking-widest mt-0.5">
                Aeroporto de Cuiabá • v1.9.1
              </span>
            </div>
          </button>
        </div>

        {/* Right Section: Screen Title & Close Button */}
        <div className="flex items-center gap-3">
          {activeScreen !== 'home' && (
            <span className="tracking-tight text-white font-black text-sm sm:text-base uppercase whitespace-nowrap overflow-hidden text-ellipsis bg-black/20 px-3 py-1 rounded-lg border border-white/20">
              {getScreenTitle()}
            </span>
          )}

          {activeScreen !== 'home' ? (
            <button
              onClick={() => onNavigate('home')}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 text-white flex items-center justify-center font-black shadow-md cursor-pointer transition-transform hover:scale-110 active:scale-95 ring-2 ring-white/40 shrink-0"
              title="Voltar ao Início"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>
          ) : (
            <span className="hidden xs:inline text-[10px] sm:text-xs font-semibold text-white/80 whitespace-nowrap">
              Aeroporto CGB
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
