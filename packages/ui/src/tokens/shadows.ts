/**
 * PRISM relies on contrast, not dramatic shadows — see docs/DESIGN_SYSTEM.md §8.
 * React Native shadow props differ by platform; these are expressed as
 * plain values components translate into `shadow*`/`elevation` props.
 */
export interface ShadowTokens {
  shadowColor: string;
  shadowOpacity: number;
  shadowRadius: number;
  shadowOffset: { width: number; height: number };
  elevation: number;
}

export const shadow: { dark: ShadowTokens; light: ShadowTokens } = {
  dark: {
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  light: {
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
};
