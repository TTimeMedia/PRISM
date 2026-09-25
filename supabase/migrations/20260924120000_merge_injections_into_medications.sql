-- An injection is a medication. Doses of any medication are logged in
-- medication_logs; an injectable dose can also say where it went in.
--
-- 1. Doses can carry an injection site (same vocabulary as injections.site).
-- 2. Every existing injection becomes a completed dose of its medication.
--    Injections that were never tied to a medication are attached to one
--    generic "Injection" medication per person, created only where needed.
-- 3. People who had Injections switched on get Medications switched on.
--
-- The injections table is left in place, untouched, so nothing is lost and
-- data export still includes it. The app no longer reads or writes it.

alter table public.medication_logs
  add column if not exists site text check (
    site in (
      'left_thigh', 'right_thigh', 'left_glute', 'right_glute',
      'left_abdomen', 'right_abdomen', 'other', 'not_tracked'
    )
  );

-- A home for injections that were logged without choosing a medication.
insert into public.medications (user_id, name, form, reminder_enabled)
select distinct i.user_id, 'Injection', 'injection', false
from public.injections i
where i.medication_id is null
  and not exists (
    select 1
    from public.medications m
    where m.user_id = i.user_id
      and m.name = 'Injection'
      and m.form = 'injection'
  );

-- Copy each injection across as a completed dose, skipping any already copied.
insert into public.medication_logs
  (user_id, medication_id, scheduled_at, completed_at, status, notes, site, created_at, updated_at)
select
  i.user_id,
  coalesce(
    i.medication_id,
    (
      select m.id
      from public.medications m
      where m.user_id = i.user_id and m.name = 'Injection' and m.form = 'injection'
      order by m.created_at
      limit 1
    )
  ),
  i.injected_at,
  i.injected_at,
  'completed',
  i.notes,
  i.site,
  i.created_at,
  i.updated_at
from public.injections i
where not exists (
  select 1
  from public.medication_logs l
  where l.user_id = i.user_id
    and l.scheduled_at = i.injected_at
    and l.site is not distinct from i.site
    and l.medication_id = coalesce(
      i.medication_id,
      (
        select m.id
        from public.medications m
        where m.user_id = i.user_id and m.name = 'Injection' and m.form = 'injection'
        order by m.created_at
        limit 1
      )
    )
);

-- Injections was its own feature switch; Medications covers it now.
insert into public.modules (user_id, module_key, enabled)
select user_id, 'medications', true
from public.modules
where module_key = 'injections' and enabled
on conflict (user_id, module_key) do update set enabled = true;

comment on table public.injections is
  'Legacy. Injections are now doses in medication_logs (with a site). Kept for history and export; no longer read or written by the app.';
