-- PRISM — Milestone 03 (Personalization/Onboarding)
-- Extends profiles and settings with fields the Onboarding screens need
-- that the original schema (docs/MASTER_BUILD_SPEC.md §18) has no column
-- for — see docs/DECISIONS.md for why each was added.

-- profiles.journey_stage ----------------------------------------------------
-- Onboarding Screen 10 ("Where are you right now?"). Optional, never a
-- progress meter — see docs/SCREEN_BIBLE.md Screen 10.
alter table public.profiles
  add column journey_stage text check (
    journey_stage in (
      'exploring', 'preparing', 'in_progress', 'established',
      'somewhere_else', 'prefer_not_to_say'
    )
  );

-- profiles.intent ------------------------------------------------------------
-- Onboarding Screen 09 ("What Brings You Here?"), multi-select. Also the
-- signal that gates whether Appointment Setup (Screen 15) appears — see
-- docs/SCREEN_BIBLE.md Screen 15's condition ("only shown if appointment
-- tracking was selected"), which has no other source screen.
alter table public.profiles
  add column intent text[];

-- profiles.onboarding_step ----------------------------------------------------
-- Tracks the next unfinished onboarding screen so the flow can actually
-- resume where it left off (docs/SCREEN_BIBLE.md §5: "the whole flow can
-- be resumed if interrupted") — field completeness alone can't tell a
-- skipped optional step from one never reached. Null = not started yet
-- (resume at the first step). See @prism/types ONBOARDING_STEPS for the
-- ordered list of valid values.
alter table public.profiles
  add column onboarding_step text;

-- settings.app_lock_enabled ---------------------------------------------------
-- Onboarding Screen 17 ("Protect your PRISM") has two distinct toggles —
-- App Lock and Biometrics — but the original schema only had
-- `biometric_lock`. `app_lock_enabled` is the master switch (show the
-- lock screen at all); `biometric_lock` selects biometric vs. PIN as the
-- unlock method once it's on. The PIN itself is never stored here or on
-- any server — see docs/SECURITY.md §8; it belongs in on-device secure
-- storage (expo-secure-store), a concern for the App Lock milestone that
-- actually enforces this, not Onboarding.
alter table public.settings
  add column app_lock_enabled boolean not null default false;
