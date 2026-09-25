-- Prism — server push notifications
-- Device tokens live here so the server can send a push to a person's phones.
-- Nothing sensitive is stored: a token is an opaque address issued by Expo.
-- What each category may say is enforced by the send-push Edge Function:
-- reminders stay generic unless the person turned "Private notifications" off.

create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  token text not null unique,
  platform text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index push_tokens_user_id_idx on public.push_tokens (user_id);

create trigger set_push_tokens_updated_at
  before update on public.push_tokens
  for each row execute function public.set_updated_at();

alter table public.push_tokens enable row level security;

create policy "push_tokens_select_own" on public.push_tokens
  for select using (auth.uid() = user_id);
create policy "push_tokens_insert_own" on public.push_tokens
  for insert with check (auth.uid() = user_id);
create policy "push_tokens_update_own" on public.push_tokens
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "push_tokens_delete_own" on public.push_tokens
  for delete using (auth.uid() = user_id);

-- Which kinds of push a person wants. Security alerts default on (they
-- matter); everything else is opt-in. Keys: security, updates, nudges,
-- reminders. Missing keys fall back to these same defaults in the app.
alter table public.settings
  add column push_preferences jsonb not null
  default '{"security": true, "updates": false, "nudges": false, "reminders": false}'::jsonb;
