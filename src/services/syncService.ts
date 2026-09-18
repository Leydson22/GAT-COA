import { supabase } from '../lib/supabase';
import { MovimentacaoAeronave } from '../types';

const STORAGE_KEYS = {
  MOVIMENTACOES: 'cgb_movimentacoes_data_v1',
  PENDING_SYNC: 'cgb_pending_sync_v1'
};

const ensureSupabaseSession = async () => {
  const cachedSession = localStorage.getItem('cgb_cached_session');
  if (cachedSession) {
    try {
      const parsed = JSON.parse(cachedSession);
      if (parsed?.access_token && parsed?.refresh_token) {
        await supabase.auth.setSession({
          access_token: parsed.access_token,
          refresh_token: parsed.refresh_token
        });
      }
    } catch (e) {}
  }
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

export const syncData = async () => {
  const session = await ensureSupabaseSession();
  if (!session || !session.user) return { success: false, message: 'Usuário não autenticado' };

  try {
    const localData: MovimentacaoAeronave[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOVIMENTACOES) || '[]');
    const pendingSync: string[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_SYNC) || '[]');

    if (pendingSync.length === 0) return { success: true, message: 'Já sincronizado' };

    const recordsToSync = localData.filter(item => pendingSync.includes(item.id_registro));

    for (const record of recordsToSync) {
      const { error } = await supabase
        .from('movimentacoes')
        .upsert({
          id_registro: record.id_registro,
          user_id: record.user_id || session.user.id,
          user_email: record.user_email || session.user.email,
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
        }, { onConflict: 'id_registro' });

      if (!error) {
        const currentPending: string[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_SYNC) || '[]');
        const updatedPending = currentPending.filter(id => id !== record.id_registro);
        localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(updatedPending));
      } else {
        console.error('Supabase sync error for record:', record.id_registro, error);
      }
    }

    return { success: true, message: 'Sincronização concluída' };
  } catch (err: any) {
    console.error('Supabase connection error:', err);
    return { success: false, message: 'Erro de conexão: ' + (err?.message || 'Falha ao conectar ao Supabase') };
  }
};

export const syncAllLocalData = async (onProgress?: (progress: number, current: number, total: number) => void) => {
  const session = await ensureSupabaseSession();
  if (!session || !session.user) return { success: false, message: 'Usuário não autenticado' };

  const activeUserId = session.user.id;
  const activeUserEmail = session.user.email;

  try {
    const localData: MovimentacaoAeronave[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOVIMENTACOES) || '[]');
    if (localData.length === 0) return { success: true, message: 'Nada para sincronizar' };

    const total = localData.length;
    let count = 0;
    let failedCount = 0;
    let lastErrorMessage = '';
    let lastErrorDetails = '';

    for (const record of localData) {
      const recordUserId = record.user_id || activeUserId;
      const recordUserEmail = record.user_email || activeUserEmail;

      const { error } = await supabase
        .from('movimentacoes')
        .upsert({
          id_registro: record.id_registro,
          user_id: recordUserId,
          user_email: recordUserEmail,
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
        }, { onConflict: 'id_registro' });

      if (error) {
        failedCount++;
        lastErrorMessage = error.message;
        lastErrorDetails = error.details || '';
        console.error('Supabase upsert error:', error);
      } else {
        count++;
      }

      if (onProgress) {
        onProgress(Math.round((count / total) * 100), count, total);
      }
    }

    if (failedCount === 0) {
      localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify([]));
      return { success: true, message: `Sincronização concluída com sucesso! ${count} de ${total} registros enviados e confirmados na nuvem (${activeUserEmail}).` };
    } else {
      return { success: false, message: `Falha no Supabase: ${lastErrorMessage} ${lastErrorDetails ? `(${lastErrorDetails})` : ''}` };
    }
  } catch (err: any) {
    console.error('Supabase syncAll error:', err);
    return { success: false, message: 'Erro de conexão ao sincronizar com o Supabase: ' + (err?.message || '') };
  }
};

export const pullDataFromCloud = async (onProgress?: (progress: number, current: number, total: number) => void) => {
  const session = await ensureSupabaseSession();
  if (!session || !session.user) return { success: false, message: 'Usuário não autenticado' };

  const cachedProfile = localStorage.getItem('cgb_cached_profile');
  const profile = cachedProfile ? JSON.parse(cachedProfile) : { role: 'operator' };
  const isAdmin = profile.role === 'admin';

  try {
    let query = supabase.from('movimentacoes').select('*');
    if (!isAdmin) {
      query = query.eq('user_id', session.user.id);
    }

    const { data: remoteData, error } = await query;

    if (error) {
      console.error('Supabase pull error:', error);
      return { success: false, message: 'Erro ao buscar dados do Supabase: ' + error.message };
    }

    if (!remoteData || remoteData.length === 0) {
      return { success: true, message: 'Nenhum registro encontrado na nuvem.' };
    }

    const localData: MovimentacaoAeronave[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOVIMENTACOES) || '[]');
    const localMap = new Map(localData.map(item => [item.id_registro, item]));

    let count = 0;
    const total = remoteData.length;

    for (const remote of remoteData) {
      localMap.set(remote.id_registro, {
        id_registro: remote.id_registro,
        matricula: remote.matricula,
        id_companhia: remote.id_companhia,
        nome_companhia: remote.nome_companhia,
        desembarque_hibrido: remote.desembarque_hibrido,
        posicao_patio: remote.posicao_patio,
        horario_cadastro: remote.horario_cadastro,
        data_cadastro: remote.data_cadastro,
        tipo_aeronave: remote.tipo_aeronave,
        status_edicao: remote.status_edicao,
        observacoes: remote.observacoes,
        user_id: remote.user_id,
        user_email: remote.user_email
      });

      count++;
      if (onProgress) {
        onProgress(Math.round((count / total) * 100), count, total);
      }
    }

    const mergedList = Array.from(localMap.values());
    localStorage.setItem(STORAGE_KEYS.MOVIMENTACOES, JSON.stringify(mergedList));
    localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify([]));

    return { success: true, message: `Download concluído com sucesso! ${total} registros da nuvem foram baixados e sincronizados.` };
  } catch (err: any) {
    console.error('Supabase pull connection error:', err);
    return { success: false, message: 'Erro de conexão ao baixar dados da nuvem: ' + (err?.message || '') };
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
