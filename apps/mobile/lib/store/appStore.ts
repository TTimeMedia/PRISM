import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Theme } from '@prism/types';
import { DEFAULT_ACCENT_KEY, type AccentKey } from '@prism/ui';

/**
 * Persistent, local, non-sensitive app preferences only — see
 * docs/TECHNICAL_BIBLE.md §12 (state management) and docs/BUILD_STATUS.md
 * §6. This is deliberately small: server state (Supabase data) belongs
 * in React Query (lib/queryClient.ts), and once a `settings` row exists
 * for a signed-in user, `themePreference` here becomes a local cache of
 * that server value, not its source of truth — do not grow this store
 * into a second copy of the database.
 */
interface AppState {
  themePreference: Theme;
  setThemePreference: (theme: Theme) => void;
  /** Accent color theme — device-local, like the light/dark cache. */
  accentColor: AccentKey;
  setAccentColor: (accent: AccentKey) => void;
  /** One gentle follow-up when a dose isn't marked done. Device-local, like the reminders themselves. */
  missedDoseNudge: boolean;
  setMissedDoseNudge: (on: boolean) => void;
  /** Minutes before an appointment to remind (0 = at the time). Device-local. */
  appointmentLeadMinutes: number[];
  setAppointmentLeadMinutes: (minutes: number[]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      themePreference: 'system',
      setThemePreference: (theme) => set({ themePreference: theme }),
      accentColor: DEFAULT_ACCENT_KEY,
      setAccentColor: (accent) => set({ accentColor: accent }),
      missedDoseNudge: true,
      setMissedDoseNudge: (on) => set({ missedDoseNudge: on }),
      appointmentLeadMinutes: [60],
      setAppointmentLeadMinutes: (minutes) => set({ appointmentLeadMinutes: minutes }),
    }),
    {
      name: 'prism-app-preferences',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
