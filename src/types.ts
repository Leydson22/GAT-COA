export interface MovimentacaoAeronave {
  id_registro: string;
  matricula: string;
  id_companhia: number | string;
  nome_companhia: string;
  desembarque_hibrido: 'Sim' | 'Não';
  posicao_patio?: string;
  horario_cadastro: string; // HH:MM:SS
  data_cadastro: string; // YYYY-MM-DD
  tipo_aeronave?: string;
  status_edicao?: string;
  observacoes?: string;
  user_id?: string;
  user_email?: string;
}

export const POSICOES_PATIO_CGB = [
  ...Array.from({ length: 23 }, (_, i) => String(i + 1).padStart(2, '0')),
  ...Array.from({ length: 15 }, (_, i) => `A${String(i + 1).padStart(2, '0')}`),
];

export type FlightRecord = MovimentacaoAeronave;

export type DesembarqueHibrido = 'Sim' | 'Não';

export interface CompanhiaAerea {
  id_companhia: number | string;
  nome_companhia: string;
  icao: string;
  iata: string;
}

export interface FiltrosDashboard {
  nome_companhia: string;
  desembarque_hibrido: string;
  dataInicio: string;
  dataFim: string;
  buscaMatricula: string;
}

export interface StatSummary {
  totalMovimentacoes: number;
  totalHibrido: number;
  taxaHibrido: number;
  topCompanhia: {
    nome: string;
    total: number;
    percentual: number;
  };
}

export interface AuditLog {
  id: string;
  timestamp: string;
  dataHora: string;
  tipo: 'CRIACAO' | 'EDICAO' | 'EXCLUSAO' | 'STATUS_HIBRIDO' | 'ERRO' | 'MANUTENCAO';
  nivel: 'INFO' | 'AVISO' | 'ERRO';
  origem: 'PATIO_MOBILE' | 'AREA_ADM' | 'SISTEMA';
  usuarioDispositivo: string;
  descricao: string;
  detalhes?: string;
  matriculaAeronave?: string;
}

export type AirlineOption = {
  id: string;
  name: string;
  color: string;
};

export const AIRLINES: AirlineOption[] = [
  { id: 'AZU', name: 'Azul Linhas Aéreas', color: '#00529b' },
  { id: 'TAM', name: 'Latam Airlines Brasil', color: '#e2001a' },
  { id: 'GLO', name: 'Gol Linhas Aéreas', color: '#ff6600' },
  { id: 'ACN', name: 'Azul Conecta', color: '#0284c7' },
  { id: 'MELI', name: 'Mercado Livre (Meli)', color: '#ffe600' },
  { id: 'VOE', name: 'Voepass Linhas Aéreas', color: '#00a3e0' },
  { id: 'TTL', name: 'Total Linhas Aéreas', color: '#1e3a8a' },
  { id: 'MOD', name: 'Modern Logistics', color: '#475569' },
  { id: 'SID', name: 'Sideral Linhas Aéreas', color: '#0284c7' },
  { id: 'OUT', name: 'Outros / Av. Geral', color: '#64748b' },
];
