import { Platform } from 'react-native';
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

// Demo mode: a web-only build for App Store screenshots that answers every
// request from sample data (lib/demo). Never set for phone builds.
const demo =
  process.env.EXPO_PUBLIC_DEMO === '1' && Platform.OS === 'web'
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports -- loaded only in demo builds
      (require('../demo/setup'), require('../demo/demoFetch') as typeof import('../demo/demoFetch'))
    : null;

export const supabase: PrismSupabaseClient = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: demo ? demo.demoAuthStorage : supabaseAuthStorage,
    autoRefreshToken: !demo,
    persistSession: true,
    detectSessionInUrl: false,
  },
  ...(demo ? { global: { fetch: demo.demoFetch } } : {}),
});
