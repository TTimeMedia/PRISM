import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import {
  darkTokens,
  lightTokens,
  spectrum,
  spectrumGradient,
  destructive,
  onAccentColor,
  resolveAccentColor,
} from '../tokens/colors';
import type { AccentKey } from '../tokens/colors';
import type { ColorTokens } from '../tokens/colors';
import { shadow } from '../tokens/shadows';
import type { ShadowTokens } from '../tokens/shadows';
import type { Theme } from './types';

export interface ResolvedTheme {
  /** The theme actually rendered right now — never 'system'. */
  scheme: 'light' | 'dark';
  colors: ColorTokens;
  /** The user's chosen primary-action color — see ACCENT_THEMES. */
  accent: string;
  /** Readable text/icon color to place on top of an accent fill. */
  onAccent: string;
  spectrum: typeof spectrum;
  spectrumGradient: typeof spectrumGradient;
  destructive: string;
  shadow: ShadowTokens;
}

const ThemeContext = createContext<ResolvedTheme | null>(null);

export interface ThemeProviderProps {
  /**
   * The user's stored preference (settings.theme — see @prism/types).
   * 'system' resolves via the OS color scheme. Foundation does not yet
   * persist this — see PrismApp in apps/mobile for the temporary
   * in-memory default; the YOU/Appearance milestone wires it to
   * @prism/database settings.
   */
  preference: Theme;
  /** The user's chosen accent theme; defaults to the original PRISM cyan. */
  accent?: AccentKey;
  children: React.ReactNode;
}

export function ThemeProvider({ preference, accent, children }: ThemeProviderProps) {
  const systemScheme = useRNColorScheme();

  const value = useMemo<ResolvedTheme>(() => {
    const scheme: 'light' | 'dark' =
      preference === 'system' ? (systemScheme === 'light' ? 'light' : 'dark') : preference;

    const accentColor = resolveAccentColor(accent);

    return {
      scheme,
      colors: scheme === 'dark' ? darkTokens : lightTokens,
      accent: accentColor,
      onAccent: onAccentColor(accentColor),
      spectrum,
      spectrumGradient,
      destructive,
      shadow: scheme === 'dark' ? shadow.dark : shadow.light,
    };
  }, [preference, accent, systemScheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ResolvedTheme {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a <ThemeProvider>.');
  }
  return ctx;
}
