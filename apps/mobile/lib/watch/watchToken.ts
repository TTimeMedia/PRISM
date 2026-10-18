import * as SecureStore from 'expo-secure-store';
import { supabase } from '../supabase/client';

/**
 * The Apple Watch's own key (supabase/migrations/20261018120000_watch_tokens.sql).
 * It lets the watch read which doses are taken and log a dose through the
 * watch Edge Function without Prism open on the phone, and nothing else.
 *
 * The server keeps only a hash, so the phone keeps the key itself in the
 * Keychain to hand to the watch again later. One key per account: making a
 * new one cancels the old.
 */
const KEY = 'prism_watch_token';

interface StoredToken {
  userId: string;
  token: string;
}

async function readStored(): Promise<StoredToken | null> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<StoredToken>;
    return typeof value.userId === 'string' && typeof value.token === 'string'
      ? { userId: value.userId, token: value.token }
      : null;
  } catch {
    return null;
  }
}

/** This account's watch key, made the first time it's needed. Null if it couldn't be made. */
export async function getOrCreateWatchToken(userId: string): Promise<string | null> {
  const stored = await readStored();
  if (stored?.userId === userId) return stored.token;
  const { data, error } = await supabase.rpc('create_watch_token');
  if (error || typeof data !== 'string') return null;
  await SecureStore.setItemAsync(KEY, JSON.stringify({ userId, token: data }));
  return data;
}

/** Makes a new key, cancelling the old one. Used when the server says the old one isn't valid. */
export async function replaceWatchToken(userId: string): Promise<string | null> {
  await SecureStore.deleteItemAsync(KEY).catch(() => undefined);
  return getOrCreateWatchToken(userId);
}

/** Cancels the watch's key. Call while still signed in. */
export async function revokeWatchToken(): Promise<void> {
  const stored = await readStored();
  await SecureStore.deleteItemAsync(KEY).catch(() => undefined);
  if (stored) {
    await supabase.from('watch_tokens').delete().eq('user_id', stored.userId);
  }
}

/** The watch Edge Function. */
export function watchServerUrl(): string {
  return `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/watch`;
}
