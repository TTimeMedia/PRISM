# PRISM Decisions Log

This is the authoritative, dated record of explicit PRISM product decisions. It exists so that "why does PRISM work this way?" always has a traceable answer, and so future changes to these decisions are made deliberately, not by accident.

Format:

```
Decision
Date
Status
Reason
Implications
```

All decisions below were extracted from the original PRISM master source document (`docs/archive/PRISM_MASTER_SOURCE.docx`) during the documentation setup on 2026-09-01, unless otherwise noted. "Date" reflects when the decision was recorded in this log, not necessarily when it was first conceived.

---

## Core Identity & Scope

### PRISM is for all transgender and gender-diverse people

**Date:** 2026-09-01
**Status:** Active
**Reason:** The product must work equally well for trans men, trans women, nonbinary people, gender-fluid people, and questioning people, regardless of where they are in any process of transition.
**Implications:** No onboarding flow, screen, or default may be tuned to one identity group's typical path. User research (see `PRODUCT_BIBLE.md` §16) must include this full range before launch.

### PRISM does not assume HRT

**Date:** 2026-09-01
**Status:** Active
**Reason:** Some people use hormone therapy; some don't. Neither is more "correct."
**Implications:** No screen, field, or notification may default to assuming HRT use. Medication/care modules are opt-in during onboarding (`CARE Setup`, `SCREEN_BIBLE.md` Screen 12).

### PRISM does not assume surgery

**Date:** 2026-09-01
**Status:** Active
**Reason:** Surgery is one possible part of a journey, not a requirement of it.
**Implications:** Procedures and surgery-related milestones are optional, suggested (never required) entries. PRISM never asks about surgical eligibility or readiness.

### PRISM does not assume a binary gender

**Date:** 2026-09-01
**Status:** Active
**Reason:** Nonbinary, gender-fluid, and questioning users are explicitly in scope (`PRODUCT_BIBLE.md` §6).
**Implications:** The `gender` field is free-text/optional, never a binary selector. No feature may branch its behavior on an assumed binary gender.

### PRISM does not require pronouns

**Date:** 2026-09-01
**Status:** Active
**Reason:** A user should never be forced to declare pronouns to use the app.
**Implications:** `pronouns` is nullable in `profiles` and skippable at onboarding (`SCREEN_BIBLE.md` Screen 11).

### PRISM does not require a transition start date

**Date:** 2026-09-01
**Status:** Active
**Reason:** Not every user has, knows, or wants to specify a single start date for their journey.
**Implications:** Journey Date onboarding (`SCREEN_BIBLE.md` Screen 16) always offers "I don't know" / "My journey doesn't have one specific start date" / "Skip," and no default date is ever invented on the user's behalf.

### PRISM does not define a universal transition path

**Date:** 2026-09-01
**Status:** Active
**Reason:** Core principle: there is no single right way to transition, so Prism never prescribes one (`PRODUCT_BIBLE.md` §4).
**Implications:** All suggested content (milestones, categories) is optional and always paired with a "create your own" equivalent.

### PRISM does not use a transition progress score

**Date:** 2026-09-01
**Status:** Active
**Reason:** A percentage or score implies a fixed endpoint that does not exist for every user.
**Implications:** Journey Stage (onboarding) must never render as a progress meter or percentage (`SCREEN_BIBLE.md` Screen 10). No screen anywhere in the product may show a "% transitioned" or equivalent metric.

### PRISM does not define a transition finish line

**Date:** 2026-09-01
**Status:** Active
**Reason:** There is no universal completion state to reach.
**Implications:** No copy, badge, or UI state may communicate "transition completed." This is Non-Negotiable Rule 6 (`MASTER_BUILD_SPEC.md` §31).

## Privacy & Security

### PRISM is private by default

**Date:** 2026-09-01
**Status:** Active
**Reason:** Privacy is foundational, not a premium add-on, given the sensitivity of the data PRISM holds.
**Implications:** Private notifications default to ON at onboarding (`SCREEN_BIBLE.md` Screen 17). The lock screen exposes no user content. See `SECURITY.md` for the full posture.

### Disabled modules hide data rather than deleting it

**Date:** 2026-09-01
**Status:** Active
**Reason:** A user experimenting with what to track should never risk losing data by toggling a module off.
**Implications:** Toggling a module in Customize PRISM changes only what is _surfaced_ (TODAY, CARE, search, Quick Add); the underlying rows are untouched and reappear exactly as they were if the module is re-enabled. This is Non-Negotiable Rule 7 (`MASTER_BUILD_SPEC.md` §31) and must be implemented at the query/filter layer, never via a delete.

### Minimum password length is 8 characters

**Date:** 2026-09-02
**Status:** Active
**Reason:** `MASTER_BUILD_SPEC.md` §17 and `SECURITY.md` §1 specify email + password authentication but do not set a minimum length. This is visible to the user (Sign Up and Reset Password's inline validation error), so it is recorded here rather than left as an undocumented implementation detail, per `BUILD_STATUS.md`'s own rule for implementation-level choices.
**Implications:** `packages/validation`'s `passwordSchema` enforces 8–72 characters client-side; Supabase Auth's own server-side minimum (6 by default) is a backstop, not the enforced policy. No complexity rules (uppercase/symbol requirements) are imposed — PRISM does not sacrifice usability for a false sense of security (`MASTER_BUILD_SPEC.md` §31, Non-Negotiable Rule 12).

### Outside services Prism uses

**Date:** 2026-09-28
**Status:** Superseded (see "Outside services Prism uses: adds PostHog for opt-in anonymous usage").
**Reason:** `SECURITY.md` §6 requires every third-party service that touches user data to be reviewed and named. These are the ones in use as of v0.3.0.
**Decision:**

- **Supabase** (database, auth, storage, Edge Functions): all account data.
- **Resend** (auth email and support requests, sender `no-reply@ttimemedia.org`): email address, auth links, and the text of support requests with any screenshot the person chose to attach.
- **Expo push service** (server push): an opaque device token plus the notification title and body. Reminder text is generic while Private notifications is on. Expo passes the notification to Apple or Google.
- **Expo EAS Update** (app code delivery): no user data.
- **Apple MapKit** (appointment location suggestions, iOS only): the text typed into a Location field, sent by the phone's own MapKit with no Prism key.

The app includes no analytics, crash-reporting or advertising SDKs.
**Implications:** Adding any service to this list needs the same review and an update to the draft privacy policy (`docs/website/prism.html`). As of 2026-09-28 the draft names all of them, including Expo push and the push token.

### Outside services Prism uses: adds PostHog for opt-in anonymous usage

**Date:** 2026-10-06
**Status:** Active
**Reason:** The owner wants to know which screens and features get used. Prism holds health information, so usage counts must carry none of it, and are sent only after a clear yes.
**Decision:** The 2026-09-28 list above stays the same, with one addition: **PostHog Cloud, EU region**. It receives the event names from `lib/analytics/events.ts`, the app version, the platform and OS version, and a random per-install ID.

- **Ask first.** Nothing is sent until the person says yes, either on Today's one-time "Help improve Prism?" card or in Privacy & security. The choice is stored in `appStore.analyticsConsent` (`unasked` / `granted` / `declined`).
- **No SDK.** `lib/analytics/analytics.ts` posts to PostHog's batch HTTP API. The React Native SDK needs native code and captures more than wanted automatically.
- **Only fixed values.** Properties are counts or fixed values, such as a theme key or a support kind, never text the person wrote. Screen names have record IDs replaced with `:id`.
- **Anonymous.** Events are sent with `$process_person_profile: false` and `$geoip_disable: true`, and "Discard client IP data" is on in the PostHog project. The install ID is deleted when analytics is turned off.
- **Development builds send nothing.**

The app still includes no crash-reporting or advertising SDKs.

**Implications:**

- A new event has to be added to `events.ts`, and the privacy policy checked to make sure it still describes it.
- The App Store privacy label changes from "Data Not Collected" to Usage Data → Product Interaction (not linked to identity, not used for tracking).
- Appointments created by calendar import or by suggestions also count as `appointment_added`.

## Personalization (Onboarding)

### Onboarding resumability is driven by an explicit `onboarding_step` column

**Date:** 2026-09-02
**Status:** Active
**Reason:** A user who closes the app mid-onboarding must resume exactly where they left off, not at the beginning. Inferring position from field-completeness doesn't work — a skipped optional field (e.g. Identity's Name, which is optional and often left blank) is indistinguishable from a field the user simply hasn't reached yet.
**Implications:** `profiles.onboarding_step` is written after every onboarding screen's Continue/Skip action, and `app/(onboarding)/_layout.tsx`'s `initialRouteName` resolves from it directly. This is implementation-visible (it determines exactly where a returning user lands) so it's recorded here rather than left as an undocumented schema choice.

### Journey stage is no longer asked

**Date:** 2026-09-24
**Status:** Active
**Reason:** Not recorded when the screen was removed (commit `e86f65a`). _Product owner: add the reason here._
**Implications:** The Journey Stage onboarding screen is removed; anyone whose saved progress pointed at it resumes at Identity. `profiles.journey_stage` stays in the schema, unused, and is still included in data export.

### App Lock is turned on only from YOU, never during onboarding

**Date:** 2026-09-03
**Status:** Active (amends "App Lock and Biometrics default off; Private notifications defaults on")
**Reason:** Onboarding could save `app_lock_enabled = true` without a PIN ever being set. That would have locked the person out with no way to recover.
**Implications:** Privacy Setup no longer shows App Lock or Biometrics. YOU → App Lock requires a PIN before the switch can turn on, and tests assert that onboarding never writes either field.

### Care Setup's raw selection is not persisted — only its module-enablement effect is

**Date:** 2026-09-02
**Status:** Active
**Reason:** Screen 12 (Care Setup)'s multi-select (hormones, medication, patches, gel/cream, blockers, injections, surgery, other, none) exists to decide which modules to enable, not as a fact worth storing in its own right — storing it separately from the `modules` table it drives would create a second source of truth that can drift.
**Implications:** `careSetupImpliesMedication`/`careSetupImpliesInjection` (`packages/types/src/onboarding.ts`) map the selection directly onto enabling the `medications`/`injections` modules at submit time. A user resuming onboarding partway through reconstructs an equivalent signal from which modules are already enabled (`careSetupSignalFromModules()`, `lib/onboarding/careSetupSignal.ts`) rather than from a stored raw answer, so `getNextOnboardingStep`'s branching still works correctly on resume.

### Appointment Setup is gated by the Intent screen, not by Care Setup

**Date:** 2026-09-02
**Status:** Active
**Reason:** Screen 15 (Appointment Setup)'s own stated condition — "only shown if appointment tracking was selected" — has no corresponding option in Care Setup's option list (Screen 12), which is entirely about medication-family tracking. The only earlier screen that actually offers an "appointments" option is Screen 09 (Intent, "What Brings You Here?"), so that is the selection the condition must refer to.
**Implications:** `intentImpliesAppointments()` checks `profiles.intent` (not Care Setup) to decide whether Appointment Setup appears in the onboarding sequence. Recorded here since it resolves a real ambiguity in the source screens rather than restating an explicit spec instruction.

### App Lock and Biometrics default off; Private notifications defaults on

**Date:** 2026-09-02
**Status:** Active
**Reason:** "PRISM is private by default" (see above) already establishes private notifications as an on-by-default protection users shouldn't have to discover. App Lock and Biometrics are a different kind of control — an extra authentication step the user must actively choose to accept, not a passive protection — so defaulting them on would add friction to every app open for users who never asked for it.
**Implications:** `privacySetupSchema` (`packages/validation/src/onboarding.ts`) defaults `app_lock_enabled: false`, `biometric_lock: false`, `notification_privacy: true`. This is the concrete, screen-level expression of the existing "private by default" decision plus a genuinely new choice (App Lock/Biometrics off), so it's recorded here rather than left implicit in the Zod schema alone.

## CARE

### "Pause" a medication is expressed via `end_date`, not a new status column

**Date:** 2026-09-02
**Status:** Active
**Reason:** Screen 26 (Medication Detail) specifies a **Pause** action that "preserves history — it does not delete past logs," but the canonical `medications` schema (`MASTER_BUILD_SPEC.md` §18) has no dedicated status/paused column, only `start_date`/`end_date`. Adding an invented column beyond the schema the specification actually defines would go against Foundation's "no invented medical logic beyond what's specified" discipline; the schema already has a field for exactly this concept.
**Decision:** Pausing a medication sets `end_date` to today; Resuming clears it back to `null`. This is functionally identical to how a medication's course naturally ends — "paused" and "ended" share the same representation (an `end_date` in the past), which is a deliberate simplification, not an oversight. `medication_logs` are a separate table keyed by `medication_id`, so pausing never touches historical log rows — the "preserves history" requirement holds automatically.
**Implications:** The Medications list (Screen 24) shows Active and Paused as two sections, based on whether `end_date` is null or in the future — mirroring the existing Upcoming/Past split already used for Appointments (Screen 31), rather than inventing a new pattern. `isMedicationActive()` (`apps/mobile/features/care/medicationDisplay.ts`) is the single place this comparison happens.

### CARE Home shows only enabled modules, sections with real activity first

**Date:** 2026-09-02
**Status:** Active
**Reason:** `SCREEN_BIBLE.md` §CARE Personalization states "a user who only tracks appointments should never be confronted with an empty, oversized medication dashboard." A disabled module's data is also never fetched at all, consistent with the same rule already established for TODAY in Milestone 03 (`docs/DECISIONS.md`'s Personalization section, and `docs/BUILD_STATUS.md` §11).
**Implications:** `CareHomeScreen` reads `useModules()` first and only queries `medications`/`injections`/`appointments` for modules that are actually enabled; sections are then ordered by which one has the most real content, not a fixed order. A user with nothing tracked yet sees the same approved empty state as any other empty collection, never an empty three-section dashboard.

### "Next scheduled event" is not computed — Medications shows the configured schedule instead

**Date:** 2026-09-02
**Status:** Superseded (see CARE: Reminders and next doses run on the phone, 2026-09-03)
**Reason:** Screen 24 (Medications) calls for showing a medication's "Next scheduled event," but no real dose-scheduling-resolution engine exists yet (the same gap already tracked in `docs/BUILD_STATUS.md` Known Technical Risks as blocking TODAY's "medication due today" classification). Inventing a plausible-looking next-occurrence date without a real resolution algorithm would risk showing the user incorrect information about their own medication — worse than not showing it.
**Implications:** `describeFrequency()` (`apps/mobile/features/care/medicationDisplay.ts`) describes the _configured_ recurrence pattern in plain language ("Daily at 08:00", "Every 3 days") — real, stored data, honestly presented — rather than resolving it into a specific next-dose timestamp. Building the real scheduling-resolution engine is deferred to the same future work that resolves the TODAY gap; when it ships, both surfaces should be updated together.

### Reminders and next doses run on the phone

**Date:** 2026-09-03 (extended 2026-09-24)
**Status:** Active
**Reason:** Once a medication's schedule or an appointment's time is known, the phone already knows when a reminder should fire. Local notifications need no server, and no third party sees what is being taken or when. This also unblocks the three surfaces that were waiting on a schedule engine: TODAY's "due today", Medications' "Next dose", and Notification Settings.
**Decision:** `lib/reminders/scheduleResolution.ts` turns `frequency_config` (daily, weekly, every X days) or `starts_at` into concrete local times. `useReminderSync` keeps the phone's scheduled notifications and the `reminders` table in step with each record's `reminder_enabled` flag (one row per `user_id, type, reference_id`). `reminders.recurrence` holds a copy of the medication's `frequency_config` (validated by `frequencyConfigSchema`) and is null for appointments, so it has no shape of its own. Tapping a reminder opens its record. **Done** logs the dose, and **Snooze** repeats the reminder in 10 minutes. One follow-up comes 30 minutes after a missed dose and is cancelled when the dose is logged. Appointment lead time (at the time, 1 hour or 1 day before) is a device setting. Permission is asked for only when something needs it.
**Implications:** Reminders keep working with no network and are never sent through Expo's push service. A second phone schedules its own reminders from the same records. `send-push` has a `reminders` category for server-sent reminders, but nothing on the server decides when one is due, so the app has no switch for them yet.

### An injection is a medication

**Date:** 2026-09-24
**Status:** Active (supersedes the Timeline injection routing under JOURNEY; an injection dose opens its medication's history)
**Reason:** Injections were a separate feature, but an injection is just one way to take a medication. Two places to log the same kind of thing was confusing.
**Implications:** There is no separate Injections feature, switch, tile, or screen. An injectable medication (form "Injection") is logged like any other dose, and asks where it went in (optional), stored as `medication_logs.site`. The migration `20260924120000_merge_injections_into_medications.sql` copies existing `injections` rows into `medication_logs` (attaching any that had no medication to a generic "Injection" medication) and switches Medications on for anyone who had Injections on. The `injections` table is kept, unread, for history and export. Care Setup's "Injections" choice now leads to Medication Setup.

### Supplies and refills, and questions for the doctor

**Date:** 2026-10-07
**Status:** Active
**Reason:** The owner chose these over other ideas as things people would actually use. Running out of a hormone is a real fear, and questions get forgotten in the exam room.
**Decision:**

- **Supplies** (table `supplies`) can be linked to a medication with an amount per dose. A database trigger on `medication_logs` counts the supply down when a dose is logged and back up on Undo, so it works the same from Today, the medication's page or a notification.
- **Supply estimates and reminders.** `lib/care/supplyOutlook.ts` estimates when a supply runs out from the medication's schedule. The reminder sync schedules a reminder a week before that date and a week before the refill date, both at 10:00. They follow Private notifications.
- **Questions** (table `appointment_questions`) belong to an appointment, or to none. A question with none shows on whichever appointment is next. If an appointment is deleted, its questions go back to that pool (`on delete set null`).

**Implications:** Both tables are in the data export and are removed with the account. The privacy policy's list of what Prism keeps includes supplies and questions.

### The "Log a dose" tile on Today became the Euphoria jar

**Date:** 2026-10-07
**Status:** Superseded (see "Today offers only journal and milestone tiles; the Euphoria jar is removed").
**Reason:** The owner didn't like "Log a dose" on Today, and the tile only opened the medications list. Logging stays on the Up next card (View first, Log dose only when due) and on each medication's page.
**Decision:** Today's "Add something" tiles are: Euphoria jar, Add an appointment, Write in my journal, Add a milestone.

- The jar (table `euphoria_moments`, screen `/journey/jar`) saves short good moments, and "Shake the jar" brings back a random one, never the same one twice in a row.
- It's a button, not a physical shake, because shaking the phone already opens "Report a problem".
- It always shows; it isn't a feature you switch on.

**Implications:** Lab levels were discussed for the side menu and set aside for now; the owner wasn't sure how yet. The unused `labs` table is unchanged.

### Today offers only journal and milestone tiles; the Euphoria jar is removed

**Date:** 2026-10-07
**Status:** Active
**Reason:** After trying it, the owner asked for the Euphoria jar and "Add an appointment" to come off Today, and for the jar to be deleted entirely.
**Decision:** Today's "Add something" tiles are "Write in my journal" and "Add a milestone", each shown while its feature is on.

- Appointments are added from Care.
- The jar's screen and code are removed. Migration `20261007130000_drop_euphoria_jar.sql` drops `euphoria_moments` along with anything saved in it.
- The privacy policy no longer mentions the jar.

**Implications:** None for other features. Questions for the doctor and supplies are unaffected.

## JOURNEY

### Timeline's "medications" events are real logged doses, not a predicted schedule

**Date:** 2026-09-02
**Status:** Active
**Reason:** `MASTER_BUILD_SPEC.md` §09 lists medications among Timeline's P0 record types, but a medication itself has no single instant-in-time event — unlike an injection (`injected_at`) or appointment (`starts_at`), it's an ongoing configuration. Inventing a "next dose" timestamp to plot on the timeline would require the same scheduling-resolution engine that doesn't exist yet (see CARE's "Next scheduled event" decision above) — and Timeline is explicitly a _history_, so a predicted future dose doesn't belong on it regardless.
**Implications:** `buildTimelineEvents()` (`apps/mobile/services/journey/timeline.ts`) sources medication events from `medication_logs` — each entry is something that actually happened (completed/skipped/missed), with a real `scheduled_at` timestamp. No log entries yet means no medication events on Timeline yet, which is correct: nothing has happened, so nothing is shown.

### Timeline navigates to the closest real record view when a screen from the source inventory doesn't exist

**Date:** 2026-09-02
**Status:** Superseded (see CARE: An injection is a medication, 2026-09-24; injection doses now open their medication)
**Reason:** Screen 43 (Timeline Event)'s own description gives "Timeline → Injection → Injection Detail" as an example of "tapping an event opens its original record" — but the actual P0 CARE screen inventory (Screens 29-30) has no Injection Detail screen, only Injection History (a list) and Log Injection (a form). This is an internal inconsistency in the source spec, not a deliberate omission to resolve around.
**Implications:** Tapping an injection event on Timeline opens Injection History (`/care/injections`) — the closest real view of that record, rather than a screen that doesn't exist. Every other P0 record type already has a real detail screen (Medication → its history view, Appointment/Milestone/Journal → their own Detail screens), so this substitution is needed only for injections. See `recordHref()` in `apps/mobile/features/journey/screens/TimelineScreen.tsx`.

### Journal entries have no Photo field — the canonical schema doesn't have a column for one

**Date:** 2026-09-02
**Status:** Superseded (see JOURNEY: Milestones and journal entries can carry one private photo, 2026-09-23)
**Reason:** Screen 48 (New Journal Entry) lists "Photo (optional)" among its fields, but the canonical `journal_entries` schema (`MASTER_BUILD_SPEC.md` §09: `id, user_id, title, content, mood, date, tags, created_at, updated_at`) has no photo/image column at all — the same category of gap as CARE's missing medication-status column, resolved the same way: don't invent schema beyond what the spec actually defines.
**Implications:** New/Edit Journal Entry and Journal Entry Detail omit the Photo field entirely rather than adding an unspecified column or wiring up Storage integration beyond what's defined. If a future milestone adds real photo support to Journal, it needs an explicit schema decision first (a `photo_url` or `media_id` column, plus the Storage/RLS policy work that goes with it) — not a client-side-only feature bolted onto a table that has nowhere to persist it.

### Journal's Mood field is free text, not a chip-select mood tracker

**Date:** 2026-09-02
**Status:** Active
**Reason:** `docs/DESIGN_SYSTEM.md` §14 explicitly warns: "Avoid clinical mood trackers, mental-health dashboards, and aggressive mood charts... Mood is optional and must never be a forced rating." The `mood` column itself is a plain nullable string, not an enum — there is no suggested/fixed mood list anywhere in the source material to draw chip options from, and inventing one would risk exactly the clinical-mood-tracker pattern the design system rules out.
**Implications:** Mood is a single free-text input, matching every other CARE/JOURNEY field with no suggested-values list (e.g. Medication's Dosage, Milestone's Category). A future milestone could add mood _suggestions_ as optional pre-fill chips (mirroring Milestone's suggested-titles pattern) without changing the underlying free-text storage — that would stay compatible with this decision; a hard-coded required selector would not.

### Milestones and journal entries can carry one private photo

**Date:** 2026-09-23
**Status:** Active (supersedes "Journal entries have no Photo field")
**Reason:** The earlier decision's only objection was that the schema had nowhere to keep a photo, and it asked for an explicit schema decision first. This is that decision.
**Decision:** `milestones.image_path` and `journal_entries.image_path` hold an object path in the private `memories` bucket (`{user_id}/milestones/…`, `{user_id}/journal/…`). Photos are read through short-lived signed URLs, the same way profile photos are. They are chosen with the system photo picker, which needs no photo-library permission prompt. Replacing, removing or deleting a photo clears the old file, and a failed save cleans up its upload.
**Implications:** The data export lists photo paths, not the image files. Account deletion empties the person's `memories` prefix along with every other private bucket.

### Journal mood and tags offer optional suggestions

**Date:** 2026-09-22
**Status:** Active (extends "Journal's Mood field is free text")
**Reason:** Came out of early tester feedback (commit `6710326`). The earlier decision already allowed optional pre-fill chips as long as storage stayed free text.
**Implications:** Suggested moods and tags are tap-to-fill chips above the same free-text fields. Nothing is required, there is no rating scale, and anything typed is kept as written.

## YOU

### App Lock's PIN is a device-local secret in `expo-secure-store`, never a `settings` column

**Date:** 2026-09-03
**Status:** Active
**Reason:** Screen 60 (App Lock) needs a PIN fallback, but the canonical `settings` schema (`MASTER_BUILD_SPEC.md` §18) has `app_lock_enabled`/`biometric_lock`/`notification_privacy`/`reduced_motion`/`accessibility_preferences` — no PIN column, and none should be added. A PIN is fundamentally different from every other `settings` value: it's a device-local unlock secret, not a synced preference, and syncing it to the database would mean it travels across every device the account is signed into and sits in a table other rows are read from freely — a needless expansion of what a database compromise could expose.
**Decision:** The PIN lives only in `expo-secure-store` (`apps/mobile/lib/you/pinStorage.ts`), namespaced under its own key (`prism_app_lock_pin`), stored directly rather than hashed — SecureStore already provides OS-level encryption-at-rest (Keychain on iOS, Keystore on Android), the same guarantee a client-side hash would only approximate. `settings.app_lock_enabled`/`biometric_lock` (real, existing columns) hold whether the feature is on and which unlock method is preferred; the PIN itself never leaves the device.
**Implications:** A PIN set on one device does not carry over to a reinstall or a second device — the user sets a new one, which is the expected behavior for a device-local secret (identical to how a phone's own passcode works). Enabling App Lock without an existing PIN prompts to set one first (`AppLockSettingsScreen`); there is no server-side "forgot PIN" recovery, since the server never had it to recover.

### Notification Settings offers only "Private notifications" — every reminder-category toggle needs a delivery engine that doesn't exist yet

**Date:** 2026-09-03
**Status:** Superseded (see YOU: Notification Settings covers real reminders and opt-in messages from Prism, 2026-09-24)
**Reason:** Screen 58 lists Medication/Injection/Appointment/Lab/Custom reminders as independently configurable, but no notification-scheduling or delivery engine exists anywhere in PRISM yet (no push registration, no local-notification scheduling tied to `medications.reminder_enabled`/`appointments.reminder_enabled`, no `reminders` table writes from any screen). Building toggles for reminder categories that cannot actually deliver a reminder would be exactly the fake-control pattern ruled out project-wide (see CARE's "Next scheduled event" decision) — a toggle that visibly does nothing is worse than no toggle.
**Decision:** Notification Settings (and Privacy's own "Notifications" section) expose only "Private notifications" (`settings.notification_privacy`, a real column, already defaulting to `true` per `docs/SECURITY.md` §7), plus plain-language copy explaining that per-category reminders aren't available yet.
**Implications:** Each existing per-item `reminder_enabled` field (Medication, Appointment) still exists and is still collected on their own Add/Edit forms — those are honest, real booleans about the record, just not yet wired to an actual notification. When a real delivery engine ships, Screen 58's full per-category toggle list becomes buildable without any schema change (`reminders.notification_style` already exists per `MASTER_BUILD_SPEC.md` §18).

### Module Configuration only offers settings with a real, wired effect

**Date:** 2026-09-03
**Status:** Active
**Reason:** Screen 57 gives illustrative examples — Medication (Enabled, Reminder behavior), Journal (Enabled, Mood tracking, Photos), Memories (Enabled, Timeline integration) — but Memories is P1 (no screens yet), Journal has no Photo field at all (see JOURNEY's own decision above), and Injections/Milestones have no per-item reminder field to default.
**Decision:** `ModuleConfigScreen` offers exactly three real settings, gated per module: Enabled (every module, backed by the existing `modules.enabled` column), "Default reminders on for new items" for Medications/Appointments only (`modules.configuration.default_reminder_enabled` — seeds the `reminder_enabled` default on `AddMedicationScreen`/`AddAppointmentScreen`, a genuine behavioral effect), and "Mood tracking" for Journal only (`modules.configuration.mood_tracking_enabled` — actually shows/hides `JournalEntryForm`'s Mood field). No Photos toggle (Journal), no Timeline-integration toggle (Memories, P1) — there is nothing real behind either yet.
**Implications:** `modules.configuration` (already a JSONB column, no schema change needed) now holds these two keys for exactly the two modules that use them. Extending Module Configuration in a future milestone (e.g. once Memories ships) means adding a new configuration key with a real effect, not a placeholder.

### Profile photo: a real upload to the existing private `profile-photos` bucket, addressed by object path, not a public URL

**Date:** 2026-09-03
**Status:** Active
**Reason:** The `profile-photos` storage bucket and its per-user RLS policies have existed since Foundation (`supabase/migrations/…_storage_buckets_and_policies.sql`) but were never wired to any screen. The bucket is private (`docs/SECURITY.md` §5: "never public buckets for sensitive PRISM information"), so a permanent public URL isn't available to store — only a signed URL, which expires.
**Decision:** `EditProfileScreen` uses `expo-image-picker` (new dependency) to pick a photo and uploads it to `{user_id}/profile.<ext>` in `profile-photos` (`apps/mobile/lib/you/profilePhoto.ts`). `profiles.profile_photo_url` stores that bucket object path, not a URL; `useSignedProfilePhotoUrl()` resolves a fresh 1-hour signed URL on read wherever the photo is displayed. `packages/validation/src/profile.ts`'s `profileUpdateSchema` was relaxed from `z.string().url()` to a plain non-empty string to match what the column actually holds now.
**Implications:** Any future reader of `profile_photo_url` must resolve it through Storage (`createSignedUrl`), never treat it as a directly-usable `<img src>`/`Image source` URL. Re-uploading a photo overwrites the same object path (`upsert: true`), so a user only ever has one stored profile photo at a time — consistent with the field being singular.

### Delete Account is real, working UI up to the one boundary only a server can cross

**Date:** 2026-09-03
**Status:** Superseded (see YOU: Account deletion runs through the deployed delete-account Edge Function, 2026-09-23)
**Reason:** Deleting a `auth.users` row requires the Supabase service-role key (or equivalent admin API access), which must never ship inside the mobile app (`docs/SECURITY.md` §14-15). No Supabase Edge Function exists yet (`supabase/functions/README.md` — "None exist yet"), so there is currently no safe way for the client to actually delete an account.
**Decision:** `DeleteAccountScreen` is fully built — heading, plain-language consequences, a type-to-confirm ("DELETE") gate before the destructive button is enabled — and calls `supabase.functions.invoke('delete-account')`. Since that function isn't deployed, the call fails and the screen surfaces the same honest, non-technical error every other PRISM failure uses ("Couldn't delete your account. Please try again later.") rather than a fabricated success.
**Implications:** A future milestone (or a backend-focused one) must add the `delete-account` Edge Function itself before this screen's primary action can succeed — tracked in `supabase/functions/README.md`. Nothing about the client changes when that ships; this is a real, complete UI blocked on real, documented server-side work, not a placeholder.

### Accessibility, About, and Support show what's real; nothing is faked to fill out the spec's full field list

**Date:** 2026-09-03
**Status:** Active, amended 2026-09-28: Support's Contact support, Report a problem and Privacy concern rows now open a draft email to `support@ttimemedia.org`, the address published on the Prism page. The draft carries the topic, app version and platform only. Help center is still "not connected yet".
**Reason:** Three Screen Bible entries describe more than PRISM currently has a real answer for: Screen 61 (Accessibility) lists Text size / Increased contrast / Screen reader optimizations alongside Reduced motion, but only Reduced motion has a `settings` column and an actual code path (`ReducedMotionProvider`) that changes behavior; Screen 65 (About) calls for Privacy Policy / Terms / open-source acknowledgements, none of which have been published anywhere; Screen 66 (Support) calls for Help center / Contact support / Report a problem / Privacy concern, and no support email, ticketing system, or help-center URL has been established anywhere in the source material — inventing one (e.g. a `mailto:` address) would fabricate an organizational detail nobody specified.
**Decision:** Accessibility ships only the Reduced motion toggle as an interactive control, with plain-language copy explaining that text size already follows the OS setting (default React Native font-scaling behavior, never overridden) and that every PRISM control already carries real accessibility labels/roles. About shows Privacy Policy/Terms/acknowledgements as informational rows marked "Not yet published"/"Not yet compiled" rather than linking anywhere. Support's four rows are real, themed, tappable list items that surface an honest "This isn't connected yet" toast rather than opening a fabricated link or address.
**Implications:** When a real contrast mode, a published legal page, or a live support channel exists, each becomes a normal wiring task — swap the static row for a real link/toggle. Until then, nothing on these three screens claims to do something it can't.

### Support is answered in the app; legal pages live on the website

**Date:** 2026-10-05
**Status:** Active. Supersedes the About and Support parts of the 2026-09-03 decision above.
**Reason:** The owner asked for Support and About to work the way other apps do: real forms instead of email drafts, a real Help center, shake to report, and properly published legal pages.
**Decision:**

- **Support forms.** Contact support, Report a problem and Privacy concern are in-app forms. The `submit-support` Edge Function saves each one to `support_requests` (RLS: insert and read your own, no edits) and emails it to support@ttimemedia.org through Resend, Reply-To the sender's account email, so support answers by replying. At most 10 a person an hour. Chosen over a helpdesk service (Zendesk, Intercom, Help Scout) so no new company receives tester data.
- **Shake to report.** Shaking the phone (two jolts over 2.4 g within 600 ms) opens Report a problem with a screenshot of the screen. The screenshot is shown, and attached only if the person turns that on, because screens show medications. It is stored in the private `attachments` bucket under `{user_id}/support/`, so account deletion removes it. On by default, with a switch in Support. Needs `expo-sensors` (motion permission off: the accelerometer needs none) and `react-native-view-shot`, so 0.3.3 is a new build.
- **Help center.** Articles ship inside the app (`lib/you/helpArticles.ts`): searchable, readable offline, updated over the air. Each ends with Contact support. When a feature changes, its article changes in the same commit.
- **Legal pages.** The Privacy Policy (`docs/website/prism.html` → /prism) and Terms of Service (`docs/website/prism-terms.html` → /prism-terms) are web pages opened inside Prism, so updating them never needs an app update and they match what the App Store links to. Open-source acknowledgements are generated from the app's dependencies by `scripts/generate-acknowledgements.mjs` and shown in the app.
- **Forgot PIN.** The lock screen offers "Forgot your PIN?": it turns App Lock off for the account, forgets the phone's PIN and signs out. Getting back in needs the email and password, so it never bypasses the lock.

**Implications:** Resend now also carries support messages, and the privacy policy says so. The Terms of Service are a draft for legal review before launch; they name no governing law yet. The function needs the `RESEND_API_KEY` secret. Run the acknowledgements script after changing dependencies.

### Journal entries and milestones hold up to five photos

**Date:** 2026-10-05
**Status:** Active
**Reason:** The owner asked for more than one photo per entry (at most 5), shown on the Timeline as small bubbles.
**Decision:** `image_paths text[]` (at most 5, enforced in the database and in `@prism/validation`) on `milestones` and `journal_entries`. `image_path` stays, always equal to the first photo, so builds from before this change keep working. A trigger (`sync_entry_image_paths`) keeps the two in step whichever one a build writes. Saving uploads new photos first, writes the row, and only then deletes removed photos; a failed save removes the new uploads and loses no saved photo (`saveWithPhotos`). The Timeline shows the photos as overlapping round bubbles that spring in (still with reduced motion), and entry screens show a swipeable gallery.
**Implications:** Deploy the migration (`20261005130000_entry_photos.sql`) before any app version that writes `image_paths`. An older build editing a multi-photo entry's photo replaces the list with its one photo, which is acceptable while testers update.

### Fifteen hand-checked color themes replace the eight palettes

**Date:** 2026-10-06
**Status:** Active
**Reason:** The owner supplied a new theme system (`themes.ts` / `themes.css`, generated outside this repo): fifteen themes, each a full set of semantic tokens for light and dark with contrast checked by script, and asked for it to replace the eight palettes, keeping all fifteen and every theme free for now.
**Decision:**

- `packages/ui/src/tokens/themes.ts` is the source of every theme's colors. One change from the supplied file: Coral reef's light accent moved from #D44A2E to #D06A35 (text #A9501F), because the original read as an error red. It still meets every contrast rule.
- `palettes.ts` turns a theme into what screens read: grounds, text and borders, plus five role colors. Prism keeps its five-color spectrum; every other theme is single-color by design, so its roles use its two accents, and feature tiles use the theme's subtle accent shades so text on them stays readable (checked for all 30 theme and mode pairs in `lib/__tests__/themes.test.ts`). Status colors (success, warning) are used only for status: the toast and the offline banner.
- The default theme is Prism. Saved themes from the old set are read as the closest new theme (slate → Midnight ink, mist → Mono, ocean → Tidepool, forest → Moss, blossom → Rosewater). The database default for new accounts is now 'prism' (migration `20261006120000_theme_default.sql`).
- The free / PRISM+ tag is kept in the theme data but does nothing yet: every theme is available.
- The eight app icons keep their names; they are chosen separately from the theme.

**Implications:** Headings take their typeface from the theme (`theme.fonts.display`): Sora, or the phone's own serif (Georgia on iOS) for Paper, so no font file ships. Brand wordmarks and initials stay in Sora. `docs/design/themes.css` holds the web version for reference. The launch screen background is now Prism's (#F8F8FA light, #0B0B0F dark), from the next build.

### The App Lock Screen (78) is a global overlay from the root layout, not a route

**Date:** 2026-09-03
**Status:** Active
**Reason:** Screen 78 must appear over whatever the user was doing the moment the app is locked (any tab, any nested screen) and disappear back into that exact state on unlock — routing to a dedicated screen would require capturing and restoring the prior navigation state, an unnecessary complication for something that is fundamentally "cover the screen, then uncover it."
**Decision:** `AppLockScreen` is rendered conditionally inside `app/_layout.tsx`'s `RootNavigator`, absolutely positioned over the entire `<Stack>`, driven by `useAppLockStore` (a new, deliberately non-persisted Zustand store — "is currently locked" must reset to `true` on every fresh process start) and `useAppLockGate()` (locks on first mount when App Lock is enabled, and again whenever `AppState` leaves `'active'`).
**Implications:** Unlocking never triggers a navigation — the underlying `<Stack>` was never unmounted, so the user resumes on the exact screen they were viewing when the app was backgrounded. Any future screen that needs "cover everything, resume exactly where you were" behavior (e.g. a future biometric re-auth for a single sensitive action) should follow the same overlay-not-route pattern rather than introducing a new one.

### Notification Settings covers real reminders and opt-in messages from Prism

**Date:** 2026-09-24
**Status:** Active (supersedes "Notification Settings offers only Private notifications")
**Reason:** Reminders now exist (see CARE), and server push was added for messages that can't be scheduled on the phone.
**Decision:** Notification Settings shows whether the phone allows notifications, with a way to turn them on. It also has Private notifications, a test reminder, and **Messages from Prism**, stored in `settings.push_preferences`: security alerts are on by default, and nudges and Prism news are opt-in. **Reminder wording** lets each person pick built-in wording per kind ("It's shot day.", "Take your {name} at {time}.") or write their own, previewed on their own medications. That wording is used only while Private notifications is off. The push provider is Expo's push service (see "Outside services Prism uses" under Privacy & Security).
**Implications:** Push tokens live in `push_tokens` (RLS, own rows only) and are removed on sign-out. `send-push` is the only sender and requires a shared secret. It applies the same privacy rule as the phone: reminders stay "Your Prism reminder is ready." while Private notifications is on.

### Account deletion runs through the deployed delete-account Edge Function

**Date:** 2026-09-23
**Status:** Active (supersedes "Delete Account is real, working UI up to the one boundary only a server can cross")
**Reason:** The client UI was complete; only the server side was missing.
**Implications:** `delete-account` is deployed to the hosted project. It identifies the caller from their own JWT, empties their prefixes in every private bucket (including subfolders such as `milestones/` and `journal/`), then deletes the `auth.users` row, which cascades to every table. Verified end to end on 2026-09-28 (see `docs/BETA.md` §1d).

### Colour is a whole-app palette saved to the account and never labelled by gender

**Date:** 2026-09-24
**Status:** Active
**Reason:** Replaces the single accent colour from 2026-09-23 with palettes that recolour the whole app. Colour choices in this space are easily read as gender signals, so none is framed that way.
**Decision:** Eight palettes (Slate, Mist, Prism, Ocean, Forest, Ember, Dusk, Blossom) recolour accents, icon chips, timeline dots and backgrounds in light and dark mode. The choice is saved in `settings.palette` and offered in Appearance and as an onboarding step. New accounts start on Slate; accounts that existed before palettes keep Prism.
**Implications:** No palette name or description refers to gender. Theme and palette sync across devices through `useAppearanceSync`.

### Calendar access is opt-in and asked for only on tap

**Date:** 2026-09-22 (import added 2026-09-24)
**Status:** Active
**Decision:** When calendar sync is on (`settings.calendar_sync_enabled`), appointments can be added to the phone's calendar. Appointments can also be imported from the calendar or from an `.ics` file. Read access is requested only when the person taps Import. Files are parsed on the phone, and nothing is added until the person confirms. Prism never asks for Reminders access.
**Implications:** Calendar events written by Prism can be read by anything else that has access to that calendar.

## Product Structure

### The primary navigation is TODAY / CARE / JOURNEY / YOU

**Date:** 2026-09-01
**Status:** Active
**Reason:** Four destinations with distinct, non-overlapping jobs give the product a stable structure without over-fragmenting it.
**Implications:** No additional primary tab may be added without intentionally revising this specification (`MASTER_BUILD_SPEC.md` §04).

### JOURNEY is about story and reflection

**Date:** 2026-09-01
**Status:** Active
**Reason:** Distinguishes JOURNEY's emotional/narrative role from CARE's organizational role.
**Implications:** JOURNEY uses "Personal mode" visual density (larger spacing, visual storytelling — `DESIGN_SYSTEM.md` §27) and more expressive visual treatment than CARE.

### CARE is about organization

**Date:** 2026-09-01
**Status:** Active
**Reason:** CARE exists to organize logistics (medications, appointments, labs), not to editorialize them.
**Implications:** CARE uses "Administrative mode" visual density — higher density, efficient scanning — while remaining explicitly non-clinical in tone (`DESIGN_SYSTEM.md` §19).

### TODAY is about relevance

**Date:** 2026-09-01
**Status:** Active
**Reason:** TODAY's entire purpose is answering "what matters to me right now," not surfacing every record.
**Implications:** TODAY is generated by the personalization engine (`TECHNICAL_BIBLE.md` §10), never a static or manually-curated list. An empty TODAY is a valid, expected state — content is never manufactured to fill it.

### YOU is about control

**Date:** 2026-09-01
**Status:** Active
**Reason:** Identity, customization, privacy, and account management belong together as the place the user governs the product's behavior.
**Implications:** YOU is intentionally "quieter" visually (`DESIGN_SYSTEM.md` §21) and logically grouped rather than an endless flat settings list.

## Boundaries

### PRISM is not a medical provider

**Date:** 2026-09-01
**Status:** Active
**Reason:** PRISM organizes and documents; it does not diagnose, prescribe, or treat.
**Implications:** No feature may present PRISM as a source of medical authority. See "PRISM does not provide medical advice" below and `SECURITY.md` §21 for the related compliance-claim restriction.

### PRISM does not provide medical advice

**Date:** 2026-09-01
**Status:** Active
**Reason:** Users may enter and view their own dosage, lab, and procedure information, but PRISM must never recommend doses, calculate hormone dosage, suggest dosage changes, judge whether a dose is appropriate, interpret lab results, or determine surgical/legal readiness.
**Implications:** This boundary applies to every layer, including any future AI assistant (`MASTER_BUILD_SPEC.md` §26 AI Strategy) — an assistant may help a user find their _own_ recorded information, but must refuse questions that require a medical judgment.

## Product Discipline

### PRISM should not become a social network

**Date:** 2026-09-01
**Status:** Active
**Reason:** Public profiles, follower counts, and feeds would work against PRISM's private-by-default identity and its focus on the individual's own journey.
**Implications:** Community is explicitly excluded from V1 and is not planned as a default direction for V2 either; it would require a deliberate, separately-evaluated decision to revisit (`PRODUCT_BIBLE.md` §14).

### PRISM should not monetize by selling user data

**Date:** 2026-09-01
**Status:** Active
**Reason:** Selling transition/health/identity data would be fundamentally incompatible with PRISM's privacy commitments.
**Implications:** The business model (free core + optional PRISM+ premium features) must never depend on data sale, ad targeting based on transition/health status, or any other monetization of sensitive data (`SECURITY.md` §18).

### AI should not be the center of the product

**Date:** 2026-09-01
**Status:** Active
**Reason:** PRISM's value is the personalized organization and documentation system itself, not a chatbot layered on top of it.
**Implications:** Any future PRISM Assistant is optional, V2-scoped, and strictly limited to helping users navigate their own recorded data — never medical decision-making (`MASTER_BUILD_SPEC.md` §26).

---

## Contradictions Requiring a Product Decision

The following were found while cross-referencing the five source sections (Product Bible, Technical Bible, Screen Bible, Design System, Master Build Specification) against each other. They are **not** silently resolved — a product owner should make an explicit call before or during MVP implementation.

### RESOLVED — MVP scope conflict: Labs, Procedures, and Legal Journey

**Date flagged:** 2026-09-01
**Date resolved:** 2026-09-01
**Status:** Resolved — explicit product-owner decision
**Conflict (as originally found):**

- The source Master Build Specification's P0/MVP list (its §57, reflected loosely in `MASTER_BUILD_SPEC.md` §24) included **"basic labs"** and **"procedures"** under CARE, and **"basic legal journey"** under an "Additional" heading — implying all three were part of the MVP.
- The source Screen Bible's explicit screen-by-screen MVP priority (its §99, preserved verbatim in `SCREEN_BIBLE.md` §14) put the **entire Labs, Procedures, and Legal Journey feature sets in P1 ("shortly after MVP")** — not P0.
- The source Product Bible's own MVP list (its §53) included "Basic labs" under Care but did **not** mention Procedures or Legal Journey at all in its P0 description — partially agreeing with each side.
  **Resolution (product-owner decision, 2026-09-01):** Labs, Procedures, and Legal Journey are **P1** — not part of MVP. This confirms the Screen Bible's screen-level breakdown as correct and supersedes the narrative "basic labs / procedures / basic legal journey" wording that appeared under MVP in the source Master Build Specification and Product Bible. The full, explicit P0/P1 split adopted is recorded in the next entry below.
  **Implications:** `MASTER_BUILD_SPEC.md` §24, §25, and §29, `SCREEN_BIBLE.md` §14, and `PRODUCT_BIBLE.md` §13 have been updated to agree exactly with this resolution. See `docs/BUILD_STATUS.md` for the current build-tracking view of P0 vs. P1.

### RESOLVED — Full MVP (P0) / next-release (P1) scope, adopted 2026-09-01

**Date:** 2026-09-01
**Status:** Active
**Reason:** Following the resolution above, the product owner set the complete MVP boundary explicitly, rather than leaving it to be inferred from inconsistent narrative text across source sections.
**Decision — MVP / P0:** Authentication; Onboarding; Personalization; TODAY; Medications; Medication reminders/logging; Injections; Appointments; Timeline; Milestones; Journal; Customize PRISM; Privacy; Notifications; App lock; Accessibility; Data export; Account deletion.
**Decision — P1 (next release):** Labs; Procedures; Legal Journey; Memories; Documents; Universal Search; Advanced recurring schedules; Supply tracking; Enhanced journal functionality.
**Implications:**

- Timeline, Milestones, and Journal are P0 even though Memories (the fourth JOURNEY sub-feature) is P1 — JOURNEY ships in MVP with three of its four sub-areas.
- The `modules` table, full 15-table schema, and Timeline's architecture (§`MASTER_BUILD_SPEC.md` §18, §09) are **not** reduced to match P0 — the schema and storage architecture continue to anticipate all P1 features (per explicit instruction: do not remove P1 features from the architecture). Only the _user-facing surface_ (screens, module toggles, Quick Add options) is scoped to P0 for the initial build.
- "Advanced recurring schedules" being P1 implies MVP's `medications.frequency_type` supports `daily`, `weekly`, and `every_x_days` fully; `custom` recurrence patterns beyond those are a P1 refinement, not blocked from existing as a schema value.
- "Enhanced journal functionality" being P1 means the P0 Journal is the version already specified (title, content, mood, tags, photo) — richer functionality (e.g. prompts, advanced formatting) is deferred, not the base feature.
- This decision supersedes the "Version 1.1 Scope" section of `MASTER_BUILD_SPEC.md` as previously written where the two lists diverged; `MASTER_BUILD_SPEC.md` §25 has been updated to match this entry exactly.

### RESOLVED — Customize PRISM and Quick Add expose only P0 modules until P1 ships

**Date:** 2026-09-01
**Status:** Active
**Reason:** The P0/P1 split above creates a scoping question the source material never had to answer: Customize PRISM (§`SCREEN_BIBLE.md` Screen 56) and the Quick Add sheet (Screen 21) both enumerate all ten module keys, including the five now deferred to P1 (labs, procedures, legal, documents, memories). Shipping MVP with visible toggles or Quick Add options for modules that have no corresponding screens would dead-end the user — a real implementation-blocking ambiguity if left unresolved, not just a cosmetic detail.
**Decision:** In the MVP build, Customize PRISM and Quick Add present only the five P0 module keys (`medications`, `injections`, `appointments`, `milestones`, `journal`). The remaining five module keys (`labs`, `procedures`, `legal`, `documents`, `memories`) still exist in the `modules` table schema and are still valid `module_key` values — the architecture anticipates them — but the UI simply does not yet offer them, consistent with progressive disclosure (`TECHNICAL_BIBLE.md` §3, Principle 5) and "do not overbuild" (`MASTER_BUILD_SPEC.md` Appendix A, Rule G). No "coming soon" placeholders are shown; the module is added to the toggle list and Quick Add sheet in the same release its screens ship.
**Implications:** Timeline (P0) aggregates only P0 record types (medications, injections, appointments, milestones, journal entries) until P1 ships, since a module with no data source contributes nothing to the unified view — this requires no special-casing, since Timeline already pulls only from enabled modules. `SCREEN_BIBLE.md` Screen 56 and Screen 21, and `MASTER_BUILD_SPEC.md` §10 and §13, have been updated with this clarification.

### RESOLVED — `settings` table primary key

**Date flagged:** 2026-09-01
**Status:** Resolved (minor/technical, not a product-level contradiction)
**Conflict:** The Technical Bible's schema for `settings` uses `user_id UUID PRIMARY KEY` as the sole key. The Master Build Specification's schema for the same table lists both `id UUID PRIMARY KEY` and `user_id UUID PRIMARY KEY`, which is not valid as written (a table cannot have two independent primary keys) and would also allow multiple settings rows per user if "fixed" by adding a surrogate `id`.
**Resolution:** `user_id` is the sole primary key of `settings` (one row per user), matching the Technical Bible and the invariant the rest of the specification assumes (e.g. "Load Module Configuration" in the user lifecycle expects exactly one settings row). Documented in `MASTER_BUILD_SPEC.md` §18.

---

## Adding New Decisions

When a new explicit product decision is made, append it to the relevant section above (or add a new section) using the same `Decision / Date / Status / Reason / Implications` format. Do not silently edit or remove a past decision's entry — if a decision changes, add a new entry referencing the old one and mark the old one's Status as `Superseded (see [new entry]).`
