import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { darkTokens, lightTokens, spectrum, spectrumGradient, destructive } from '../tokens/colors';
import type { ColorTokens } from '../tokens/colors';
import { shadow } from '../tokens/shadows';
import type { ShadowTokens } from '../tokens/shadows';
import type { Theme } from './types';

export interface ResolvedTheme {
  /** The theme actually rendered right now — never 'system'. */
  scheme: 'light' | 'dark';
  colors: ColorTokens;
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
  children: React.ReactNode;
}

export function ThemeProvider({ preference, children }: ThemeProviderProps) {
  const systemScheme = useRNColorScheme();

  const value = useMemo<ResolvedTheme>(() => {
    const scheme: 'light' | 'dark' =
      preference === 'system' ? (systemScheme === 'light' ? 'light' : 'dark') : preference;

    return {
      scheme,
      colors: scheme === 'dark' ? darkTokens : lightTokens,
      spectrum,
      spectrumGradient,
      destructive,
      shadow: scheme === 'dark' ? shadow.dark : shadow.light,
    };
  }, [preference, systemScheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ResolvedTheme {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a <ThemeProvider>.');
  }
  return ctx;
}
