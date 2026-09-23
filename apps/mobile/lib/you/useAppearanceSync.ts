import { useEffect } from 'react';
import { ACCENT_THEMES, type AccentKey } from '@prism/ui';
import type { Theme } from '@prism/types';
import { useAppStore } from '../store/appStore';

const THEMES: readonly string[] = ['light', 'dark', 'system'] satisfies Theme[];

function isAccentKey(value: string | undefined): value is AccentKey {
  return ACCENT_THEMES.some((theme) => theme.key === value);
}

function isTheme(value: string | undefined): value is Theme {
  return value !== undefined && THEMES.includes(value);
}

/**
 * Pulls the account's saved appearance (settings.theme and
 * settings.accent_color) into the local store whenever the server value
 * changes — that's how a choice made on another device shows up here.
 * Local taps write the store first and the server after
 * (AppearanceScreen), so by the time the server value changes it already
 * matches and this is a no-op for the device that made the change.
 * Unknown or missing values are ignored, never applied.
 */
export function useAppearanceSync(serverTheme: string | undefined, serverAccent: string | undefined): void {
  const setThemePreference = useAppStore((state) => state.setThemePreference);
  const setAccentColor = useAppStore((state) => state.setAccentColor);

  useEffect(() => {
    if (isTheme(serverTheme)) {
      setThemePreference(serverTheme);
    }
  }, [serverTheme, setThemePreference]);

  useEffect(() => {
    if (isAccentKey(serverAccent)) {
      setAccentColor(serverAccent);
    }
  }, [serverAccent, setAccentColor]);
}
