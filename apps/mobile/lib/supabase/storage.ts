import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * On native, Supabase session storage uses AsyncStorage. On web, it must use
 * `localStorage` directly (AsyncStorage's web shim also relies on it, but
 * only lazily — see below). Neither `window` nor `localStorage` exist when
 * this module is evaluated during Node-based static rendering (Expo
 * Router's web static export), so every access is guarded.
 */
const webStorage = {
  getItem(key: string) {
    if (typeof localStorage === 'undefined') return Promise.resolve(null);
    return Promise.resolve(localStorage.getItem(key));
  },
  setItem(key: string, value: string) {
    if (typeof localStorage === 'undefined') return Promise.resolve();
    localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem(key: string) {
    if (typeof localStorage === 'undefined') return Promise.resolve();
    localStorage.removeItem(key);
    return Promise.resolve();
  },
};

export const supabaseAuthStorage = Platform.OS === 'web' ? webStorage : AsyncStorage;
