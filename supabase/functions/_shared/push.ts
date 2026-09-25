// Pure helpers for send-push: no Deno or network calls here, so the rules
// about who gets what are easy to read (and to test) on their own.

export const PUSH_CATEGORIES = ['security', 'updates', 'nudges', 'reminders'] as const;
export type PushCategory = (typeof PUSH_CATEGORIES)[number];
export type PushPreferences = Record<PushCategory, boolean>;

export const DEFAULT_PUSH_PREFERENCES: PushPreferences = {
  security: true,
  updates: false,
  nudges: false,
  reminders: false,
};

/** Matches docs/SECURITY.md §7 and the on-device reminders. */
export const PRIVATE_TITLE = 'Prism';
export const PRIVATE_BODY = 'Your Prism reminder is ready.';

export function isPushCategory(value: unknown): value is PushCategory {
  return typeof value === 'string' && (PUSH_CATEGORIES as readonly string[]).includes(value);
}

/** Stored preferences with any missing or non-boolean key filled in from the defaults. */
export function resolvePreferences(stored: unknown): PushPreferences {
  const value = (stored && typeof stored === 'object' ? stored : {}) as Record<string, unknown>;
  const result = { ...DEFAULT_PUSH_PREFERENCES };
  for (const category of PUSH_CATEGORIES) {
    if (typeof value[category] === 'boolean') result[category] = value[category] as boolean;
  }
  return result;
}

export interface PushContent {
  title: string;
  body: string;
}

/**
 * What a person's phone will actually show. Reminders are generic while
 * "Private notifications" is on, the same as the on-device ones, so a lock
 * screen never says what a dose or appointment is for.
 */
export function contentFor(
  category: PushCategory,
  content: PushContent,
  notificationPrivacy: boolean,
): PushContent {
  if (category === 'reminders' && notificationPrivacy) {
    return { title: PRIVATE_TITLE, body: PRIVATE_BODY };
  }
  return content;
}

export function chunk<T>(items: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
