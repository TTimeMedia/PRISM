-- PRISM — Foundation migration 2/8
-- Core identity tables: profiles, modules, settings.
-- Column shapes match docs/MASTER_BUILD_SPEC.md §18 and packages/types
-- exactly — keep the two in sync if either changes.

-- Shared trigger function: keeps `updated_at` current on every UPDATE.
-- Reused by every PRISM table with an updated_at column (see the
-- migrations that follow).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- profiles ---------------------------------------------------------------
-- Everything except user_id is optional — see docs/PRODUCT_BIBLE.md §8.2
-- (No Assumptions). Never make any of these NOT NULL without a
-- corresponding, deliberate product decision recorded in docs/DECISIONS.md.
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  display_name text,
  pronouns text,
  gender text,
  birthday date,
  journey_start_date date,
  profile_photo_url text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- modules ------------------------------------------------------------------
-- Every module key PRISM anticipates exists here from Foundation onward —
-- P0 (medications, injections, appointments, milestones, journal) and P1
-- (labs, procedures, memories, legal, documents) alike. Only the *UI*
-- distinguishes P0 from P1 — see docs/DECISIONS.md "Customize PRISM and
-- Quick Add expose only P0 modules until P1 ships".
create table public.modules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  module_key text not null check (
    module_key in (
      'medications', 'injections', 'appointments', 'milestones', 'journal',
      'labs', 'procedures', 'memories', 'legal', 'documents'
    )
  ),
  enabled boolean not null default false,
  configuration jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, module_key)
);

create trigger set_modules_updated_at
  before update on public.modules
  for each row execute function public.set_updated_at();

-- settings -------------------------------------------------------------------
-- One row per user; user_id is the sole primary key (no surrogate id) —
-- see docs/DECISIONS.md "RESOLVED — settings table primary key".
create table public.settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  biometric_lock boolean not null default false,
  -- Private notifications default ON — see docs/SECURITY.md §7.
  notification_privacy boolean not null default true,
  reduced_motion boolean not null default false,
  accessibility_preferences jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_settings_updated_at
  before update on public.settings
  for each row execute function public.set_updated_at();

-- New-user bootstrap ---------------------------------------------------------
-- Every account gets a profiles row and a settings row the moment it's
-- created, so the rest of the app can always assume they exist rather
-- than every feature having to check-and-create them. Nothing here
-- fills in optional identity fields — that stays entirely user-driven
-- during onboarding.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id) values (new.id);
  insert into public.settings (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
