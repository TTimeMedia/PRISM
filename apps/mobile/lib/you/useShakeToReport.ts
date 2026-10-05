import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import { router, usePathname } from 'expo-router';
import { useAppStore } from '../store/appStore';

/** Total acceleration, in g, that counts as a deliberate shake rather than walking or a bump. */
const SHAKE_G = 2.4;
/** Two strong jolts this close together make a shake. */
const WINDOW_MS = 600;
/** After a shake, ignore the phone for this long so one shake opens one report. */
const COOLDOWN_MS = 3000;

type Sensors = typeof import('expo-sensors');
type ViewShot = typeof import('react-native-view-shot');

/** Both are native modules a build made before this feature lacks, so they're loaded defensively. */
function load(): { sensors: Sensors; viewShot: ViewShot } | null {
  if (Platform.OS === 'web') return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const sensors = require('expo-sensors') as Sensors;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const viewShot = require('react-native-view-shot') as ViewShot;
    return { sensors, viewShot };
  } catch {
    return null;
  }
}

/**
 * Shake the phone anywhere in Prism to open Report a problem, the way many
 * apps do. It takes a screenshot of the screen first, which the report
 * shows and only attaches if the person turns that on. Off with the switch
 * in Support, while the app is locked, and on the report screen itself.
 * The motion sensor is read on the phone only; nothing about it is stored.
 */
export function useShakeToReport(active: boolean): void {
  const enabled = useAppStore((state) => state.shakeToReport);
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  useEffect(() => {
    if (!active || !enabled) return;
    const modules = load();
    if (!modules) return;
    const { Accelerometer } = modules.sensors;

    let lastJolt = 0;
    let quietUntil = 0;
    let busy = false;

    const report = async () => {
      if (busy || AppState.currentState === 'background') return;
      const from = pathnameRef.current;
      if (from.startsWith('/you/support/')) return;
      busy = true;
      let shot: string | undefined;
      try {
        shot = await modules.viewShot.captureScreen({ format: 'jpg', quality: 0.7 });
      } catch {
        // No screenshot; the report still opens.
      }
      router.push({
        pathname: '/you/support/[kind]',
        params: { kind: 'problem', from, ...(shot ? { shot } : {}) },
      });
      busy = false;
    };

    Accelerometer.setUpdateInterval(100);
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const now = Date.now();
      if (now < quietUntil) return;
      if (Math.sqrt(x * x + y * y + z * z) < SHAKE_G) return;
      if (now - lastJolt <= WINDOW_MS) {
        quietUntil = now + COOLDOWN_MS;
        lastJolt = 0;
        void report();
      } else {
        lastJolt = now;
      }
    });
    return () => subscription.remove();
  }, [active, enabled]);
}
