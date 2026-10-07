-- App Review demo account: fills an EXISTING account with sample records so
-- Apple's reviewer sees a lived-in app. A made-up transmasc person, Eli
-- (he/him), about ten months on testosterone (same story as the App Store
-- screenshots, apps/mobile/lib/demo/fixtures.ts).
--
-- The account itself is created by the owner in the app (Sign up) with the
-- reviewer email; this script never creates users or touches passwords.
-- Safe to re-run: it clears this account's sample records first.
--
-- Run: npx supabase db query --linked -f supabase/seed/reviewer_account.sql

do $$
declare
  reviewer_email constant text := 'appreview@ttimemedia.org';
  uid uuid;
  t_id uuid;
  d_id uuid;
  shot_dow int := extract(dow from now() at time zone 'America/New_York')::int;
  i int;
begin
  select id into uid from auth.users where email = reviewer_email;
  if uid is null then
    raise exception 'No account for % yet. Sign up in the app first.', reviewer_email;
  end if;

  -- The reviewer shouldn't have to click a confirmation email.
  update auth.users set email_confirmed_at = coalesce(email_confirmed_at, now()) where id = uid;

  -- Start clean (only this account).
  delete from public.medication_logs where user_id = uid;
  delete from public.medications where user_id = uid;
  delete from public.appointments where user_id = uid;
  delete from public.milestones where user_id = uid;
  delete from public.journal_entries where user_id = uid;

  update public.profiles set
    display_name = 'Eli',
    pronouns = 'he/him',
    gender = 'Trans man',
    birthday = '1996-09-14',
    journey_start_date = (current_date - 300),
    onboarding_completed = true,
    onboarding_step = 'ready',
    intent = array['medications', 'appointments', 'milestones', 'journal']
  where user_id = uid;

  update public.settings set palette = 'tidepool', accent_color = 'tidepool', theme = 'light'
  where user_id = uid;

  insert into public.modules (user_id, module_key, enabled, configuration)
  select uid, key, true, '{}'::jsonb
  from unnest(array['medications', 'injections', 'appointments', 'milestones', 'journal']) as key
  on conflict (user_id, module_key) do update set enabled = true;

  -- Weekly shot on today's weekday (so something is due on review day too),
  -- and a daily vitamin.
  insert into public.medications (user_id, name, form, dosage_text, frequency_type, frequency_config, start_date, reminder_enabled, notes)
  values (uid, 'Testosterone cypionate', 'injection', '50 mg (0.25 mL)', 'weekly',
          jsonb_build_object('days_of_week', jsonb_build_array(shot_dow), 'time_of_day', '08:00'),
          current_date - 300, true, 'Alternate thighs.')
  returning id into t_id;

  insert into public.medications (user_id, name, form, dosage_text, frequency_type, frequency_config, start_date, reminder_enabled)
  values (uid, 'Vitamin D', 'pill', '2,000 IU', 'daily', '{"time_of_day": "12:00"}'::jsonb, current_date - 90, false)
  returning id into d_id;

  for i in 1..4 loop
    insert into public.medication_logs (user_id, medication_id, scheduled_at, completed_at, status, site)
    values (uid, t_id, now() - make_interval(days => 7 * i), now() - make_interval(days => 7 * i), 'completed',
            case when i % 2 = 0 then 'right_thigh' else 'left_thigh' end);
  end loop;
  for i in 1..12 loop
    insert into public.medication_logs (user_id, medication_id, scheduled_at, completed_at, status)
    values (uid, d_id, now() - make_interval(days => i), now() - make_interval(days => i), 'completed');
  end loop;

  insert into public.appointments (user_id, title, provider, category, starts_at, ends_at, location, notes, reminder_enabled) values
    (uid, 'Top surgery consult', 'Dr. Okafor', 'Surgery', date_trunc('day', now()) + interval '3 days 14 hours',
     date_trunc('day', now()) + interval '3 days 15 hours', 'Bayview Surgical Associates', 'Ask about recovery time and binder after.', true),
    (uid, 'T levels lab draw', null, 'Labs', date_trunc('day', now()) + interval '6 days 7 hours 45 minutes',
     null, 'Quest Diagnostics', 'Midway between shots.', true),
    (uid, 'Check-in with Dr. Shah', 'Dr. Shah', 'Primary care', date_trunc('day', now()) + interval '13 days 10 hours',
     date_trunc('day', now()) + interval '13 days 10 hours 30 minutes', 'Community Health Center', null, true);

  insert into public.milestones (user_id, title, description, date, category, icon) values
    (uid, 'First T shot', 'Hands shaking, heart full.', current_date - 300, 'First steps', 'flag'),
    (uid, 'Did my own shot', 'No nurse, just me and a deep breath.', current_date - 280, 'Achievement', 'award'),
    (uid, 'Voice dropped', 'Answered the phone and Mom asked who this was.', current_date - 150, 'Changes', 'sparkles'),
    (uid, 'Name change approved', 'New license in my wallet.', current_date - 40, 'Legal', 'party-popper');

  insert into public.journal_entries (user_id, title, content, mood, date, tags) values
    (uid, null, 'Shot day tomorrow. Laid out everything tonight so morning-me just has to show up.', 'Peaceful', current_date - 1, array['HRT']),
    (uid, 'Sir', 'The barista said "thanks, sir" without a second look. Grinned the whole walk home.', 'Proud', current_date - 2, array['Self-care']),
    (uid, 'Consult booked', 'Top surgery consult is on the calendar. Writing my questions here so I remember them.', 'Excited', current_date - 9, array['Appointment']);

  raise notice 'Reviewer account % filled.', reviewer_email;
end $$;
