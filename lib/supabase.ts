
import { createClient } from '@supabase/supabase-js';

// Usa valores placeholder se as envs não estiverem definidas para evitar crash da aplicação "supabaseUrl is required"
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);
