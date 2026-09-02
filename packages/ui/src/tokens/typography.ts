/**
 * PRISM typography tokens — see docs/DESIGN_SYSTEM.md §5.
 * Primary typeface: Inter. Display typeface (sparing use): Sora.
 */
export const fontFamily = {
  primary: 'Inter',
  display: 'Sora',
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

/** size / lineHeight, in points — see docs/DESIGN_SYSTEM.md §5 type scale. */
export const type = {
  displayXL: { fontSize: 40, lineHeight: 46 },
  displayL: { fontSize: 34, lineHeight: 40 },
  displayM: { fontSize: 28, lineHeight: 34 },
  headingXL: { fontSize: 24, lineHeight: 30 },
  headingL: { fontSize: 20, lineHeight: 26 },
  headingM: { fontSize: 18, lineHeight: 24 },
  bodyL: { fontSize: 17, lineHeight: 25 },
  bodyM: { fontSize: 15, lineHeight: 22 },
  bodyS: { fontSize: 14, lineHeight: 20 },
  caption: { fontSize: 12, lineHeight: 17 },
  micro: { fontSize: 11, lineHeight: 15 },
} as const;

export type TypeStyleName = keyof typeof type;
