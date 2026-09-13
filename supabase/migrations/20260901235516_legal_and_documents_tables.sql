-- PRISM — Foundation migration 5/8
-- legal_items and documents — both P1 (docs/DECISIONS.md). Created now
-- so the architecture anticipates them; no P1 screens exist yet.

-- legal_items ------------------------------------------------------------------
-- User-managed tracking only — PRISM does not provide legal advice.
-- See docs/PRODUCT_BIBLE.md §17.
create table public.legal_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  category text not null,
  status text not null check (
    status in ('not_started', 'preparing', 'filed', 'in_progress', 'approved', 'complete')
  ),
  date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index legal_items_user_id_idx on public.legal_items (user_id);

create trigger set_legal_items_updated_at
  before update on public.legal_items
  for each row execute function public.set_updated_at();

-- documents --------------------------------------------------------------------
-- High-security feature — see docs/SECURITY.md §5. storage_path points
-- into the private `documents` bucket (see storage_buckets_and_policies
-- migration); it must never be publicly resolvable.
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  category text not null,
  storage_path text not null,
  mime_type text,
  file_size bigint,
  uploaded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index documents_user_id_idx on public.documents (user_id);

create trigger set_documents_updated_at
  before update on public.documents
  for each row execute function public.set_updated_at();

-- Note: labs.attachment_id and memories.media_id are intentionally left
-- as plain uuid columns without a foreign key here. The source
-- specification (docs/MASTER_BUILD_SPEC.md §18) defines both as bare
-- UUID fields without stating what they reference — memories in
-- particular may point at a storage object in the `memories` bucket
-- rather than a public.documents row. Add the FK once the CARE/JOURNEY
-- milestone actually implements attachments and settles that question,
-- rather than guessing a relationship the spec doesn't state.
