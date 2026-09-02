-- PRISM — Foundation migration 7/8
-- Row Level Security for every user-owned table. Core rule (see
-- docs/SECURITY.md §2 and docs/MASTER_BUILD_SPEC.md §19):
--   an authenticated user may access only records where
--   user_id = auth.uid()
-- The frontend must never be the security boundary — this is it.
-- Policies are split per operation (select/insert/update/delete) rather
-- than a single `for all` policy so each is independently auditable and
-- independently testable, matching docs/SECURITY.md §19's requirement to
-- verify RLS with adversarial tests per operation.

-- profiles ---------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = user_id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = user_id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "profiles_delete_own" on public.profiles
  for delete using (auth.uid() = user_id);

-- modules ------------------------------------------------------------------
alter table public.modules enable row level security;

create policy "modules_select_own" on public.modules
  for select using (auth.uid() = user_id);
create policy "modules_insert_own" on public.modules
  for insert with check (auth.uid() = user_id);
create policy "modules_update_own" on public.modules
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "modules_delete_own" on public.modules
  for delete using (auth.uid() = user_id);

-- settings -------------------------------------------------------------------
alter table public.settings enable row level security;

create policy "settings_select_own" on public.settings
  for select using (auth.uid() = user_id);
create policy "settings_insert_own" on public.settings
  for insert with check (auth.uid() = user_id);
create policy "settings_update_own" on public.settings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "settings_delete_own" on public.settings
  for delete using (auth.uid() = user_id);

-- medications ------------------------------------------------------------------
alter table public.medications enable row level security;

create policy "medications_select_own" on public.medications
  for select using (auth.uid() = user_id);
create policy "medications_insert_own" on public.medications
  for insert with check (auth.uid() = user_id);
create policy "medications_update_own" on public.medications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "medications_delete_own" on public.medications
  for delete using (auth.uid() = user_id);

-- medication_logs --------------------------------------------------------------
alter table public.medication_logs enable row level security;

create policy "medication_logs_select_own" on public.medication_logs
  for select using (auth.uid() = user_id);
create policy "medication_logs_insert_own" on public.medication_logs
  for insert with check (auth.uid() = user_id);
create policy "medication_logs_update_own" on public.medication_logs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "medication_logs_delete_own" on public.medication_logs
  for delete using (auth.uid() = user_id);

-- injections -------------------------------------------------------------------
alter table public.injections enable row level security;

create policy "injections_select_own" on public.injections
  for select using (auth.uid() = user_id);
create policy "injections_insert_own" on public.injections
  for insert with check (auth.uid() = user_id);
create policy "injections_update_own" on public.injections
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "injections_delete_own" on public.injections
  for delete using (auth.uid() = user_id);

-- appointments -------------------------------------------------------------------
alter table public.appointments enable row level security;

create policy "appointments_select_own" on public.appointments
  for select using (auth.uid() = user_id);
create policy "appointments_insert_own" on public.appointments
  for insert with check (auth.uid() = user_id);
create policy "appointments_update_own" on public.appointments
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "appointments_delete_own" on public.appointments
  for delete using (auth.uid() = user_id);

-- labs (P1) ------------------------------------------------------------------
alter table public.labs enable row level security;

create policy "labs_select_own" on public.labs
  for select using (auth.uid() = user_id);
create policy "labs_insert_own" on public.labs
  for insert with check (auth.uid() = user_id);
create policy "labs_update_own" on public.labs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "labs_delete_own" on public.labs
  for delete using (auth.uid() = user_id);

-- procedures (P1) --------------------------------------------------------------
alter table public.procedures enable row level security;

create policy "procedures_select_own" on public.procedures
  for select using (auth.uid() = user_id);
create policy "procedures_insert_own" on public.procedures
  for insert with check (auth.uid() = user_id);
create policy "procedures_update_own" on public.procedures
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "procedures_delete_own" on public.procedures
  for delete using (auth.uid() = user_id);

-- milestones -----------------------------------------------------------------
alter table public.milestones enable row level security;

create policy "milestones_select_own" on public.milestones
  for select using (auth.uid() = user_id);
create policy "milestones_insert_own" on public.milestones
  for insert with check (auth.uid() = user_id);
create policy "milestones_update_own" on public.milestones
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "milestones_delete_own" on public.milestones
  for delete using (auth.uid() = user_id);

-- journal_entries --------------------------------------------------------------
alter table public.journal_entries enable row level security;

create policy "journal_entries_select_own" on public.journal_entries
  for select using (auth.uid() = user_id);
create policy "journal_entries_insert_own" on public.journal_entries
  for insert with check (auth.uid() = user_id);
create policy "journal_entries_update_own" on public.journal_entries
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "journal_entries_delete_own" on public.journal_entries
  for delete using (auth.uid() = user_id);

-- memories (P1) ----------------------------------------------------------------
alter table public.memories enable row level security;

create policy "memories_select_own" on public.memories
  for select using (auth.uid() = user_id);
create policy "memories_insert_own" on public.memories
  for insert with check (auth.uid() = user_id);
create policy "memories_update_own" on public.memories
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "memories_delete_own" on public.memories
  for delete using (auth.uid() = user_id);

-- legal_items (P1) --------------------------------------------------------------
alter table public.legal_items enable row level security;

create policy "legal_items_select_own" on public.legal_items
  for select using (auth.uid() = user_id);
create policy "legal_items_insert_own" on public.legal_items
  for insert with check (auth.uid() = user_id);
create policy "legal_items_update_own" on public.legal_items
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "legal_items_delete_own" on public.legal_items
  for delete using (auth.uid() = user_id);

-- documents (P1) -----------------------------------------------------------------
alter table public.documents enable row level security;

create policy "documents_select_own" on public.documents
  for select using (auth.uid() = user_id);
create policy "documents_insert_own" on public.documents
  for insert with check (auth.uid() = user_id);
create policy "documents_update_own" on public.documents
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "documents_delete_own" on public.documents
  for delete using (auth.uid() = user_id);

-- reminders ----------------------------------------------------------------------
alter table public.reminders enable row level security;

create policy "reminders_select_own" on public.reminders
  for select using (auth.uid() = user_id);
create policy "reminders_insert_own" on public.reminders
  for insert with check (auth.uid() = user_id);
create policy "reminders_update_own" on public.reminders
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "reminders_delete_own" on public.reminders
  for delete using (auth.uid() = user_id);
