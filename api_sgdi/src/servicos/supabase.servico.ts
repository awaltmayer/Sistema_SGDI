import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/env.js';

let supabaseClient: SupabaseClient | null = null;

if (config.supabaseUrl && config.supabaseKey) {
  try {
    supabaseClient = createClient(config.supabaseUrl, config.supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } catch (err) {
    console.warn('[AVISO] Não foi possível inicializar o cliente Supabase:', err);
  }
}

export function obterClienteSupabase(): SupabaseClient | null {
  return supabaseClient;
}
