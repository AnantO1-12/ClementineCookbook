import { createClient } from '@supabase/supabase-js';

import { hasSupabaseEnv, supabaseAnonKey, supabaseUrl } from './env';
import type { Database } from '../types/supabase';

const fallbackUrl = 'https://placeholder.supabase.co';
const fallbackKey = 'placeholder-anon-key';

export const supabase = createClient<Database>(
  hasSupabaseEnv ? supabaseUrl : fallbackUrl,
  hasSupabaseEnv ? supabaseAnonKey : fallbackKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);
