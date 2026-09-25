-- Prism — the wording of reminders
-- What a reminder says when Private notifications is off: which built-in
-- version the person picked for each kind, and any they wrote themselves.
-- Shape is validated client-side and by send-push (see
-- packages/types/src/reminderMessages.ts); an empty object means the defaults.

alter table public.settings
  add column if not exists reminder_messages jsonb not null default '{}'::jsonb;
