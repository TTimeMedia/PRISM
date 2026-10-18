-- Prism — a key for the Apple Watch
-- The watch app reads which of today's doses are taken and logs a dose
-- through the watch Edge Function, so it works without Prism open on the
-- iPhone. It can't sign in, so the phone gives it a watch-only key. The key
-- can do exactly two things (see supabase/functions/watch): list the
-- person's completed dose logs in a time range, and log a dose for one of
-- their own medications. Nothing else.
--
-- Only a SHA-256 hash of the key is stored. One key per person: making a
-- new one replaces the old. Signing out on the phone deletes it, and so
-- does deleting the account (on delete cascade).

create table public.watch_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);

alter table public.watch_tokens enable row level security;

-- People can see that a key exists and delete it. Keys are only made by
-- create_watch_token(), so there is no insert or update policy.
create policy "watch_tokens_select_own" on public.watch_tokens
  for select using (auth.uid() = user_id);
create policy "watch_tokens_delete_own" on public.watch_tokens
  for delete using (auth.uid() = user_id);

-- Makes a new watch key for the signed-in person, replacing any old one, and
-- returns it. This is the only time the key itself is ever seen.
create function public.create_watch_token()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  token text;
begin
  if uid is null then
    raise exception 'Not signed in.' using errcode = '42501';
  end if;
  -- Two random v4 UUIDs: 244 random bits.
  token := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  insert into public.watch_tokens (user_id, token_hash)
    values (uid, encode(sha256(convert_to(token, 'UTF8')), 'hex'))
    on conflict (user_id) do update
      set token_hash = excluded.token_hash, created_at = now(), last_used_at = null;
  return token;
end;
$$;

revoke all on function public.create_watch_token() from public, anon;
grant execute on function public.create_watch_token() to authenticated;
