-- Prism — support requests from inside the app
-- Contact support, Report a problem and Privacy concern are in-app forms.
-- Each one is kept here and emailed to support@ttimemedia.org by the
-- submit-support Edge Function, which reads the sender's email address from
-- their account so a reply reaches them. A screenshot is optional, off by
-- default, and lives in the private `attachments` bucket under
-- {user_id}/support/, so deleting the account removes it with everything else.

create table public.support_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('contact', 'problem', 'privacy')),
  message text not null check (char_length(message) between 1 and 5000),
  -- Where they were and what they were running, to help reproduce a problem.
  screen text,
  app_version text,
  platform text,
  os_version text,
  -- Object path in the `attachments` bucket, never a URL.
  screenshot_path text,
  emailed_at timestamptz,
  created_at timestamptz not null default now()
);

create index support_requests_user_id_idx on public.support_requests (user_id);

alter table public.support_requests enable row level security;

-- People can send requests and see their own; nobody edits or deletes one
-- from the app. Deleting the account deletes them.
create policy "support_requests_select_own" on public.support_requests
  for select using (auth.uid() = user_id);
create policy "support_requests_insert_own" on public.support_requests
  for insert with check (auth.uid() = user_id);
