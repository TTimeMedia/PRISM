/**
 * Palettes: the whole-app color themes the person picks (Appearance, and
 * the Colors step of onboarding). The colors themselves live in themes.ts,
 * one hand-checked set of tokens per theme for light and dark. This file
 * turns a theme into what the app's screens read: ColorTokens for grounds,
 * text and borders, and five "spectrum" slots that screens use by role
 * (care, milestones, journal and so on).
 *
 * Only the Prism theme keeps the full five-color spectrum, its signature.
 * Every other theme is single-color by design, so its slots use its two
 * accents. Status colors (success, warning) are never used as decoration.
 * None is labeled by gender. Framework-agnostic, like colors.ts.
 */
import { spectrum as prismSpectrum } from './colors';
import type { ColorTokens } from './colors';
import { DEFAULT_THEME, THEME_IDS, isThemeId, themes } from './themes';
import type { Mode, ThemeDef, ThemeId, Tokens } from './themes';

export type PaletteKey = ThemeId;
export type SpectrumKey = 'cyan' | 'pink' | 'violet' | 'mint' | 'yellow';
export type Spectrum = Record<SpectrumKey, string>;

export interface Palette {
  key: PaletteKey;
  label: string;
  blurb: string;
  character: ThemeDef['character'];
}

export const PALETTES: readonly Palette[] = THEME_IDS.map((id) => ({
  key: id,
  label: themes[id].name,
  blurb: themes[id].tagline,
  character: themes[id].character,
}));

export const DEFAULT_PALETTE_KEY: PaletteKey = DEFAULT_THEME;

/**
 * Themes from before 2026-10-06, and the closest current theme. People who
 * picked one keep a theme in the same spirit; the saved value updates the
 * next time they choose.
 */
export const LEGACY_PALETTE_KEYS: Readonly<Record<string, PaletteKey>> = {
  slate: 'midnight-ink',
  mist: 'mono',
  ocean: 'tidepool',
  forest: 'moss',
  blossom: 'rosewater',
};

/** A saved value as a current theme, or null if it's not one we know (current or legacy). */
export function knownPaletteKey(value: string | null | undefined): PaletteKey | null {
  if (isThemeId(value)) return value;
  if (value && value in LEGACY_PALETTE_KEYS) return LEGACY_PALETTE_KEYS[value] as PaletteKey;
  return null;
}

/** Any saved value (current, legacy, missing or unknown) as a current theme. */
export function resolvePaletteKey(value: string | null | undefined): PaletteKey {
  return knownPaletteKey(value) ?? DEFAULT_PALETTE_KEY;
}

export function getPalette(key: string | null | undefined): Palette {
  const id = resolvePaletteKey(key);
  return PALETTES.find((palette) => palette.key === id) ?? (PALETTES[0] as Palette);
}

/** A theme's raw tokens for one mode. */
export function themeTokens(key: string | null | undefined, scheme: Mode): Tokens {
  return themes[resolvePaletteKey(key)][scheme];
}

function channel(hex: string, i: number): number {
  return parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
}

/** Blends two #RRGGBB colors; t = 0 is all `a`, t = 1 is all `b`. */
export function mixHex(a: string, b: string, t: number): string {
  const c = [0, 1, 2].map((i) =>
    Math.round(channel(a, i) * (1 - t) + channel(b, i) * t)
      .toString(16)
      .padStart(2, '0'),
  );
  return `#${c.join('')}`;
}

function rgba(hex: string, alpha: number): string {
  return `rgba(${channel(hex, 0)},${channel(hex, 1)},${channel(hex, 2)},${alpha})`;
}

/** Grounds, text, borders and shadow for a theme in light or dark. */
export function paletteTokens(key: string | null | undefined, scheme: Mode): ColorTokens {
  const id = resolvePaletteKey(key);
  const t = themes[id][scheme];
  const opposite = themes[id][scheme === 'dark' ? 'light' : 'dark'];
  return {
    background: t.bg,
    backgroundSecondary: t.surfaceSunken,
    surface: t.surface,
    surfaceElevated: t.surfaceHigh,
    surfaceSelected: t.accentSubtle,
    field: scheme === 'dark' ? t.surfaceHigh : t.surface,
    fieldBorder: t.borderControl,
    text: {
      primary: t.text,
      secondary: t.textSecondary,
      tertiary: t.textMuted,
      disabled: mixHex(t.textMuted, t.bg, 0.45),
      inverse: opposite.text,
    },
    border: {
      subtle: t.border,
      default: mixHex(t.border, t.borderControl, 0.3),
      strong: t.borderControl,
    },
    shadow: scheme === 'dark' ? '0 8px 32px rgba(0,0,0,0.25)' : `0 8px 30px ${rgba(t.text, 0.12)}`,
  };
}

/**
 * The five role colors screens use, and the soft wash behind each one's icon.
 * Prism keeps its signature spectrum; every other theme alternates its two
 * accents, so the app stays single-colored the way each theme is designed.
 */
export function paletteSpectrum(
  key: string | null | undefined,
  scheme: Mode,
): { solid: Spectrum; subtle: Spectrum } {
  const id = resolvePaletteKey(key);
  const t = themes[id][scheme];
  if (id === 'prism') {
    const wash = (hex: string) => mixHex(t.surface, hex, scheme === 'dark' ? 0.32 : 0.45);
    return {
      solid: prismSpectrum,
      subtle: {
        cyan: wash(prismSpectrum.cyan),
        pink: wash(prismSpectrum.pink),
        violet: wash(prismSpectrum.violet),
        mint: wash(prismSpectrum.mint),
        yellow: wash(prismSpectrum.yellow),
      },
    };
  }
  return {
    solid: { cyan: t.accent, mint: t.accent, yellow: t.accent, violet: t.accent2, pink: t.accent2 },
    subtle: {
      cyan: t.accentSubtle,
      mint: t.accentSubtle,
      yellow: t.accentSubtle,
      violet: t.accent2Subtle,
      pink: t.accent2Subtle,
    },
  };
}
