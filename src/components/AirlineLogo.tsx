import React from 'react';

interface AirlineLogoProps {
  icao?: string;
  nome_companhia?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AirlineLogo: React.FC<AirlineLogoProps> = ({
  icao = '',
  nome_companhia = '',
  className = '',
  size = 'md',
}) => {
  const code = (icao || nome_companhia || '').toUpperCase().trim();

  // Azul Conecta
  if (code.includes('CONECTA') || code.includes('ACN')) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0284c7] text-white font-black rounded-xl text-xs shadow-md border border-sky-300 ${className}`}>
        <span className="text-amber-300">✦</span> AZUL CONECTA
      </div>
    );
  }

  // Azul Linhas Aéreas
  if (code.includes('AZU') || code.includes('AZUL')) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-4 py-2 bg-[#00529b] text-white font-black rounded-xl text-sm shadow-md border-2 border-blue-400 ${className}`}>
        <span className="text-amber-300 text-base">✦</span> AZUL
      </div>
    );
  }

  // Mercado Livre / Meli Air
  if (code.includes('MELI') || code.includes('MERCADO') || code.includes('LIVRE')) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ffe600] text-[#1e1b4b] font-black rounded-xl text-xs shadow-md border border-yellow-400 ${className}`}>
        <span>📦</span> MELI AIR
      </div>
    );
  }

  // LATAM
  if (code.includes('TAM') || code.includes('LATAM')) {
    return (
      <div className={`inline-flex items-center gap-1 px-4 py-2 bg-[#1b004c] text-white font-black rounded-xl text-sm shadow-md border-2 border-purple-500 ${className}`}>
        <span className="text-white">LA</span><span className="text-[#ff0055] font-black ml-0.5">TAM</span>
      </div>
    );
  }

  // GOL
  if (code.includes('GLO') || code.includes('GOL')) {
    return (
      <div className={`inline-flex items-center gap-1 px-4 py-2 bg-[#ff6600] text-white font-black italic rounded-xl text-sm shadow-md border-2 border-orange-400 ${className}`}>
        <span>GOL</span><span className="text-amber-200 ml-1">✈</span>
      </div>
    );
  }

  // VOEPASS
  if (code.includes('PTB') || code.includes('VOEPASS') || code.includes('PASSAREDO')) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00a3e0] text-white font-black rounded-xl text-xs shadow-md border border-cyan-400 ${className}`}>
        <span>VOEPASS</span>
      </div>
    );
  }

  // TOTAL
  if (code.includes('TTL') || code.includes('TOTAL')) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1e3a8a] text-amber-300 font-black rounded-xl text-xs shadow-md border border-blue-600 ${className}`}>
        <span>TOTAL</span>
      </div>
    );
  }

  // MODERN LOGISTICS
  if (code.includes('MWM') || code.includes('MODERN')) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#334155] text-white font-black rounded-xl text-xs shadow-md border border-slate-500 ${className}`}>
        <span className="text-sky-400">■</span> MODERN
      </div>
    );
  }

  // SIDERAL
  if (code.includes('SID') || code.includes('SIDERAL')) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0284c7] text-white font-black rounded-xl text-xs shadow-md border border-sky-400 ${className}`}>
        <span>SIDERAL</span>
      </div>
    );
  }

  // FORÇAS ARMADAS BRASILEIRAS (FAB)
  if (code.includes('FAB') || code.includes('ARMADAS') || code.includes('FORÇAS')) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#003366] text-[#fcd34d] font-black rounded-xl text-xs shadow-md border border-sky-800 ${className}`}>
        <span>🎖️ FAB</span>
      </div>
    );
  }

  // Default fallback
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 text-white font-black rounded-xl text-xs shadow-md border border-slate-600 ${className}`}>
      <span>{icao || nome_companhia.toUpperCase()}</span>
    </div>
  );
};
