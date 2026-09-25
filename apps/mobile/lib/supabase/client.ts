import { createSupabaseClient, type PrismSupabaseClient } from '@prism/database';
import { requireEnv } from '@prism/config';
import { supabaseAuthStorage } from './storage';

/**
 * Expo only exposes env vars prefixed EXPO_PUBLIC_ to client code — see
 * docs/SECURITY.md §14-15. This is the anon/public key; it is safe to
 * ship in the client because every table it can touch is protected by
 * Row Level Security (see supabase/migrations).
 */
const supabaseUrl = requireEnv('EXPO_PUBLIC_SUPABASE_URL', process.env.EXPO_PUBLIC_SUPABASE_URL);
const supabaseAnonKey = requireEnv(
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
);

export const supabase: PrismSupabaseClient = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: supabaseAuthStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
