import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Theme } from '@prism/types';
import { DEFAULT_PALETTE_KEY, resolvePaletteKey, type PaletteKey } from '@prism/ui';
import { MAX_DISMISSED } from '../calendar/suggestions';

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
  /** Whole-app color palette — a device-local cache of settings.palette, like the light/dark choice. */
  palette: PaletteKey;
  setPalette: (palette: PaletteKey) => void;
  /** One gentle follow-up when a dose isn't marked done. Device-local, like the reminders themselves. */
  missedDoseNudge: boolean;
  setMissedDoseNudge: (on: boolean) => void;
  /** Minutes before an appointment to remind (0 = at the time). Device-local. */
  appointmentLeadMinutes: number[];
  setAppointmentLeadMinutes: (minutes: number[]) => void;
  /** The one-time "choose what shows" tip on Today has been dismissed. Device-local. */
  customizeTipDismissed: boolean;
  dismissCustomizeTip: () => void;
  /** Shaking the phone opens Report a problem. Device-local. */
  shakeToReport: boolean;
  setShakeToReport: (on: boolean) => void;
  /** Today suggests calendar events that look like appointments. Off until turned on. Device-local. */
  calendarSuggestions: boolean;
  setCalendarSuggestions: (on: boolean) => void;
  /** Suggestions dismissed with "Not this one" (lib/calendar/suggestions.ts keys). */
  dismissedSuggestions: string[];
  dismissSuggestion: (key: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      themePreference: 'system',
      setThemePreference: (theme) => set({ themePreference: theme }),
      palette: DEFAULT_PALETTE_KEY,
      setPalette: (palette) => set({ palette }),
      missedDoseNudge: true,
      setMissedDoseNudge: (on) => set({ missedDoseNudge: on }),
      appointmentLeadMinutes: [60],
      setAppointmentLeadMinutes: (minutes) => set({ appointmentLeadMinutes: minutes }),
      customizeTipDismissed: false,
      dismissCustomizeTip: () => set({ customizeTipDismissed: true }),
      shakeToReport: true,
      setShakeToReport: (on) => set({ shakeToReport: on }),
      calendarSuggestions: false,
      setCalendarSuggestions: (on) => set({ calendarSuggestions: on }),
      dismissedSuggestions: [],
      dismissSuggestion: (key) =>
        set((state) => ({
          dismissedSuggestions: [...state.dismissedSuggestions, key].slice(-MAX_DISMISSED),
        })),
    }),
    {
      name: 'prism-app-preferences',
      storage: createJSONStorage(() => AsyncStorage),
      // Version 0 saved before palettes existed. Those phones keep the original
      // colors from the very first frame instead of flashing the new default
      // while the account's saved choice loads. A fresh install has nothing
      // saved, so it starts on the calm default.
      // Version 2 replaced the color themes; an old saved theme becomes its closest new one.
      version: 2,
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as Partial<AppState>;
        if (version < 1) return { ...state, palette: 'prism' as PaletteKey };
        if (version < 2) return { ...state, palette: resolvePaletteKey(state.palette) };
        return state;
      },
    },
  ),
);
