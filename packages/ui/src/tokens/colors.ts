/**
 * PRISM color tokens — see docs/DESIGN_SYSTEM.md §4.
 * Framework-agnostic (plain hex/rgba strings) so both the mobile app and
 * the web app can use them without pulling in react-native.
 */

export interface ColorTokens {
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceElevated: string;
  surfaceSelected: string;
  /** Background of text inputs, selects, and secondary buttons. */
  field: string;
  /** Resting border of the same controls. */
  fieldBorder: string;
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    disabled: string;
    inverse: string;
  };
  border: {
    subtle: string;
    default: string;
    strong: string;
  };
  shadow: string;
}

export const darkTokens: ColorTokens = {
  background: '#0B0B0F', // PRISM_BLACK — app background, lock screen, splash
  backgroundSecondary: '#0F0F14', // PRISM_DARK
  surface: '#121218', // PRISM_SURFACE — cards, sheets, navigation surfaces
  surfaceElevated: '#191921', // PRISM_SURFACE_2 — elevated cards, inputs, secondary controls
  surfaceSelected: '#22222C', // PRISM_SURFACE_3 — selected controls, strong emphasis
  field: '#191921',
  fieldBorder: 'rgba(255,255,255,0.10)',
  text: {
    primary: '#F8F8FA',
    secondary: '#B8B8C2',
    tertiary: '#858591',
    disabled: '#555560',
    inverse: '#0B0B0F',
  },
  border: {
    subtle: 'rgba(255,255,255,0.07)',
    default: 'rgba(255,255,255,0.11)',
    strong: 'rgba(255,255,255,0.18)',
  },
  shadow: '0 8px 32px rgba(0,0,0,0.25)',
};

export const lightTokens: ColorTokens = {
  // Light mode is bright and cool, not grey: an airy periwinkle-white ground,
  // pure white cards that lift off it with soft blue shadows, and deep navy
  // text. The spectrum colors carry the personality, as they do in dark mode.
  background: '#F3F6FF',
  backgroundSecondary: '#EAEFFD',
  surface: '#FFFFFF',
  surfaceElevated: '#EEF2FF',
  surfaceSelected: '#DCE6FF',
  field: '#FFFFFF',
  fieldBorder: '#A9D2EA',
  text: {
    primary: '#12142B',
    secondary: '#4B5177',
    tertiary: '#727899',
    disabled: '#B3B7CF',
    inverse: '#F8F8FA',
  },
  border: {
    subtle: 'rgba(60,80,170,0.09)',
    default: 'rgba(60,80,170,0.15)',
    strong: 'rgba(60,80,170,0.26)',
  },
  shadow: '0 8px 30px rgba(60,80,170,0.14)',
};

/** The signature PRISM accent system. Accents, never decoration — see docs/DESIGN_SYSTEM.md §3. */
export const spectrum = {
  cyan: '#5BCFFB', // primary action, active navigation, links, focus state
  pink: '#F5A9B8', // personal/journey moments, memories, reflection
  violet: '#B58CFF', // journey, milestones, special moments
  mint: '#8DE8C5', // completed states, positive confirmations
  yellow: '#FFE58A', // attention, upcoming, gentle reminders
} as const;

export const spectrumGradient = [
  spectrum.cyan,
  spectrum.pink,
  spectrum.violet,
  spectrum.mint,
  spectrum.yellow,
] as const;

/** Semantic accent used for genuinely destructive actions only — never for "inactive." */
export const destructive = '#F5716C';

/**
 * User-selectable accent themes (YOU → Appearance). The accent replaces
 * PRISM's primary-action color — buttons, active navigation, focus,
 * selected chips, switches. `cyan` is the default and matches
 * `spectrum.cyan`; the gradient and the other spectrum accents are
 * unaffected.
 */
export const ACCENT_THEMES = [
  { key: 'cyan', label: 'Sky', color: '#5BCFFB' },
  { key: 'blue', label: 'Ocean', color: '#6C9BFF' },
  { key: 'violet', label: 'Violet', color: '#B58CFF' },
  { key: 'pink', label: 'Blush', color: '#F5A9B8' },
  { key: 'rose', label: 'Rose', color: '#F472B6' },
  { key: 'coral', label: 'Coral', color: '#FF8A7A' },
  { key: 'orange', label: 'Sunset', color: '#FFB067' },
  { key: 'yellow', label: 'Sunbeam', color: '#FFE58A' },
  { key: 'mint', label: 'Mint', color: '#8DE8C5' },
  { key: 'green', label: 'Forest', color: '#5FD08A' },
] as const;

export type AccentKey = (typeof ACCENT_THEMES)[number]['key'];

export const DEFAULT_ACCENT_KEY: AccentKey = 'cyan';

export function resolveAccentColor(key: AccentKey | undefined): string {
  return (ACCENT_THEMES.find((theme) => theme.key === key) ?? ACCENT_THEMES[0]).color;
}

function relativeLuminance(hex: string): number {
  const linearize = (start: number) => {
    const value = parseInt(hex.slice(start, start + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * linearize(1) + 0.7152 * linearize(3) + 0.0722 * linearize(5);
}

/** Text color that stays readable on top of an accent fill (WCAG contrast, not theme-dependent). */
export function onAccentColor(accentHex: string): string {
  const luminance = relativeLuminance(accentHex);
  const contrastWithDark = (luminance + 0.05) / (relativeLuminance('#0B0B0F') + 0.05);
  const contrastWithLight = 1.05 / (luminance + 0.05);
  return contrastWithDark >= contrastWithLight ? '#0B0B0F' : '#FFFFFF';
}
