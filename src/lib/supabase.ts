/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase URL ou Anon Key não configurados. A sincronização em nuvem não funcionará.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: window.localStorage
  }
});

// Restaurar sessão em cache no cliente Supabase na inicialização
try {
  const cached = localStorage.getItem('cgb_cached_session');
  if (cached) {
    const session = JSON.parse(cached);
    if (session?.access_token && session?.refresh_token) {
      supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token
      }).catch(err => console.error('Erro ao restaurar sessão no Supabase:', err));
    }
  }
} catch (e) {
  console.error('Erro ao ler sessão em cache:', e);
}
