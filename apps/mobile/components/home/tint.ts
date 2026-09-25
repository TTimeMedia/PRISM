import { useTheme } from '@prism/ui';

/** The spectrum colors the home tabs are built from. */
export type Tint = 'cyan' | 'pink' | 'violet' | 'mint' | 'yellow';

/** Appends an 8-bit alpha to a #RRGGBB color. */
export function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(Math.min(Math.max(alpha, 0), 1) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}

export interface TintColors {
  /** The pure spectrum color, for fills and icons. */
  solid: string;
  /** The card surface. Cards stay neutral so color isn't everywhere. */
  soft: string;
  /** A wash for icon chips: the one place a feature's color shows. */
  tile: string;
  /** The card outline. */
  border: string;
}

/**
 * One spectrum color, in the strengths that work on the current light or dark
 * theme. Only the small icon chip (`tile`) carries the color; cards are plain
 * surface so screens read calm rather than rainbow.
 */
export function useTint(tint: Tint): TintColors {
  const theme = useTheme();
  const solid = theme.spectrum[tint];
  const dark = theme.scheme === 'dark';
  return {
    solid,
    soft: theme.colors.surface,
    tile: withAlpha(solid, dark ? 0.32 : 0.6),
    border: theme.colors.border.default,
  };
}
