/** Corner radius tokens — see docs/DESIGN_SYSTEM.md §7. */
export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

/** Recommended radius per component, per docs/DESIGN_SYSTEM.md §7. */
export const componentRadius = {
  input: radius.md,
  card: radius.lg,
  largeCard: radius.xl,
  button: radius.md,
  tag: radius.pill,
} as const;
