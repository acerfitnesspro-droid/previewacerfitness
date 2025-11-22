
import { createClient } from '@supabase/supabase-js';

// Tenta pegar do LocalStorage primeiro (para permitir configuração via UI), depois do .env
const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('acer_supabase_url') : null;
const storedKey = typeof window !== 'undefined' ? localStorage.getItem('acer_supabase_key') : null;

const envUrl = process.env.SUPABASE_URL;
const envKey = process.env.SUPABASE_ANON_KEY;

// A URL real a ser usada
export const activeSupabaseUrl = storedUrl || envUrl || '';
export const activeSupabaseKey = storedKey || envKey || '';

// Se não tiver URL válida, usamos valores placeholder para não quebrar o build,
// mas a App.tsx vai detectar isso e pedir configuração.
const clientUrl = activeSupabaseUrl || 'https://placeholder.supabase.co';
const clientKey = activeSupabaseKey || 'placeholder-key';

export const supabase = createClient(clientUrl, clientKey);

export const isSupabaseConfigured = () => {
  return activeSupabaseUrl && activeSupabaseUrl !== 'https://placeholder.supabase.co' && 
         activeSupabaseKey && activeSupabaseKey !== 'placeholder-key';
};
