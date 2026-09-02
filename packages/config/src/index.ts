/**
 * Shared, non-secret configuration constants for PRISM.
 * Actual secrets (Supabase keys, etc.) live in environment variables —
 * see docs/SECURITY.md §14-15 and .env.example at the repo root.
 */

export const APP_NAME = 'PRISM';
export const APP_TAGLINE = 'Your journey. Your way.';
export const APP_SCHEME = 'prism';

/** Supabase table names, kept in one place to avoid typo drift across queries. */
export const TABLES = {
  profiles: 'profiles',
  modules: 'modules',
  medications: 'medications',
  medicationLogs: 'medication_logs',
  injections: 'injections',
  appointments: 'appointments',
  labs: 'labs',
  procedures: 'procedures',
  milestones: 'milestones',
  journalEntries: 'journal_entries',
  memories: 'memories',
  legalItems: 'legal_items',
  documents: 'documents',
  reminders: 'reminders',
  settings: 'settings',
} as const;

/** Supabase Storage bucket names. All private — see docs/SECURITY.md §5. */
export const STORAGE_BUCKETS = {
  profilePhotos: 'profile-photos',
  memories: 'memories',
  documents: 'documents',
  attachments: 'attachments',
} as const;

/** Approved, non-clinical empty-state copy — see docs/DESIGN_SYSTEM.md §25. */
export const EMPTY_STATE_COPY = {
  general: "Nothing here yet. That's okay.",
  journey: 'Your story starts wherever you decide.',
  memories: 'Save the moments that matter to you.',
  journal: "Whenever you're ready.",
  care: 'Nothing added yet. You can add something whenever you need to.',
} as const;

/** Approved error copy — never expose raw backend errors. See docs/SECURITY.md. */
export const ERROR_COPY = {
  generic: "Something went wrong. Your information wasn't changed.",
} as const;

/** Approved offline copy. */
export const OFFLINE_COPY = {
  banner: "You're offline.",
  syncNotice: "Your changes will sync when you're back online.",
} as const;

export * from './env';
