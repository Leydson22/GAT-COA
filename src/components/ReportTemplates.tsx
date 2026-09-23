import React from 'react';
import { MovimentacaoAeronave, StatSummary } from '../types';
import { Plane } from 'lucide-react';

interface ReportProps {
  movimentacoes: MovimentacaoAeronave[];
  stats: StatSummary;
  title: string;
  subtitle?: string;
  periodo?: string;
}

const sortMovimentacoesDesc = (movs: MovimentacaoAeronave[]) => {
  if (!Array.isArray(movs)) return [];
  return [...movs].sort((a, b) => {
    const dtA = `${a.data_cadastro || ''}T${a.horario_cadastro || ''}`;
    const dtB = `${b.data_cadastro || ''}T${b.horario_cadastro || ''}`;
    return dtB.localeCompare(dtA);
  });
};

const ReportHeader: React.FC<{ title: string; subtitle?: string; periodo?: string }> = ({ title, subtitle, periodo }) => (
  <div style={{ borderBottom: '2px solid #082f49', paddingBottom: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <div style={{ width: '40px', height: '40px', backgroundColor: '#082f49', color: '#fcd34d', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontWeight: '900', fontSize: '20px' }}>
          <Plane className="w-6 h-6" style={{ margin: 'auto' }} />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#082f49', letterSpacing: '-0.025em', lineHeight: '1' }}>CGB</h1>
      </div>
      <p style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Aeroporto Internacional de Cuiabá • Patio System
      </p>
    </div>
    <div style={{ textAlign: 'right' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', lineHeight: '1.25' }}>
        {title}
        {periodo && <span style={{ display: 'block', color: '#075985', fontSize: '14px', marginTop: '4px' }}>{periodo}</span>}
      </h2>
      {subtitle && <p style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', marginTop: '4px', letterSpacing: '0.05em' }}>{subtitle}</p>}
      <p style={{ fontSize: '9px', color: '#94a3b8', marginTop: '8px', fontStyle: 'italic', borderTop: '1px solid #f1f5f9', paddingTop: '4px' }}>
        Gerado em: {new Date().toLocaleString('pt-BR')}
      </p>
    </div>
  </div>
);

const ReportFooter: React.FC = () => (
  <div style={{ marginTop: '24px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '9px', color: '#94a3b8', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
    <span>© {new Date().getFullYear()} Centro-Oeste Airports (COA) - Área de Operações</span>
    <span>Página 1 de 1</span>
  </div>
);

export const DailyOperationalReport: React.FC<ReportProps> = ({ movimentacoes, stats, periodo }) => {
  const sortedMovs = sortMovimentacoesDesc(movimentacoes);

  return (
    <div style={{ backgroundColor: '#ffffff', fontFamily: 'sans-serif', color: '#0f172a', padding: '20px' }}>
      <ReportHeader
        title="Relatório Operacional Diário"
        periodo={periodo}
        subtitle="Movimentações de Aeronaves em Pátio (ISO 8601 Descendente)"
      />

      {/* KPI Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div style={{ border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
          <p style={{ fontSize: '9px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Total de Pousos</p>
          <p style={{ fontSize: '20px', fontWeight: '900', color: '#0c4a6e' }}>{stats.totalMovimentacoes}</p>
        </div>
        <div style={{ border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
          <p style={{ fontSize: '9px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Híbridos (Sim)</p>
          <p style={{ fontSize: '20px', fontWeight: '900', color: '#d97706' }}>{stats.totalHibrido}</p>
        </div>
        <div style={{ border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
          <p style={{ fontSize: '9px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Taxa de Utilização</p>
          <p style={{ fontSize: '20px', fontWeight: '900', color: '#1e293b' }}>{stats.taxaHibrido.toFixed(1)}%</p>
        </div>
        <div style={{ border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
          <p style={{ fontSize: '9px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Líder de Operação</p>
          <p style={{ fontSize: '14px', fontWeight: '900', color: '#082f49', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stats.topCompanhia.nome}</p>
        </div>
      </div>

      <table style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: '#082f49', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <tr>
            <th style={{ padding: '8px 12px', textAlign: 'left' }}>Data/Hora (ISO Desc)</th>
            <th style={{ padding: '8px 12px', textAlign: 'left' }}>Matrícula</th>
            <th style={{ padding: '8px 12px', textAlign: 'left' }}>Companhia</th>
            <th style={{ padding: '8px 12px', textAlign: 'center' }}>Box</th>
            <th style={{ padding: '8px 12px', textAlign: 'center' }}>Híbrido</th>
            <th style={{ padding: '8px 12px', textAlign: 'left' }}>Aeronave/Obs</th>
          </tr>
        </thead>
        <tbody style={{ border: '1px solid #e2e8f0' }}>
          {sortedMovs.map((m) => (
            <tr key={m.id_registro} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '8px 12px', whiteSpace: 'nowrap', fontWeight: '500' }}>
                {m.data_cadastro ? m.data_cadastro.split('-').reverse().join('/') : ''} {m.horario_cadastro}
              </td>
              <td style={{ padding: '8px 12px', fontWeight: '700', fontFamily: 'monospace' }}>{m.matricula}</td>
              <td style={{ padding: '8px 12px' }}>{m.nome_companhia}</td>
              <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: '700' }}>{m.posicao_patio || '—'}</td>
              <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: '900', color: '#334155' }}>{m.desembarque_hibrido ? m.desembarque_hibrido.toUpperCase() : ''}</td>
              <td style={{ padding: '8px 12px', color: '#64748b', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {m.tipo_aeronave || m.observacoes || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '80px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', padding: '0 40px' }}>
        <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '8px', textAlign: 'center' }}>
          <p style={{ fontSize: '10px', fontWeight: '700', color: '#1e293b' }}>Assinatura do Agente de Pátio</p>
          <p style={{ fontSize: '8px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '-0.025em' }}>Matrícula COA / Identificação</p>
        </div>
        <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '8px', textAlign: 'center' }}>
          <p style={{ fontSize: '10px', fontWeight: '700', color: '#1e293b' }}>Supervisão de Operações</p>
          <p style={{ fontSize: '8px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '-0.025em' }}>Validado via Patio-CGB</p>
        </div>
      </div>

      <ReportFooter />
    </div>
  );
};

export const ManagementReport: React.FC<ReportProps> = ({ stats, movimentacoes, title, periodo }) => {
  const sortedMovs = sortMovimentacoesDesc(movimentacoes);

  const volumetryByDate = React.useMemo(() => {
    const map: Record<string, { total: number, hibrido: number }> = {};
    sortedMovs.forEach(m => {
      if (!map[m.data_cadastro]) map[m.data_cadastro] = { total: 0, hibrido: 0 };
      map[m.data_cadastro].total++;
      if (m.desembarque_hibrido === 'Sim') map[m.data_cadastro].hibrido++;
    });
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
  }, [sortedMovs]);

  const marketShare = React.useMemo(() => {
    const map: Record<string, number> = {};
    sortedMovs.forEach(m => {
      map[m.nome_companhia] = (map[m.nome_companhia] || 0) + 1;
    });
    const total = sortedMovs.length || 1;
    return Object.entries(map)
      .map(([nome, count]) => ({ nome, count, percent: total > 0 ? (count / total) * 100 : 0 }))
      .sort((a, b) => b.count - a.count);
  }, [sortedMovs]);

  return (
    <div style={{ backgroundColor: '#ffffff', fontFamily: 'sans-serif', color: '#0f172a', padding: '20px' }}>
      <ReportHeader
        title={title}
        periodo={periodo}
        subtitle="Indicadores Gerenciais de Performance (BI - Organizado ISO Desc)"
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        <section>
          <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#082f49', textTransform: 'uppercase', borderLeft: '4px solid #f59e0b', paddingLeft: '12px', marginBottom: '16px' }}>
            Resumo Geral de Operações
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ border: '1px solid #e2e8f0', padding: '20px', borderRadius: '16px', backgroundColor: '#f8fafc' }}>
              <p style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Total de Movimentações</p>
              <p style={{ fontSize: '30px', fontWeight: '900', color: '#0c4a6e' }}>{stats.totalMovimentacoes}</p>
            </div>
            <div style={{ border: '1px solid #e2e8f0', padding: '20px', borderRadius: '16px', backgroundColor: '#f8fafc' }}>
              <p style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Índice de Desembarque Híbrido</p>
              <p style={{ fontSize: '30px', fontWeight: '900', color: '#d97706' }}>{stats.taxaHibrido.toFixed(1)}%</p>
            </div>
          </div>
        </section>

        <section className="avoid-break">
          <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#082f49', textTransform: 'uppercase', borderLeft: '4px solid #f59e0b', paddingLeft: '12px', marginBottom: '16px' }}>
            Market Share Completo (Participação por Empresa)
          </h3>
          <table style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f1f5f9', color: '#334155' }}>
              <tr>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>Companhia Aérea</th>
                <th style={{ padding: '8px 12px', textAlign: 'center', width: '96px' }}>Operações</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', width: '128px' }}>Participação %</th>
              </tr>
            </thead>
            <tbody style={{ borderBottom: '1px solid #f1f5f9' }}>
              {marketShare.map((item) => (
                <tr key={item.nome} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 12px', fontWeight: '700' }}>{item.nome}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>{item.count}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '900', color: '#075985' }}>{item.percent.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="avoid-break">
          <h3 style={{ fontSize: '14px', fontWeight: '900', color: '#082f49', textTransform: 'uppercase', borderLeft: '4px solid #f59e0b', paddingLeft: '12px', marginBottom: '16px' }}>
            Volumetria Diária e Utilização Híbrida (ISO 8601 Desc)
          </h3>
          <table style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f1f5f9', color: '#334155' }}>
              <tr>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>Data</th>
                <th style={{ padding: '8px 12px', textAlign: 'center' }}>Total de Pousos</th>
                <th style={{ padding: '8px 12px', textAlign: 'center' }}>Desembarque Híbrido</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Taxa Diária %</th>
              </tr>
            </thead>
            <tbody style={{ borderBottom: '1px solid #f1f5f9' }}>
              {volumetryByDate.map(([date, data]) => (
                <tr key={date} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 12px', fontWeight: '700' }}>{date.split('-').reverse().join('/')}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>{data.total}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', color: '#b45309', fontWeight: '700' }}>{data.hibrido}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '900' }}>
                    {data.total > 0 ? ((data.hibrido / data.total) * 100).toFixed(1) : '0.0'}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <ReportFooter />
    </div>
  );
};

export const ShiftHandoverReport: React.FC<ReportProps> = ({ movimentacoes, stats, periodo }) => {
  const sortedMovs = sortMovimentacoesDesc(movimentacoes);

  return (
    <div style={{ backgroundColor: '#ffffff', fontFamily: 'sans-serif', color: '#0f172a', padding: '20px' }}>
      <ReportHeader
        title="Relatório de Passagem de Turno"
        periodo={periodo}
        subtitle="Resumo de Atividades Operacionais (ISO 8601 Desc)"
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '12px', backgroundColor: '#f8fafc' }}>
            <h3 style={{ fontSize: '10px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>Resumo do Período</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '500' }}>
                <span style={{ color: '#475569' }}>Aeronaves Registradas:</span>
                <span style={{ fontWeight: '700' }}>{stats.totalMovimentacoes}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '500' }}>
                <span style={{ color: '#475569' }}>Desembarques Híbridos:</span>
                <span style={{ fontWeight: '700', color: '#b45309' }}>{stats.totalHibrido}</span>
              </div>
            </div>
          </div>
          <div style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '12px', backgroundColor: '#f8fafc' }}>
            <h3 style={{ fontSize: '10px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>Status de Equipamentos</h3>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: '700', color: '#047857' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></div> Operacional
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: '700', color: '#64748b' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#cbd5e1' }}></div> N/A
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 style={{ fontSize: '12px', fontWeight: '900', color: '#082f49', textTransform: 'uppercase', marginBottom: '12px' }}>Últimas Movimentações (ISO 8601 Descendente)</h3>
          <table style={{ width: '100%', fontSize: '9px', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
              <tr>
                <th style={{ padding: '8px', textAlign: 'left', width: '96px' }}>Data/Hora</th>
                <th style={{ padding: '8px', textAlign: 'left', width: '96px' }}>Matrícula</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Empresa</th>
                <th style={{ padding: '8px', textAlign: 'center', width: '80px' }}>Box</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Observações de Turno</th>
              </tr>
            </thead>
            <tbody style={{ border: '1px solid #e2e8f0' }}>
              {sortedMovs.slice(0, 15).map((m) => (
                <tr key={m.id_registro} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px', fontWeight: '700' }}>
                    {m.data_cadastro ? m.data_cadastro.split('-').reverse().join('/') : ''} {m.horario_cadastro}
                  </td>
                  <td style={{ padding: '8px', fontFamily: 'monospace', fontWeight: '900' }}>{m.matricula}</td>
                  <td style={{ padding: '8px', fontWeight: '500' }}>{m.nome_companhia}</td>
                  <td style={{ padding: '8px', textAlign: 'center', fontWeight: '700' }}>{m.posicao_patio || '—'}</td>
                  <td style={{ padding: '8px', color: '#64748b', fontStyle: 'italic' }}>
                    {m.observacoes || 'Sem ocorrências.'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <ReportFooter />
    </div>
  );
};

export const AirlineSpecificReport: React.FC<ReportProps & { airlineName: string }> = ({ stats, movimentacoes, periodo, airlineName }) => {
  const sortedMovs = sortMovimentacoesDesc(movimentacoes);
  const airlineData = React.useMemo(() => {
    return sortedMovs.filter(m => m.nome_companhia === airlineName);
  }, [sortedMovs, airlineName]);

  const airlineStats = React.useMemo(() => {
    const total = airlineData.length;
    const hibrido = airlineData.filter(m => m.desembarque_hibrido === 'Sim').length;
    return {
      total,
      hibrido,
      taxa: total > 0 ? (hibrido / total) * 100 : 0
    };
  }, [airlineData]);

  return (
    <div style={{ backgroundColor: '#ffffff', fontFamily: 'sans-serif', color: '#0f172a', padding: '20px' }}>
      <ReportHeader
        title={`Relatório por Companhia: ${airlineName}`}
        periodo={periodo}
        subtitle="Detalhamento Operacional (ISO 8601 Desc)"
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          <div style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '12px', backgroundColor: '#f8fafc' }}>
            <p style={{ fontSize: '9px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Movimentações em CGB</p>
            <p style={{ fontSize: '24px', fontWeight: '900', color: '#0c4a6e' }}>{airlineStats.total}</p>
          </div>
          <div style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '12px', backgroundColor: '#f8fafc' }}>
            <p style={{ fontSize: '9px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Utilização de Híbrido</p>
            <p style={{ fontSize: '24px', fontWeight: '900', color: '#d97706' }}>{airlineStats.hibrido}</p>
          </div>
          <div style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '12px', backgroundColor: '#f8fafc' }}>
            <p style={{ fontSize: '9px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Média de Híbrido %</p>
            <p style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b' }}>{airlineStats.taxa.toFixed(1)}%</p>
          </div>
        </section>

        <section>
          <h3 style={{ fontSize: '12px', fontWeight: '900', color: '#082f49', textTransform: 'uppercase', marginBottom: '12px' }}>Histórico de Aeronaves / Matrículas (ISO 8601 Desc)</h3>
          <table style={{ width: '100%', fontSize: '9px', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#0c4a6e', color: '#ffffff' }}>
              <tr>
                <th style={{ padding: '8px 12px', textAlign: 'left', width: '128px' }}>Data/Hora</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', width: '96px' }}>Matrícula</th>
                <th style={{ padding: '8px 12px', textAlign: 'center', width: '80px' }}>Box</th>
                <th style={{ padding: '8px 12px', textAlign: 'center', width: '96px' }}>Desembarque</th>
                <th style={{ padding: '8px 12px', textAlign: 'left' }}>Equipamento / Observação</th>
              </tr>
            </thead>
            <tbody style={{ border: '1px solid #e2e8f0' }}>
              {airlineData.map((m) => (
                <tr key={m.id_registro} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px 12px', fontWeight: '500' }}>{m.data_cadastro ? m.data_cadastro.split('-').reverse().join('/') : ''} {m.horario_cadastro}</td>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: '900' }}>{m.matricula}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: '700' }}>{m.posicao_patio || '—'}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                    <span style={{ color: m.desembarque_hibrido === 'Sim' ? '#d97706' : '#0369a1', fontWeight: '700' }}>
                      {m.desembarque_hibrido === 'Sim' ? 'HÍBRIDO' : 'PADRÃO'}
                    </span>
                  </td>
                  <td style={{ padding: '8px 12px', color: '#64748b', fontStyle: 'italic' }}>{m.tipo_aeronave || m.observacoes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <ReportFooter />
    </div>
  );
};
