/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// Essas variáveis devem ser configuradas no seu painel do Supabase
// Sugestão: Usar um arquivo .env para produção
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase URL ou Anon Key não configurados. A sincronização em nuvem não funcionará.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
