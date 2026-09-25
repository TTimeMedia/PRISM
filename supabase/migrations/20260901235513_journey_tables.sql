-- PRISM — Foundation migration 4/8
-- JOURNEY tables. milestones and journal_entries are P0. memories is P1
-- (docs/DECISIONS.md) — JOURNEY ships in MVP with the other three.

-- milestones -----------------------------------------------------------------
-- Suggested milestones (Came out, Started HRT, ...) are UI-only content,
-- not database values — any milestone a user creates, suggested or
-- custom, is stored identically here. See docs/SCREEN_BIBLE.md Screen 45.
create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  date date not null,
  category text,
  icon text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index milestones_user_id_idx on public.milestones (user_id);

create trigger set_milestones_updated_at
  before update on public.milestones
  for each row execute function public.set_updated_at();

-- journal_entries --------------------------------------------------------------
-- mood is optional and never a clinical score — see docs/PRODUCT_BIBLE.md
-- §20. Journal content must never be included in analytics — see
-- docs/SECURITY.md §12.
create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text,
  content text not null,
  mood text,
  date date not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index journal_entries_user_id_idx on public.journal_entries (user_id);

create trigger set_journal_entries_updated_at
  before update on public.journal_entries
  for each row execute function public.set_updated_at();

-- memories (P1) ----------------------------------------------------------------
-- "Not progress. Memories." Never framed as proof of physical
-- transition — see docs/DESIGN_SYSTEM.md §18. Not part of MVP
-- (docs/DECISIONS.md).
create table public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  date date,
  media_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index memories_user_id_idx on public.memories (user_id);

create trigger set_memories_updated_at
  before update on public.memories
  for each row execute function public.set_updated_at();
