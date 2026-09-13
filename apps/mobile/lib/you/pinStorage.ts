import * as SecureStore from 'expo-secure-store';

/**
 * App Lock's PIN fallback (Screen 60) is a device-local unlock secret,
 * not a server-synced setting — see docs/DECISIONS.md § YOU. It's stored
 * via `expo-secure-store`, which the OS already encrypts at rest
 * (Keychain on iOS, Keystore on Android), the same guarantee any
 * hashing scheme on top would be approximating — so the PIN is stored
 * directly, namespaced under its own key, never alongside `settings` in
 * the database.
 */
const PIN_KEY = 'prism_app_lock_pin';

export async function setPin(pin: string): Promise<void> {
  await SecureStore.setItemAsync(PIN_KEY, pin);
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = await SecureStore.getItemAsync(PIN_KEY);
  return stored !== null && stored === pin;
}

export async function hasPin(): Promise<boolean> {
  const stored = await SecureStore.getItemAsync(PIN_KEY);
  return stored !== null;
}

export async function clearPin(): Promise<void> {
  await SecureStore.deleteItemAsync(PIN_KEY);
}
