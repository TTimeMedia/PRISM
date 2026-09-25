/** Motion durations (ms) — see docs/DESIGN_SYSTEM.md §23. Respect Reduce Motion — see hooks/useReducedMotion. */
export const duration = {
  micro: 125,
  standard: 200,
  large: 375,
} as const;

/** Minimum touch target sizing — see docs/DESIGN_SYSTEM.md §24. */
export const touchTarget = {
  minimum: 44,
  preferred: 48,
} as const;
