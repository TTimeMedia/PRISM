/** 8-point spacing grid — see docs/DESIGN_SYSTEM.md §6. */
export const spacing = {
  xs: 4,
  sm: 8,
  smd: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
  huge: 64,
  giant: 80,
} as const;

/** Common layout measurements, named per docs/DESIGN_SYSTEM.md §6. */
export const layout = {
  screenHorizontalPadding: 20,
  cardPadding: 16,
  largeCardPadding: 20,
  sectionSpacing: 32,
  majorSectionSpacing: 48,
  buttonHeight: 52,
  inputHeight: 52,
  minTouchTarget: 44,
  preferredTouchTarget: 48,
} as const;
