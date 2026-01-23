
import { createClient } from '@supabase/supabase-js';

// Estas chaves permitem que seu site se conecte ao banco de dados Supabase
export const supabaseUrl = 'https://maxkeumntbhwhxhoqmhz.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1heGtldW1udGJod2h4aG9xbWh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3ODc0ODAsImV4cCI6MjA4NDM2MzQ4MH0.wKmCMBTZYkuIZZwcpvzoIGgoTpFdFDg_JYaVZkSmbtg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
