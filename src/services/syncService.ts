import { supabase } from '../lib/supabase';
import { MovimentacaoAeronave } from '../types';

const STORAGE_KEYS = {
  MOVIMENTACOES: 'cgb_movimentacoes_data_v1',
  PENDING_SYNC: 'cgb_pending_sync_v1'
};

export const syncData = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, message: 'Usuário não autenticado' };

  try {
    // 1. Obter dados locais pendentes
    const localData: MovimentacaoAeronave[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOVIMENTACOES) || '[]');
    const pendingSync: string[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_SYNC) || '[]');

    if (pendingSync.length === 0) return { success: true, message: 'Já sincronizado' };

    const recordsToSync = localData.filter(item => pendingSync.includes(item.id_registro));

    for (const record of recordsToSync) {
      const { error } = await supabase
        .from('movimentacoes')
        .upsert({
          id_registro: record.id_registro,
          user_id: session.user.id,
          matricula: record.matricula,
          id_companhia: String(record.id_companhia),
          nome_companhia: record.nome_companhia,
          desembarque_hibrido: record.desembarque_hibrido,
          posicao_patio: record.posicao_patio,
          horario_cadastro: record.horario_cadastro,
          data_cadastro: record.data_cadastro,
          tipo_aeronave: record.tipo_aeronave,
          status_edicao: record.status_edicao,
          observacoes: record.observacoes
        });

      if (!error) {
        // Remover da fila de pendentes se deu certo
        const currentPending: string[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_SYNC) || '[]');
        const updatedPending = currentPending.filter(id => id !== record.id_registro);
        localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(updatedPending));
      }
    }

    return { success: true, message: 'Sincronização concluída' };
  } catch (err) {
    return { success: false, message: 'Erro de conexão' };
  }
};

export const syncAllLocalData = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, message: 'Usuário não autenticado' };

  try {
    const localData: MovimentacaoAeronave[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOVIMENTACOES) || '[]');
    if (localData.length === 0) return { success: true, message: 'Nada para sincronizar' };

    for (const record of localData) {
      await supabase
        .from('movimentacoes')
        .upsert({
          id_registro: record.id_registro,
          user_id: session.user.id,
          matricula: record.matricula,
          id_companhia: String(record.id_companhia),
          nome_companhia: record.nome_companhia,
          desembarque_hibrido: record.desembarque_hibrido,
          posicao_patio: record.posicao_patio,
          horario_cadastro: record.horario_cadastro,
          data_cadastro: record.data_cadastro,
          tipo_aeronave: record.tipo_aeronave,
          status_edicao: record.status_edicao,
          observacoes: record.observacoes
        });
    }

    // Limpar fila de pendentes pois tudo foi enviado
    localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify([]));
    return { success: true, message: 'Todos os dados locais foram enviados para a nuvem' };
  } catch (err) {
    return { success: false, message: 'Erro de conexão ao sincronizar tudo' };
  }
};

export const addToSyncQueue = (id: string) => {
  const pending: string[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_SYNC) || '[]');
  if (!pending.includes(id)) {
    pending.push(id);
    localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(pending));
  }
};

export const getPendingSyncCount = (): number => {
  try {
    const pending: string[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_SYNC) || '[]');
    return pending.length;
  } catch (e) { return 0; }
};
