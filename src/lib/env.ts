export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? '';
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '';

export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey);

export function assertSupabaseEnv() {
  if (!hasSupabaseEnv) {
    throw new Error(
      'Supabase environment variables are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before using the app.',
    );
  }
}
