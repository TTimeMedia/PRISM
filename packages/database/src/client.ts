import { createClient, type SupabaseClientOptions } from '@supabase/supabase-js';
import type { Database } from './database.types';

export type PrismSupabaseClient = ReturnType<typeof createSupabaseClient>;

/**
 * Platform-agnostic Supabase client factory. Deliberately does not import
 * react-native or next/* — the mobile app passes an AsyncStorage-backed
 * storage adapter, the web app passes a browser-storage-backed one (or
 * none, for server-only usage). This keeps @prism/database usable from
 * both apps without pulling either platform's runtime into the other.
 *
 * The anon/public key is the only credential this should ever see.
 * Never construct a client here with a service-role key — see
 * docs/SECURITY.md §14.
 */
export function createSupabaseClient(
  url: string,
  anonKey: string,
  options?: SupabaseClientOptions<'public'>,
) {
  return createClient<Database>(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      ...options?.auth,
    },
    ...options,
  });
}
