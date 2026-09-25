import { useEffect } from 'react';
import { PALETTES, type PaletteKey } from '@prism/ui';
import type { Theme } from '@prism/types';
import { useAppStore } from '../store/appStore';

const THEMES: readonly string[] = ['light', 'dark', 'system'] satisfies Theme[];

function isPaletteKey(value: string | undefined): value is PaletteKey {
  return PALETTES.some((palette) => palette.key === value);
}

function isTheme(value: string | undefined): value is Theme {
  return value !== undefined && THEMES.includes(value);
}

/**
 * Pulls the account's saved appearance (settings.theme and
 * settings.palette) into the local store whenever the server value
 * changes — that's how a choice made on another device shows up here.
 * Local taps write the store first and the server after
 * (AppearanceScreen), so by the time the server value changes it already
 * matches and this is a no-op for the device that made the change.
 * Unknown or missing values are ignored, never applied.
 */
export function useAppearanceSync(
  serverTheme: string | undefined,
  serverPalette: string | undefined,
): void {
  const setThemePreference = useAppStore((state) => state.setThemePreference);
  const setPalette = useAppStore((state) => state.setPalette);

  useEffect(() => {
    if (isTheme(serverTheme)) {
      setThemePreference(serverTheme);
    }
  }, [serverTheme, setThemePreference]);

  useEffect(() => {
    if (isPaletteKey(serverPalette)) {
      setPalette(serverPalette);
    }
  }, [serverPalette, setPalette]);
}
