-- Test-only stand-in for the parts of Supabase's `auth`/`storage`
-- schemas that PRISM's own migrations/policies depend on.
--
-- NOT part of PRISM's real database schema — this exists purely so
-- rls_isolation_test.sql (and this file) can run against a plain
-- `postgres:16` container (CI's `database-rls` job in
-- .github/workflows/ci.yml, and a local non-Docker Postgres in a
-- sandbox with no Docker daemon), neither of which provide Supabase's
-- actual `auth`/`storage` schemas the way a real Supabase project (or
-- the Supabase CLI's local stack via `supabase start`) does.
--
-- This is a deliberate, documented substitute — the closest thing to
-- authoritative is still a real local Supabase stack:
--   supabase start
--   psql "$(supabase status -o json | jq -r .DB_URL)" -f supabase/tests/database/rls_isolation_test.sql
-- Run that before any release this file's own comment doesn't already
-- cover — see docs/SECURITY.md §19.

create schema if not exists auth;
create schema if not exists storage;
create schema if not exists extensions;

-- auth.users: just enough for FK targets + the on_auth_user_created trigger.
create table auth.users (
  id uuid primary key default gen_random_uuid(),
  email text
);

-- auth.uid(): real Supabase reads this from the JWT via PostgREST's
-- request.jwt.claims GUC; here it reads a plain per-session GUC that
-- rls_isolation_test.sql sets directly (request.jwt.claim.sub).
create or replace function auth.uid() returns uuid
language sql stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

-- storage.buckets / storage.objects: just the columns PRISM's storage
-- migration and policies actually reference.
create table storage.buckets (
  id text primary key,
  name text not null,
  public boolean not null default false,
  file_size_limit bigint,
  allowed_mime_types text[]
);

create table storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets(id),
  name text not null,
  owner uuid
);

alter table storage.objects enable row level security;

-- storage.foldername(name): splits a "{user_id}/filename" path and
-- returns every segment except the last, matching real Supabase
-- semantics closely enough for (storage.foldername(name))[1] usage.
create or replace function storage.foldername(name text) returns text[]
language sql immutable
as $$
  select case
    when array_length(string_to_array(name, '/'), 1) <= 1 then array[]::text[]
    else (string_to_array(name, '/'))[1 : array_length(string_to_array(name, '/'), 1) - 1]
  end;
$$;
