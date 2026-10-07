-- Prism — euphoria jar, questions for the doctor, supplies and refills.
-- Every table belongs to one person (RLS: own rows only) and is removed with
-- the account (on delete cascade from auth.users).

-- Euphoria jar: small good moments, brought back at random on a hard day.
create table public.euphoria_moments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  text text not null check (char_length(text) between 1 and 280),
  created_at timestamptz not null default now()
);
create index euphoria_moments_user_id_idx on public.euphoria_moments (user_id);
alter table public.euphoria_moments enable row level security;
create policy "euphoria_moments_select_own" on public.euphoria_moments
  for select using (auth.uid() = user_id);
create policy "euphoria_moments_insert_own" on public.euphoria_moments
  for insert with check (auth.uid() = user_id);
create policy "euphoria_moments_delete_own" on public.euphoria_moments
  for delete using (auth.uid() = user_id);

-- Questions for the doctor. A question without an appointment belongs to the
-- next upcoming one; deleting an appointment hands its questions back to that
-- pool instead of losing them.
create table public.appointment_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  appointment_id uuid references public.appointments (id) on delete set null,
  question text not null check (char_length(question) between 1 and 500),
  asked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index appointment_questions_user_id_idx on public.appointment_questions (user_id);
create index appointment_questions_appointment_id_idx on public.appointment_questions (appointment_id);
create trigger set_appointment_questions_updated_at
  before update on public.appointment_questions
  for each row execute function public.set_updated_at();
alter table public.appointment_questions enable row level security;
create policy "appointment_questions_select_own" on public.appointment_questions
  for select using (auth.uid() = user_id);
create policy "appointment_questions_insert_own" on public.appointment_questions
  for insert with check (auth.uid() = user_id);
create policy "appointment_questions_update_own" on public.appointment_questions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "appointment_questions_delete_own" on public.appointment_questions
  for delete using (auth.uid() = user_id);

-- Supplies and refills: vials, syringes, needles, pills, patches. When a
-- supply is linked to a medication with an amount per dose, logging a dose
-- counts it down (and Undo counts it back up).
create table public.supplies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  medication_id uuid references public.medications (id) on delete set null,
  quantity numeric not null default 0 check (quantity >= 0),
  unit text check (unit is null or char_length(unit) <= 30),
  per_dose numeric check (per_dose is null or per_dose > 0),
  refill_on date,
  pharmacy text check (pharmacy is null or char_length(pharmacy) <= 200),
  notes text check (notes is null or char_length(notes) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index supplies_user_id_idx on public.supplies (user_id);
create index supplies_medication_id_idx on public.supplies (medication_id);
create trigger set_supplies_updated_at
  before update on public.supplies
  for each row execute function public.set_updated_at();
alter table public.supplies enable row level security;
create policy "supplies_select_own" on public.supplies
  for select using (auth.uid() = user_id);
create policy "supplies_insert_own" on public.supplies
  for insert with check (auth.uid() = user_id);
create policy "supplies_update_own" on public.supplies
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "supplies_delete_own" on public.supplies
  for delete using (auth.uid() = user_id);

-- Runs as the person logging the dose, so RLS still limits it to their own supplies.
create or replace function public.count_supplies_for_dose()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  was_taken boolean := tg_op in ('UPDATE', 'DELETE') and old.status = 'completed';
  is_taken boolean := tg_op in ('INSERT', 'UPDATE') and new.status = 'completed';
  row_user uuid := coalesce(new.user_id, old.user_id);
  row_medication uuid := coalesce(new.medication_id, old.medication_id);
begin
  if is_taken and not was_taken then
    update public.supplies
      set quantity = greatest(quantity - per_dose, 0)
      where user_id = row_user and medication_id = row_medication and per_dose is not null;
  elsif was_taken and not is_taken then
    update public.supplies
      set quantity = quantity + per_dose
      where user_id = row_user and medication_id = row_medication and per_dose is not null;
  end if;
  return null;
end;
$$;

create trigger count_supplies_after_dose
  after insert or update of status or delete on public.medication_logs
  for each row execute function public.count_supplies_for_dose();
