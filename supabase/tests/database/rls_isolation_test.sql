-- PRISM RLS adversarial test suite.
-- Verifies docs/SECURITY.md §19: "Attempt to: access another user's
-- record, guess another user's UUID, modify another user's record...
-- Every attempt must fail."
--
-- This file was written and verified against a real PostgreSQL 16
-- server during Milestone 01 (Foundation) — every assertion below
-- passed against the actual migrations in supabase/migrations/, run in
-- order, with no errors. See docs/BUILD_STATUS.md for how it was run
-- (this sandbox has no Docker, so a local, non-Docker Postgres plus a
-- small stand-in for Supabase's `auth`/`storage` schemas was used).
--
-- To run against a real local Supabase project (requires Docker):
--   supabase start
--   psql "$(supabase status -o json | jq -r .DB_URL)" -f supabase/tests/database/rls_isolation_test.sql
--
-- Uses plain PL/pgSQL ASSERT rather than pgTAP so it has no extension
-- dependency beyond what every PRISM migration already requires.

begin;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'test_authenticated') then
    create role test_authenticated nologin;
  end if;
end $$;
grant usage on schema public to test_authenticated;
grant select, insert, update, delete on all tables in schema public to test_authenticated;
grant usage on schema storage to test_authenticated;
grant select, insert, update, delete on storage.objects to test_authenticated;

-- Two fake users. Inserting into auth.users fires `on_auth_user_created`
-- (see 20260901235509_core_tables.sql), which must auto-create a
-- matching profiles + settings row for each.
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'alex@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'sam@example.com');

do $$
declare profile_count int;
begin
  select count(*) into profile_count from public.profiles
    where user_id in ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
  assert profile_count = 2, format('FAIL: expected on_auth_user_created to create 2 profiles, found %s', profile_count);
  raise notice 'PASS: on_auth_user_created auto-created a profiles row for each new user.';
end $$;

-- --- User A: personalize their auto-created profile, add a medication and a journal entry.
set session role test_authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

update public.profiles set display_name = 'Alex' where user_id = '11111111-1111-1111-1111-111111111111';

insert into public.medications (user_id, name) values
  ('11111111-1111-1111-1111-111111111111', 'Testosterone');

insert into public.journal_entries (user_id, content, date) values
  ('11111111-1111-1111-1111-111111111111', 'Private thoughts.', current_date);

insert into storage.objects (bucket_id, name, owner) values
  ('documents', '11111111-1111-1111-1111-111111111111/report.pdf', '11111111-1111-1111-1111-111111111111');

reset role;

-- --- User B: personalize their own auto-created profile.
set session role test_authenticated;
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';

update public.profiles set display_name = 'Sam' where user_id = '22222222-2222-2222-2222-222222222222';

-- TEST 1: User B selects `profiles` — must see only their own row.
do $$
declare visible_count int;
begin
  select count(*) into visible_count from public.profiles;
  assert visible_count = 1, format('FAIL: User B can see %s profile rows, expected 1', visible_count);
  raise notice 'PASS: User B sees exactly their own profile row.';
end $$;

-- TEST 2: User B cannot see User A's medication.
do $$
declare visible_count int;
begin
  select count(*) into visible_count from public.medications
    where user_id = '11111111-1111-1111-1111-111111111111';
  assert visible_count = 0, 'FAIL: User B can see User A''s medication';
  raise notice 'PASS: User B cannot see User A''s medication.';
end $$;

-- TEST 3: User B cannot see User A's journal entry.
do $$
declare visible_count int;
begin
  select count(*) into visible_count from public.journal_entries
    where user_id = '11111111-1111-1111-1111-111111111111';
  assert visible_count = 0, 'FAIL: User B can see User A''s journal entry';
  raise notice 'PASS: User B cannot see User A''s journal entry.';
end $$;

-- TEST 4: User B cannot UPDATE User A's profile directly by user_id.
do $$
declare affected int;
begin
  update public.profiles set display_name = 'HACKED' where user_id = '11111111-1111-1111-1111-111111111111';
  get diagnostics affected = row_count;
  assert affected = 0, format('FAIL: User B updated %s of User A''s profile rows', affected);
  raise notice 'PASS: User B cannot update User A''s profile.';
end $$;

-- TEST 5: User B cannot DELETE User A's profile directly.
do $$
declare affected int;
begin
  delete from public.profiles where user_id = '11111111-1111-1111-1111-111111111111';
  get diagnostics affected = row_count;
  assert affected = 0, format('FAIL: User B deleted %s of User A''s profile rows', affected);
  raise notice 'PASS: User B cannot delete User A''s profile.';
end $$;

-- TEST 6: User B cannot INSERT a record impersonating User A (client-supplied ownership).
do $$
begin
  begin
    insert into public.medications (user_id, name) values
      ('11111111-1111-1111-1111-111111111111', 'Spoofed');
    raise exception 'FAIL: User B inserted a medication owned by User A';
  exception
    when insufficient_privilege or check_violation then
      raise notice 'PASS: User B cannot insert a record owned by User A.';
  end;
end $$;

-- TEST 7: User B cannot see User A's private document (Storage RLS).
do $$
declare visible_count int;
begin
  select count(*) into visible_count from storage.objects where bucket_id = 'documents';
  assert visible_count = 0, format('FAIL: User B can see %s objects in User A''s documents folder', visible_count);
  raise notice 'PASS: User B cannot see User A''s document object.';
end $$;

reset role;

-- --- User A again: confirm they still see exactly their own data.
set session role test_authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

do $$
declare visible_count int;
begin
  select count(*) into visible_count from public.profiles;
  assert visible_count = 1, format('FAIL: User A can see %s profile rows, expected 1', visible_count);
  raise notice 'PASS: User A still sees exactly their own profile row.';

  select count(*) into visible_count from public.medications;
  assert visible_count = 1, format('FAIL: User A can see %s medication rows, expected 1', visible_count);
  raise notice 'PASS: User A still sees exactly their own medication.';

  select count(*) into visible_count from storage.objects where bucket_id = 'documents';
  assert visible_count = 1, format('FAIL: User A cannot see their own document object (found %s)', visible_count);
  raise notice 'PASS: User A can see their own document object.';
end $$;

reset role;

-- TEST 8: An invalid module_key is rejected by the CHECK constraint (defense in depth).
set session role test_authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
do $$
begin
  begin
    insert into public.modules (user_id, module_key) values ('11111111-1111-1111-1111-111111111111', 'not_a_real_module');
    raise exception 'FAIL: invalid module_key was accepted';
  exception when check_violation then
    raise notice 'PASS: invalid module_key rejected by CHECK constraint.';
  end;
end $$;
reset role;

-- TEST 9: settings has exactly one row per user (docs/DECISIONS.md — user_id is the sole PK).
set session role test_authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
do $$
begin
  begin
    insert into public.settings (user_id) values ('11111111-1111-1111-1111-111111111111');
    raise exception 'FAIL: a second settings row for the same user was accepted';
  exception when unique_violation then
    raise notice 'PASS: settings.user_id primary key prevents a second row per user.';
  end;
end $$;
reset role;

-- TEST 10: an unauthenticated session (no auth.uid()) sees nothing.
set session role test_authenticated;
set request.jwt.claim.sub = '';

do $$
declare visible_count int;
begin
  select count(*) into visible_count from public.profiles;
  assert visible_count = 0, format('FAIL: unauthenticated session can see %s profile rows', visible_count);
  raise notice 'PASS: unauthenticated session sees zero profile rows.';
end $$;

reset role;

do $$
begin
  raise notice '=== ALL RLS ADVERSARIAL TESTS PASSED ===';
end $$;

rollback;
