import { useEffect, useState } from 'react';
import * as Updates from 'expo-updates';

/** The longest the launch screen waits for an update before opening anyway. */
export const LAUNCH_UPDATE_TIMEOUT_MS = 4000;

/**
 * Applies a waiting over-the-air update while the launch screen is still
 * showing, so Prism never opens on older code. Without this, a fresh
 * install runs the code inside the build until the next launch (which once
 * ignored a theme saved by newer code), and every update needed Prism to
 * be opened twice. Gives up after a few seconds on a slow connection; the
 * update then downloads in the background as before. Returns true once
 * Prism may open.
 */
export function useLaunchUpdate(): boolean {
  const [done, setDone] = useState(!Updates.isEnabled || __DEV__);

  useEffect(() => {
    if (done) return;
    let finished = false;
    const finish = () => {
      if (!finished) {
        finished = true;
        setDone(true);
      }
    };
    const timer = setTimeout(finish, LAUNCH_UPDATE_TIMEOUT_MS);

    void (async () => {
      try {
        const check = await Updates.checkForUpdateAsync();
        if (check.isAvailable && !finished) {
          const fetched = await Updates.fetchUpdateAsync();
          if (fetched.isNew && !finished) {
            // Restarts straight into the new code, still behind the launch screen.
            await Updates.reloadAsync();
            return;
          }
        }
      } catch {
        // Offline or the update server is unreachable: open with what's here.
      }
      finish();
    })();

    return () => clearTimeout(timer);
    // Runs once per launch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return done;
}
