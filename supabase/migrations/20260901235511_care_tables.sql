-- PRISM — Foundation migration 3/8
-- CARE tables. medications, medication_logs, injections, appointments are
-- P0. labs and procedures are P1 (docs/DECISIONS.md) — created now so the
-- architecture anticipates them; no P1 screens exist yet.

-- medications ----------------------------------------------------------------
-- dosage_text is user-entered, informational only. PRISM never
-- calculates or recommends dosage — see docs/PRODUCT_BIBLE.md §12.
create table public.medications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  form text check (form in ('pill', 'injection', 'patch', 'gel', 'cream', 'other')),
  dosage_text text,
  frequency_type text check (frequency_type in ('daily', 'weekly', 'every_x_days', 'custom')),
  -- Shape defined in packages/validation frequencyConfigSchema.
  frequency_config jsonb,
  start_date date,
  end_date date,
  reminder_enabled boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index medications_user_id_idx on public.medications (user_id);

create trigger set_medications_updated_at
  before update on public.medications
  for each row execute function public.set_updated_at();

-- medication_logs --------------------------------------------------------------
-- Status vocabulary is neutral by product requirement, not just style —
-- see docs/PRODUCT_BIBLE.md §8.4 (No Judgment).
create table public.medication_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  medication_id uuid not null references public.medications (id) on delete cascade,
  scheduled_at timestamptz not null,
  completed_at timestamptz,
  status text not null check (
    status in ('scheduled', 'completed', 'skipped', 'missed', 'skipped_intentionally')
  ),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index medication_logs_user_id_idx on public.medication_logs (user_id);
create index medication_logs_medication_id_idx on public.medication_logs (medication_id);

create trigger set_medication_logs_updated_at
  before update on public.medication_logs
  for each row execute function public.set_updated_at();

-- injections -------------------------------------------------------------------
-- Optional; not the identity of PRISM. `site` is a tracking label only —
-- never a medical recommendation. See docs/PRODUCT_BIBLE.md §13.
create table public.injections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  medication_id uuid references public.medications (id) on delete set null,
  injected_at timestamptz not null,
  site text check (
    site in (
      'left_thigh', 'right_thigh', 'left_glute', 'right_glute',
      'left_abdomen', 'right_abdomen', 'other', 'not_tracked'
    )
  ),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index injections_user_id_idx on public.injections (user_id);

create trigger set_injections_updated_at
  before update on public.injections
  for each row execute function public.set_updated_at();

-- appointments -------------------------------------------------------------------
-- `category` is free text — suggested categories exist in
-- packages/types (SUGGESTED_APPOINTMENT_CATEGORIES) but are not
-- enforced; users may add their own.
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  provider text,
  category text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  notes text,
  reminder_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index appointments_user_id_idx on public.appointments (user_id);

create trigger set_appointments_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();

-- labs (P1) ------------------------------------------------------------------
-- PRISM stores lab records; it never interprets results. Not part of
-- MVP (docs/DECISIONS.md) — table exists from Foundation onward regardless.
create table public.labs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  date date not null,
  provider text,
  status text check (
    status in ('scheduled', 'completed', 'results_received', 'follow_up_needed')
  ),
  notes text,
  attachment_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index labs_user_id_idx on public.labs (user_id);

create trigger set_labs_updated_at
  before update on public.labs
  for each row execute function public.set_updated_at();

-- procedures (P1) --------------------------------------------------------------
-- PRISM records procedures; it never determines eligibility or
-- readiness. Not part of MVP (docs/DECISIONS.md).
create table public.procedures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  date date not null,
  provider text,
  category text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index procedures_user_id_idx on public.procedures (user_id);

create trigger set_procedures_updated_at
  before update on public.procedures
  for each row execute function public.set_updated_at();
