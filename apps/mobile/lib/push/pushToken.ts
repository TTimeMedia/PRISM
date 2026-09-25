import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { DEFAULT_PUSH_PREFERENCES, PUSH_CATEGORIES, type PushPreferences } from '@prism/types';
import { supabase } from '../supabase/client';

/**
 * Server push — the Expo push token for this phone and where it's kept.
 * Reminders for medications and appointments are still scheduled on the
 * phone itself (lib/reminders); this is only the address the server uses
 * to reach the phone. A token is opaque: it says nothing about the person.
 * Never asks for permission here, only uses it if reminders already have it.
 */

const isPushSupported = Platform.OS !== 'web';

/** The stored preferences with any missing or non-boolean key filled in from the defaults. */
export function resolvePushPreferences(stored: unknown): PushPreferences {
  const value = (stored && typeof stored === 'object' ? stored : {}) as Record<string, unknown>;
  const result = { ...DEFAULT_PUSH_PREFERENCES };
  for (const category of PUSH_CATEGORIES) {
    if (typeof value[category] === 'boolean') result[category] = value[category];
  }
  return result;
}

/** The Expo push token for this phone, or null when it can't have one (web, no permission, no project id). */
export async function getExpoPushToken(): Promise<string | null> {
  if (!isPushSupported) return null;
  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) return null;
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return null;
  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  return data || null;
}

/** Remembers this phone's token for the signed-in person. Safe to call on every launch. */
export async function savePushToken(userId: string, token: string): Promise<void> {
  const { error } = await supabase
    .from('push_tokens')
    .upsert({ user_id: userId, token, platform: Platform.OS }, { onConflict: 'token' });
  if (error) throw error;
}

/** Forgets this phone's token, so a signed-out phone stops getting pushes. Best effort. */
export async function removeThisDevicePushToken(): Promise<void> {
  try {
    const token = await getExpoPushToken();
    if (!token) return;
    await supabase.from('push_tokens').delete().eq('token', token);
  } catch {
    // Signing out must never be blocked by this.
  }
}
