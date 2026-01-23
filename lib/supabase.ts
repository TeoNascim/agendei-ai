
import { createClient } from '@supabase/supabase-js';

// Usar variáveis de ambiente para Supabase (nunca hardcode em produção)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://maxkeumntbhwhxhoqmhz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1heGtldW1udGJod2h4aG9xbWh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3ODc0ODAsImV4cCI6MjA4NDM2MzQ4MH0.wKmCMBTZYkuIZZwcpvzoIGgoTpFdFDg_JYaVZkSmbtg';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Variáveis de ambiente Supabase não configuradas. Usando valores padrão.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
