/**
 * Palettes: whole-app color themes the person picks. None is labeled by
 * gender. Each one swaps the five spectrum slots (which the screens use by
 * role: care, milestones, journal and so on), the primary accent, and the
 * ground the app sits on, in light and dark. Framework-agnostic, like colors.ts.
 */
import { darkTokens, lightTokens, spectrum } from './colors';
import type { ColorTokens } from './colors';

export interface Palette {
  key: string;
  label: string;
  blurb: string;
  spectrum: { cyan: string; pink: string; violet: string; mint: string; yellow: string };
  /** The primary-action color: buttons, active tab, selected chips. */
  accent: string;
  /** The page color in light and dark; the rest of the ground is derived. */
  ground: { light: string; dark: string };
  /** Color the light-mode shadows and outlines lean toward. */
  ink: string;
}

export const PALETTES = [
  {
    key: 'slate',
    label: 'Slate',
    blurb: 'Clear blue with teal and amber. Bright, but not loud.',
    spectrum: {
      cyan: '#74B5F0',
      pink: '#E8A24A',
      violet: '#93A6EC',
      mint: '#45BFA0',
      yellow: '#F0C75A',
    },
    accent: '#74B5F0',
    ground: { light: '#F1F6FB', dark: '#0F151D' },
    ink: '#2F5D8C',
  },
  {
    key: 'mist',
    label: 'Mist',
    blurb: 'Quiet and muted. Soft grays with a steel blue.',
    spectrum: {
      cyan: '#86A6C0',
      pink: '#A9B3C0',
      violet: '#9AA5C9',
      mint: '#9CBFB3',
      yellow: '#DCCB98',
    },
    accent: '#7E9DB8',
    ground: { light: '#F4F6F8', dark: '#0E1114' },
    ink: '#3C4854',
  },
  {
    key: 'prism',
    label: 'Prism',
    blurb: 'The full spectrum, bright and colorful.',
    spectrum,
    accent: '#5BCFFB',
    ground: { light: '#F3F6FF', dark: '#0B0B0F' },
    ink: '#3C50AA',
  },
  {
    key: 'ocean',
    label: 'Ocean',
    blurb: 'Blues and teals.',
    spectrum: {
      cyan: '#4DA3E0',
      pink: '#5CC0C8',
      violet: '#6F8FE8',
      mint: '#7ADBC9',
      yellow: '#F2D98A',
    },
    accent: '#4DA3E0',
    ground: { light: '#F1F7FB', dark: '#0A1016' },
    ink: '#28609A',
  },
  {
    key: 'forest',
    label: 'Forest',
    blurb: 'Greens and earth tones.',
    spectrum: {
      cyan: '#5FA88A',
      pink: '#C9A66B',
      violet: '#8FAE7A',
      mint: '#7CC9A0',
      yellow: '#E0C878',
    },
    accent: '#58A57C',
    ground: { light: '#F3F7F3', dark: '#0C110E' },
    ink: '#2F5A44',
  },
  {
    key: 'ember',
    label: 'Ember',
    blurb: 'Warm oranges and reds.',
    spectrum: {
      cyan: '#F08A4B',
      pink: '#E0685A',
      violet: '#C9744F',
      mint: '#E8B04E',
      yellow: '#F5C86B',
    },
    accent: '#EE7B3F',
    ground: { light: '#FBF5F0', dark: '#130E0B' },
    ink: '#8A4A28',
  },
  {
    key: 'dusk',
    label: 'Dusk',
    blurb: 'Purples and rose.',
    spectrum: {
      cyan: '#9B8CF0',
      pink: '#D88FB8',
      violet: '#7E6BD8',
      mint: '#8EC9C4',
      yellow: '#F0C98A',
    },
    accent: '#8F7CE8',
    ground: { light: '#F6F3FC', dark: '#100D16' },
    ink: '#5A3F9A',
  },
  {
    key: 'blossom',
    label: 'Blossom',
    blurb: 'Soft pinks and peaches.',
    spectrum: {
      cyan: '#F29BB4',
      pink: '#F5B5C6',
      violet: '#C79BE8',
      mint: '#9BE0C8',
      yellow: '#FFD9A0',
    },
    accent: '#EE8FAE',
    ground: { light: '#FCF4F6', dark: '#150D10' },
    ink: '#9A3F62',
  },
] as const satisfies readonly Palette[];

export type PaletteKey = (typeof PALETTES)[number]['key'];

export const DEFAULT_PALETTE_KEY: PaletteKey = 'slate';

export function getPalette(key: PaletteKey | undefined): Palette {
  return PALETTES.find((p) => p.key === key) ?? PALETTES[0];
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

/** The light and dark grounds for a palette: page, cards, fields, outlines. */
export function paletteTokens(palette: Palette, scheme: 'light' | 'dark'): ColorTokens {
  if (palette.key === 'prism') return scheme === 'dark' ? darkTokens : lightTokens;
  if (scheme === 'light') {
    const g = palette.ground.light;
    return {
      ...lightTokens,
      background: g,
      backgroundSecondary: mixHex(g, palette.ink, 0.06),
      surface: '#FFFFFF',
      surfaceElevated: mixHex(g, palette.ink, 0.04),
      surfaceSelected: mixHex(g, palette.accent, 0.3),
      field: '#FFFFFF',
      fieldBorder: mixHex('#FFFFFF', palette.accent, 0.55),
      border: {
        subtle: rgba(palette.ink, 0.09),
        default: rgba(palette.ink, 0.15),
        strong: rgba(palette.ink, 0.26),
      },
      shadow: `0 8px 30px ${rgba(palette.ink, 0.14)}`,
    };
  }
  const g = palette.ground.dark;
  return {
    ...darkTokens,
    background: g,
    backgroundSecondary: mixHex(g, '#FFFFFF', 0.02),
    surface: mixHex(g, '#FFFFFF', 0.05),
    surfaceElevated: mixHex(g, '#FFFFFF', 0.09),
    surfaceSelected: mixHex(g, palette.accent, 0.22),
    field: mixHex(g, '#FFFFFF', 0.09),
  };
}
