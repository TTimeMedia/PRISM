import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { spectrumGradient, onAccentColor, resolveAccentColor } from '../tokens/colors';
import type { AccentKey, ColorTokens } from '../tokens/colors';
import { paletteSpectrum, paletteTokens, resolvePaletteKey, themeTokens } from '../tokens/palettes';
import type { PaletteKey, Spectrum } from '../tokens/palettes';
import { shadow } from '../tokens/shadows';
import type { ShadowTokens } from '../tokens/shadows';
import type { Theme } from './types';

export interface ResolvedTheme {
  /** The theme actually rendered right now — never 'system'. */
  scheme: 'light' | 'dark';
  /** The color theme in use (themes.ts). */
  palette: PaletteKey;
  colors: ColorTokens;
  /** The theme's main color: buttons, active tab, selected chips, rings. Not for text. */
  accent: string;
  /** The accent for text and small icons that must read as text (4.5:1). */
  accentText: string;
  /** Readable text/icon color to place on top of an accent fill. */
  onAccent: string;
  /** The theme's second color, used sparingly. */
  accent2: string;
  /** Role colors screens use (care, milestones, journal…), and the soft wash behind their icons. */
  spectrum: Spectrum;
  spectrumSubtle: Spectrum;
  /** The original Prism spectrum, for onboarding's brand moments. */
  spectrumGradient: readonly string[];
  /** Status colors keep their meaning in every theme. Pair them with an icon and words. */
  success: string;
  successSubtle: string;
  warning: string;
  warningSubtle: string;
  /** Genuinely destructive actions and errors only. Never a missed dose. */
  destructive: string;
  destructiveSubtle: string;
  shadow: ShadowTokens;
}

const ThemeContext = createContext<ResolvedTheme | null>(null);

export interface ThemeProviderProps {
  /** The stored light/dark preference (settings.theme); 'system' follows the phone. */
  preference: Theme;
  /** Legacy override for the primary-action color. Leave it out to use the theme's own. */
  accent?: AccentKey;
  /**
   * The color theme (settings.palette). Any saved value works: a current
   * theme, one from before the themes were replaced (mapped to the closest),
   * or nothing (the default).
   */
  palette?: string;
  children: React.ReactNode;
}

export function ThemeProvider({ preference, accent, palette, children }: ThemeProviderProps) {
  const systemScheme = useRNColorScheme();

  const value = useMemo<ResolvedTheme>(() => {
    const scheme: 'light' | 'dark' =
      preference === 'system' ? (systemScheme === 'light' ? 'light' : 'dark') : preference;
    const key = resolvePaletteKey(palette);
    const t = themeTokens(key, scheme);
    const roles = paletteSpectrum(key, scheme);
    const accentColor = accent ? resolveAccentColor(accent) : t.accent;

    return {
      scheme,
      palette: key,
      colors: paletteTokens(key, scheme),
      accent: accentColor,
      accentText: accent ? accentColor : t.accentText,
      onAccent: accent ? onAccentColor(accentColor) : t.accentOn,
      accent2: t.accent2,
      spectrum: roles.solid,
      spectrumSubtle: roles.subtle,
      spectrumGradient,
      success: t.success,
      successSubtle: t.successSubtle,
      warning: t.warning,
      warningSubtle: t.warningSubtle,
      destructive: t.danger,
      destructiveSubtle: t.dangerSubtle,
      shadow: scheme === 'dark' ? shadow.dark : shadow.light,
    };
  }, [preference, accent, palette, systemScheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ResolvedTheme {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a <ThemeProvider>.');
  }
  return ctx;
}
