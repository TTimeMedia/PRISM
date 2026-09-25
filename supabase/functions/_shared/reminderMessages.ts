/**
 * What a reminder says when the person has turned Private notifications off.
 * Each kind has a few built-in versions and room for their own; they pick
 * one. A message can use placeholders like {name} and {time}, filled in when
 * the reminder is made. No imports on purpose: an identical copy lives in
 * supabase/functions/_shared/reminderMessages.ts so the server words things
 * the same way, and a test keeps the two from drifting apart.
 */

/** Injections are medications, but "shot day" deserves its own wording. */
export const REMINDER_KINDS = ['medication', 'injection', 'appointment'] as const;
export type ReminderKind = (typeof REMINDER_KINDS)[number];

export interface MessageOption {
  id: string;
  text: string;
}

export interface ReminderMessageChoice {
  /** The id of the built-in or custom message in use. Missing means the first built-in. */
  selected?: string;
  custom?: MessageOption[];
}

export type ReminderMessages = Partial<Record<ReminderKind, ReminderMessageChoice>>;

export interface ReminderVars {
  /** The medication's name, or the appointment's title. */
  name?: string;
  /** When it happens, like "9:00 AM". */
  time?: string;
  /** The dose the person wrote down, if any. */
  dose?: string;
  /** How soon: "now", "in 1 hour", "tomorrow". */
  when?: string;
}

export const MESSAGE_PLACEHOLDERS: { token: string; label: string; example: string }[] = [
  { token: '{name}', label: 'Name', example: 'Vitamin D' },
  { token: '{time}', label: 'Time', example: '9:00 AM' },
  { token: '{dose}', label: 'Dose', example: '2 mg' },
  { token: '{when}', label: 'How soon', example: 'in 1 hour' },
];

export const MAX_CUSTOM_MESSAGES = 5;
export const MAX_MESSAGE_LENGTH = 120;

/** The title on every reminder: short and quiet. The message is the body. */
export const REMINDER_TITLE = 'Prism';

export const BUILT_IN_MESSAGES: Record<ReminderKind, MessageOption[]> = {
  medication: [
    { id: 'take-at', text: 'Take your {name} at {time}.' },
    { id: 'time-for', text: "It's time for your {name}." },
    { id: 'you-got-this', text: '{name} at {time}. You’ve got this.' },
    { id: 'gentle', text: 'A gentle reminder: {name}.' },
  ],
  injection: [
    { id: 'shot-day', text: "It's shot day." },
    { id: 'shot-day-name', text: 'Shot day: {name} at {time}.' },
    { id: 'time-for-shot', text: 'Time for your {name} shot.' },
    { id: 'you-got-this', text: 'Shot day today. You’ve got this.' },
  ],
  appointment: [
    { id: 'name-when', text: '{name} {when}.' },
    { id: 'heads-up', text: 'Heads up: {name} is coming up {when}.' },
    { id: 'at-time', text: 'You have {name} at {time}.' },
  ],
};

/** A made-up example of each kind, for showing what a message will look like. */
export const SAMPLE_VARS: Record<ReminderKind, ReminderVars> = {
  medication: { name: 'Vitamin D', time: '9:00 AM', dose: '1 tablet', when: 'now' },
  injection: { name: 'B12', time: '8:00 PM', dose: '1 ml', when: 'now' },
  appointment: { name: 'Check-up', time: '10:00 AM', when: 'in 1 hour' },
};

export function reminderKindForMedication(form: string | null | undefined): ReminderKind {
  return form === 'injection' ? 'injection' : 'medication';
}

/** Cleans up stored choices: unknown kinds, blank or over-long text and extra messages are dropped. */
export function resolveReminderMessages(stored: unknown): ReminderMessages {
  const result: ReminderMessages = {};
  if (!stored || typeof stored !== 'object') return result;
  for (const kind of REMINDER_KINDS) {
    const raw = (stored as Record<string, unknown>)[kind];
    if (!raw || typeof raw !== 'object') continue;
    const { selected, custom } = raw as { selected?: unknown; custom?: unknown };
    const options: MessageOption[] = [];
    if (Array.isArray(custom)) {
      for (const item of custom) {
        const entry = item as { id?: unknown; text?: unknown } | null;
        if (
          entry &&
          typeof entry.id === 'string' &&
          typeof entry.text === 'string' &&
          entry.text.trim() &&
          options.length < MAX_CUSTOM_MESSAGES
        ) {
          options.push({ id: entry.id, text: entry.text.trim().slice(0, MAX_MESSAGE_LENGTH) });
        }
      }
    }
    result[kind] = {
      ...(typeof selected === 'string' ? { selected } : {}),
      custom: options,
    };
  }
  return result;
}

/** Every version for a kind: the built-in ones, then the person's own. */
export function messageOptions(kind: ReminderKind, messages: ReminderMessages): MessageOption[] {
  return [...BUILT_IN_MESSAGES[kind], ...(messages[kind]?.custom ?? [])];
}

/** The version in use for a kind, falling back to the first built-in one. */
export function selectedMessage(kind: ReminderKind, messages: ReminderMessages): MessageOption {
  const options = messageOptions(kind, messages);
  const chosen = messages[kind]?.selected;
  return options.find((option) => option.id === chosen) ?? (options[0] as MessageOption);
}

/** Fills the placeholders in and tidies what's left, so a missing dose never leaves a gap. */
export function renderMessage(template: string, vars: ReminderVars): string {
  const values: Record<string, string> = {
    '{name}': vars.name ?? '',
    '{time}': vars.time ?? '',
    '{dose}': vars.dose ?? '',
    '{when}': vars.when ?? '',
  };
  return template
    .replace(/\{(name|time|dose|when)\}/g, (token) => values[token] ?? '')
    .replace(/\s+([.,!?;:])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** The notification text for a reminder, in the wording the person chose. */
export function renderReminder(
  kind: ReminderKind,
  vars: ReminderVars,
  messages: ReminderMessages,
): { title: string; body: string } {
  return {
    title: REMINDER_TITLE,
    body: renderMessage(selectedMessage(kind, messages).text, vars),
  };
}
