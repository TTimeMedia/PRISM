import { useEffect } from 'react';
import { useSession } from '../auth/AuthProvider';
import { getExpoPushToken, savePushToken } from './pushToken';

/**
 * Keeps the server's copy of this phone's push token current while someone
 * is signed in and has allowed notifications. Runs quietly: no prompts, and
 * a failure just means no push until the next launch.
 */
export function usePushRegistration(enabled: boolean, permissionKey?: string): void {
  const { session } = useSession();
  const userId = session?.user.id;

  useEffect(() => {
    if (!enabled || !userId) return;
    let cancelled = false;
    void (async () => {
      try {
        const token = await getExpoPushToken();
        if (token && !cancelled) await savePushToken(userId, token);
      } catch {
        // Try again next launch.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, userId, permissionKey]);
}
