/**
 * PRISM module keys.
 *
 * The `modules` table supports all ten keys from Foundation onward — the
 * database schema anticipates every PRISM feature area. Only five are
 * currently exposed as user-toggleable in the product (P0); the rest are
 * P1 and are added to the UI in the release their screens ship.
 *
 * See docs/DECISIONS.md "Full MVP (P0) / next-release (P1) scope" and
 * "Customize PRISM and Quick Add expose only P0 modules until P1 ships".
 */
export const MODULE_KEYS = [
  'medications',
  'injections',
  'appointments',
  'milestones',
  'journal',
  'labs',
  'procedures',
  'memories',
  'legal',
  'documents',
] as const;

export type ModuleKey = (typeof MODULE_KEYS)[number];

/** Module keys exposed as toggles in Customize PRISM / Quick Add for MVP. */
export const P0_MODULE_KEYS = [
  'medications',
  'injections',
  'appointments',
  'milestones',
  'journal',
] as const;

export type P0ModuleKey = (typeof P0_MODULE_KEYS)[number];

/** Module keys deferred to the next release — the schema supports them now. */
export const P1_MODULE_KEYS = ['labs', 'procedures', 'memories', 'legal', 'documents'] as const;

export type P1ModuleKey = (typeof P1_MODULE_KEYS)[number];

export function isP0Module(key: ModuleKey): key is P0ModuleKey {
  return (P0_MODULE_KEYS as readonly string[]).includes(key);
}
