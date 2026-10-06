import { useTheme } from '@prism/ui';

/** The role colors the home tabs are built from (see @prism/ui palettes.ts). */
export type Tint = 'cyan' | 'pink' | 'violet' | 'mint' | 'yellow';

/** Appends an 8-bit alpha to a #RRGGBB color. */
export function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(Math.min(Math.max(alpha, 0), 1) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}

export interface TintColors {
  /** The pure role color, for fills and icons. */
  solid: string;
  /** The card surface. Cards stay neutral so color isn't everywhere. */
  soft: string;
  /** A wash for icon chips: the one place a feature's color shows. */
  tile: string;
  /** The card outline. */
  border: string;
}

/**
 * One role color, in the strengths that work on the current theme. Only the
 * small icon chip (`tile`) carries the color, using the theme's own subtle
 * shade so icons on it stay readable; cards are plain surface so screens
 * read calm.
 */
export function useTint(tint: Tint): TintColors {
  const theme = useTheme();
  return {
    solid: theme.spectrum[tint],
    soft: theme.colors.surface,
    tile: theme.spectrumSubtle[tint],
    border: theme.colors.border.default,
  };
}
