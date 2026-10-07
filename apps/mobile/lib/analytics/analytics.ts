import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Anonymous product analytics, sent to PostHog's EU region. Only ever runs
 * after the person said yes (Today's "Help improve Prism?" card, or Privacy &
 * security); see docs/DECISIONS.md.
 *
 * What is sent: an event name from lib/analytics/events.ts, the app version
 * and platform, and a random ID for this install. Never a name, an email,
 * an account ID, or anything the person wrote or recorded about their care.
 * Not linked to a person (no PostHog person profiles), no IP-based location,
 * no taps captured automatically, no screen recording.
 *
 * PostHog's own app library isn't used: it needs native code and captures
 * more than Prism wants. This posts named events to PostHog's batch API.
 */

/** PostHog project key. Public by design: it can only send events, not read them. */
const POSTHOG_KEY = 'phc_wWsBpf44SNc4J9e7rcnnWUDAFty4Shartt8kGQJEFrss';
const POSTHOG_BATCH_URL = 'https://eu.i.posthog.com/batch/';

const INSTALL_ID_KEY = 'prism-analytics-install-id';
const FLUSH_MS = 20_000;
const MAX_QUEUE = 200;

interface QueuedEvent {
  event: string;
  properties: Record<string, string | number | boolean>;
  timestamp: string;
}

let enabled = false;
let installId: string | null = null;
let queue: QueuedEvent[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

function randomId(): string {
  const hex = '0123456789abcdef';
  let id = '';
  for (let i = 0; i < 32; i += 1) id += hex[Math.floor(Math.random() * 16)];
  return `${id.slice(0, 8)}-${id.slice(8, 12)}-4${id.slice(13, 16)}-a${id.slice(17, 20)}-${id.slice(20)}`;
}

async function getInstallId(): Promise<string> {
  if (installId) return installId;
  try {
    installId = (await AsyncStorage.getItem(INSTALL_ID_KEY)) ?? randomId();
    await AsyncStorage.setItem(INSTALL_ID_KEY, installId);
  } catch {
    installId = installId ?? randomId();
  }
  return installId;
}

const baseProperties = () => ({
  app_version: Constants.expoConfig?.version ?? 'unknown',
  platform: Platform.OS,
  os_version: String(Platform.Version),
  // Anonymous events only: no person profile, no IP-based location.
  $process_person_profile: false,
  $geoip_disable: true,
});

/** Turns sending on or off. Turning it off drops anything not yet sent and forgets this install's ID. */
export async function setAnalyticsEnabled(on: boolean): Promise<void> {
  enabled = on && !__DEV__;
  if (!enabled) {
    queue = [];
    installId = null;
    try {
      await AsyncStorage.removeItem(INSTALL_ID_KEY);
    } catch {
      // Nothing to forget.
    }
  }
}

export function isAnalyticsEnabled(): boolean {
  return enabled;
}

/** Records one event. Does nothing unless the person said yes. */
export function capture(event: string, properties: Record<string, string | number | boolean> = {}) {
  if (!enabled) return;
  queue.push({ event, properties, timestamp: new Date().toISOString() });
  if (queue.length > MAX_QUEUE) queue = queue.slice(-MAX_QUEUE);
  if (!timer) timer = setTimeout(() => void flush(), FLUSH_MS);
}

/** Sends what's waiting. Kept for the next try if the phone is offline. */
export async function flush(): Promise<void> {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (!enabled || queue.length === 0) return;
  const batch = queue;
  queue = [];
  const distinctId = await getInstallId();
  try {
    const response = await fetch(POSTHOG_BATCH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: POSTHOG_KEY,
        batch: batch.map((item) => ({
          event: item.event,
          timestamp: item.timestamp,
          properties: { ...baseProperties(), ...item.properties, distinct_id: distinctId },
        })),
      }),
    });
    if (!response.ok) throw new Error(String(response.status));
  } catch {
    if (enabled) queue = [...batch, ...queue].slice(-MAX_QUEUE);
  }
}

// Send what's waiting when Prism goes to the background.
AppState.addEventListener('change', (state) => {
  if (state !== 'active') void flush();
});
