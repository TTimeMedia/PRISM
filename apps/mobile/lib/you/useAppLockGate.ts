import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useAppLockStore } from '../store/appLockStore';

/**
 * Screen 60/78 (App Lock). Locks on first mount when App Lock is
 * enabled (a cold app start always requires unlocking) and re-locks
 * whenever the app leaves the foreground — the standard "re-lock on
 * backgrounding" behavior every mobile app-lock feature implements, so
 * a user can't background PRISM and hand an unlocked device to someone
 * else.
 */
export function useAppLockGate(appLockEnabled: boolean): void {
  const lock = useAppLockStore((state) => state.lock);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const hasLockedOnMount = useRef(false);

  useEffect(() => {
    if (appLockEnabled && !hasLockedOnMount.current) {
      lock();
      hasLockedOnMount.current = true;
    }
  }, [appLockEnabled, lock]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) => {
      if (appLockEnabled && appState.current === 'active' && next !== 'active') {
        lock();
      }
      appState.current = next;
    });
    return () => subscription.remove();
  }, [appLockEnabled, lock]);
}
