import { createClient } from '@supabase/supabase-js';

// Tenta pegar do LocalStorage primeiro (para permitir configuração via UI), depois do .env, depois os defaults fornecidos
const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('acer_supabase_url') : null;
const storedKey = typeof window !== 'undefined' ? localStorage.getItem('acer_supabase_key') : null;

const envUrl = process.env.SUPABASE_URL;
const envKey = process.env.SUPABASE_ANON_KEY;

// URL e Key fornecidas
const defaultUrl = 'https://fxigmkiyxreloymhmhag.supabase.co';
// Nota: 'sb_publishable_' não é o formato padrão de chaves anon (que começam com eyJ...), 
// mas estamos usando conforme fornecido. Se falhar, a UI de Configuração permitirá ajuste.
const defaultKey = 'sb_publishable_HsqLnIFUEm5ae52SysMmWw_QY1DSM4T';

// A URL real a ser usada
export const activeSupabaseUrl = storedUrl || envUrl || defaultUrl;
export const activeSupabaseKey = storedKey || envKey || defaultKey;

// Se não tiver URL válida, usamos valores placeholder
const clientUrl = activeSupabaseUrl || 'https://placeholder.supabase.co';
const clientKey = activeSupabaseKey || 'placeholder-key';

export const supabase = createClient(clientUrl, clientKey);

export const isSupabaseConfigured = () => {
  const hasUrl = activeSupabaseUrl && activeSupabaseUrl !== 'https://placeholder.supabase.co' && activeSupabaseUrl !== '';
  const hasKey = activeSupabaseKey && activeSupabaseKey !== 'placeholder-key' && activeSupabaseKey !== '';
  return hasUrl && hasKey;
};
