import React from 'react';
import { Plane, X } from 'lucide-react';

interface HeaderProps {
  activeScreen: 'home' | 'cadastro' | 'pousos' | 'relatorios' | 'exportar' | 'seguranca' | 'usuarios';
  onNavigate: (screen: 'home' | 'cadastro' | 'pousos' | 'relatorios' | 'exportar' | 'seguranca' | 'usuarios') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeScreen, onNavigate }) => {
  const getScreenTitle = () => {
    switch (activeScreen) {
      case 'cadastro':
        return 'Pátio';
      case 'pousos':
        return 'Pousos';
      case 'relatorios':
        return 'Administração';
      case 'exportar':
        return 'Relatórios';
      case 'seguranca':
        return 'Segurança';
      case 'usuarios':
        return 'Equipe';
      default:
        return '';
    }
  };

  return (
    <header className="bg-sky-950 text-white px-3 sm:px-6 py-3 shadow-md sticky top-0 z-30 border-b border-sky-900 w-full">
      <div className="flex items-center justify-between max-w-full mx-auto w-full">
        {/* Left: Brand logo / Home Link */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 font-extrabold cursor-pointer hover:opacity-90 active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 bg-amber-400 text-sky-950 rounded-lg flex items-center justify-center font-black shadow-xs shrink-0">
              <Plane className="w-5 h-5" />
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="tracking-tight text-amber-300 font-black text-xs sm:text-sm uppercase whitespace-nowrap">
                Gestão e Acompanhamento de Pátio
              </span>
              <span className="text-[8px] font-black text-sky-300 uppercase tracking-widest mt-0.5">
                Aeroporto de Cuiabá • v1.6.0
              </span>
            </div>
          </button>
        </div>

        {/* Center: Title */}
        <div className="flex-1 flex justify-center px-2 overflow-hidden">
          {activeScreen !== 'home' && (
            <span className="tracking-tight text-amber-300 font-black text-sm sm:text-lg uppercase whitespace-nowrap overflow-hidden text-ellipsis bg-sky-900/50 px-3 py-1 rounded-lg border border-sky-800">
              {getScreenTitle()}
            </span>
          )}
        </div>

        {/* Right: Close Button */}
        <div className="flex items-center justify-end min-w-[60px]">
          {activeScreen !== 'home' ? (
            <button
              onClick={() => onNavigate('home')}
              className="w-8 h-8 rounded-full bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white flex items-center justify-center font-black shadow-md cursor-pointer transition-transform hover:scale-110 active:scale-95 ring-2 ring-rose-300/40 shrink-0"
              title="Voltar ao Início"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>
          ) : (
            <span className="hidden xs:inline text-[10px] sm:text-xs font-semibold text-sky-300/80 whitespace-nowrap">
              Aeroporto CGB
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
