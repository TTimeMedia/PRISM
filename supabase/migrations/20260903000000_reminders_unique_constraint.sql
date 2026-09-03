-- PRISM — Reminder-scheduling engine.
-- A user has at most one `reminders` row per (type, reference_id) — see
-- lib/reminders/mutations.ts's upsert, which reconciles native-notification
-- scheduling against this table each time useReminderSync runs. NULLs are
-- distinct under a unique constraint, which is fine here: every reminder
-- type this app creates (medication/appointment) always has a reference_id.

alter table public.reminders
  add constraint reminders_user_type_reference_unique unique (user_id, type, reference_id);
