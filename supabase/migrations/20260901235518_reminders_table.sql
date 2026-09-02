-- PRISM — Foundation migration 6/8
-- reminders. Private notifications default ON — see docs/SECURITY.md §7.

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  reference_id uuid,
  scheduled_time timestamptz not null,
  -- Shape defined in packages/validation recurrenceSchema.
  recurrence jsonb,
  notification_style text not null default 'private' check (
    notification_style in ('private', 'standard', 'custom')
  ),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reminders_user_id_idx on public.reminders (user_id);
create index reminders_scheduled_time_idx on public.reminders (scheduled_time);

create trigger set_reminders_updated_at
  before update on public.reminders
  for each row execute function public.set_updated_at();
