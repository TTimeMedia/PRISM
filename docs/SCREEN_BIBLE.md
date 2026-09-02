# PRISM Screen Bible

Version: 1.0
Status: Implementation specification
Tagline: Your journey. Your way.

This is the authoritative reference for PRISM's application interface: every screen, its purpose, and its behavior. It assumes the product intent defined in [`PRODUCT_BIBLE.md`](./PRODUCT_BIBLE.md) and the visual system defined in [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md). Per-screen entries below state only what is _distinctive_ to that screen; every screen also inherits the **Global Screen Contract** (§3–§16) — repeating that contract 78 times would bury the requirements that actually differ per screen.

---

## 1. Screen System

PRISM is organized into four primary areas: **TODAY / CARE / JOURNEY / YOU**, plus global actions available throughout the app: **+ (Quick Add), Search, Notifications, Back, Close, Save, Edit, Delete.** The application uses native platform conventions wherever they improve usability.

## 2. Screen Inventory

**Authentication (7):** Splash · Welcome · Sign Up · Sign In · Forgot Password · Reset Password · Email Verification

**Onboarding (12):** Philosophy · What Brings You Here? · Journey Stage · Identity · Care Setup · Medication Setup · Injection Setup · Appointment Setup · Journey Date · Privacy Setup · Building PRISM · PRISM Ready

**TODAY (3):** Today · Quick Add · Notifications

**CARE (18):** Care Home · Medications · Add Medication · Medication Detail · Edit Medication · Medication Log · Injection History · Log Injection · Appointments · Add Appointment · Appointment Detail · Edit Appointment · Labs · Add Lab · Lab Detail · Procedures · Add Procedure · Procedure Detail

**JOURNEY (12):** Journey Home · Timeline · Timeline Event · Milestones · Add Milestone · Milestone Detail · Journal · New Journal Entry · Journal Entry Detail · Memories · Add Memory · Memory Detail

**YOU (19):** You · Profile · Edit Profile · Customize PRISM · Module Configuration · Notification Settings · Privacy · App Lock · Accessibility · Appearance · Data & Export · Delete Account · About · Support · Legal Journey · Legal Item Detail · Documents · Add Document · Document Detail

**Global (7):** Search · Search Results · Confirmation Modal · Delete Confirmation · Error State · Offline State · App Lock Screen

**Total: 78 screens.**

## 3. Global Screen Contract

Every screen in this inventory inherits the following unless a per-screen entry overrides it.

**Design rules (from the source Screen Bible §3):**

- **One primary action** — each screen has one obvious primary action.
- **Progressive disclosure** — never overwhelm the user with every possible field at once.
- **User control** — optional information can always be skipped.
- **No assumptions** — never assume identity, medical treatment, goals, or transition status.
- **No judgment** — never use language implying failure.
- **Privacy** — sensitive information never appears unnecessarily.

**Navigation:** native back gesture and Android back are supported everywhere; forms prompt before abandoning unsaved changes; tab switching preserves each tab's navigation state.

**Forms:** clear labels (never placeholder-as-label), helpful placeholders, inline validation and error messages, keyboard-aware layout, an explicit save action, and clear cancel/back behavior. Date/time fields use platform-native pickers, display in the user's locale, and store to the schema's timezone rules (see [`TECHNICAL_BIBLE.md`](./TECHNICAL_BIBLE.md) §Timezone handling).

**Loading state:** skeletons, progress indicators, or contextual loading text — never a blank screen, and never animate more than necessary.

**Empty state:** every collection has a human, non-clinical empty state, e.g. _"No medications yet. Add one whenever you're ready."_ (Medications) · _"Your story starts wherever you decide."_ (Milestones) · _"Nothing here yet. That's okay."_ (Journal) · _"Save the moments that matter to you."_ (Memories).

**Error state:** generic, calm, and non-technical — _"Something went wrong. Your information wasn't changed."_ — with **Try again** and **Go back**/**Contact support** actions. Raw backend errors are never exposed (see [`PRODUCT_BIBLE.md`](./PRODUCT_BIBLE.md) §Error Philosophy).

**Offline state:** a banner — _"You're offline."_ — plus, where changes can be queued, _"Your changes will sync when you're back online."_ Supported offline actions remain usable.

**Destructive actions** (delete record, delete document, delete memory, delete journal entry, delete account): require explicit confirmation via the Delete Confirmation screen/modal, and are visually and behaviorally distinct from non-destructive actions. Account deletion requires stronger confirmation than a single tap (see Screen 64).

**Accessibility:** every screen supports dynamic text sizing, VoiceOver/TalkBack, high contrast, reduced motion, large touch targets, clear focus order, and non-color status indicators. Full requirements are in [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) §Accessibility and [`TECHNICAL_BIBLE.md`](./TECHNICAL_BIBLE.md) §Accessibility Architecture.

**Privacy:** no screen puts sensitive content (medication details, journal text, gender/pronouns, legal status) into lock-screen notification previews, analytics events, crash reports, URLs, or debugging screenshots. The App Lock Screen in particular displays no user information. See [`SECURITY.md`](./SECURITY.md).

**Personalization:** a screen only surfaces content for modules the user has enabled (see [`PRODUCT_BIBLE.md`](./PRODUCT_BIBLE.md) §Personalization Philosophy); disabling a module hides its content but never deletes the underlying data (see [`DECISIONS.md`](./DECISIONS.md)).

---

## 4. Authentication

### Screen 01 — Splash

**Purpose:** establish PRISM's identity on cold start.
**Content:** centered "PRISM," tagline "Your journey. Your way.," subtle light/prism animation.
**Behavior:** displays briefly while the app initializes, then routes — authenticated → Today; unauthenticated → Welcome; incomplete onboarding → resume onboarding at the correct step.

### Screen 02 — Welcome

**Purpose:** first impression for a new/unauthenticated user.
**Content:** "Welcome to PRISM." / "A private space built around your journey—not someone else's idea of what your journey should look like."
**Actions:** **Get started** → Sign Up; **I already have an account** → Sign In.

### Screen 03 — Sign Up

**Fields:** Email, Password, Confirm password.
**Actions:** **Create account** (primary); **Sign in** (secondary, → Sign In).
**Content:** visible, non-buried legal line — "By continuing, you agree to PRISM's Terms and Privacy Policy."
**Exit:** success → Email Verification.

### Screen 04 — Sign In

**Fields:** Email, Password.
**Actions:** **Sign in**; **Forgot password?** → Forgot Password; **Create account** → Sign Up.
**Exit:** success → Today (or resume onboarding if incomplete).

### Screen 05 — Forgot Password

**Fields:** Email. **Action:** **Send reset link**.
**Content:** _"If an account exists for this email, we'll send instructions to reset your password."_ — deliberately avoids confirming whether the email exists (enumeration protection).

### Screen 06 — Reset Password

**Fields:** New password, Confirm password. **Action:** **Reset password.**

### Screen 07 — Email Verification

**Content:** "Check your email." / "We sent a verification link to your email address."
**Actions:** **Open email**, **Resend email**, **Change email**.

---

## 5. Onboarding

Onboarding is sequential but every non-essential step is skippable, and the whole flow can be resumed if interrupted (see Splash behavior). No step displays a numeric transition-progress meter.

### Screen 08 — Philosophy

**Content:** "There's no right way to transition." + the PRISM Manifesto (see [`PRODUCT_BIBLE.md`](./PRODUCT_BIBLE.md) §4). **Action:** **Continue.**

### Screen 09 — What Brings You Here?

**Purpose:** surface intent, not identity. **Heading:** "What would you like PRISM to help with?"
**Content (multi-select):** Managing medications · Tracking injections · Keeping up with appointments · Tracking lab work · Preparing for surgery · Keeping track of legal changes · Documenting milestones · Journaling · Saving important records · Keeping everything in one place · I'm still figuring things out · Something else.
**Action:** **Continue.**

### Screen 10 — Journey Stage

**Heading:** "Where are you right now?" / _"There's no wrong answer, and you can change this anytime."_
**Content:** Exploring · Preparing · In progress · Established · Somewhere else · **Prefer not to say.**
**Constraint:** must never visually resemble a progress meter (no percentage, no filled bar).

### Screen 11 — Identity

**Heading:** "Tell PRISM about you." **Fields (all optional):** Name, Pronouns, Gender. **Copy:** "Everything here is optional." **Actions:** **Continue**, **Skip.**

### Screen 12 — Care Setup

**Heading:** "What would you like to keep track of?" **Content (multi-select):** Hormones · Medication · Injections · Patches · Gel/cream · Blockers · Surgery · Other · **None of these.**
**Behavior:** this selection configures which of the following onboarding screens (13–15) appear and which `modules` rows get created.

### Screen 13 — Medication Setup

**Condition:** only shown if medication tracking was selected in Care Setup.
**Fields:** Medication name, Form, Dosage text, Frequency, Schedule, Start date, Reminder. **Actions:** **Save medication**; **I'll do this later.**

### Screen 14 — Injection Setup

**Condition:** only shown if injections were selected. **Heading:** "Want to track injections?" **Actions:** **Yes** / **Not right now.** **If yes:** Medication, Reminder preference, Site tracking preference. No medical recommendations are given.

### Screen 15 — Appointment Setup

**Condition:** only shown if appointment tracking was selected. **Fields (all optional, skippable):** Provider, Appointment type, Date, Time, Location, Reminder.

### Screen 16 — Journey Date

**Heading:** "Does your journey have a start date?" **Content:** Choose a date · I don't know · My journey doesn't have one specific start date · Skip. No default date is ever invented on the user's behalf.

### Screen 17 — Privacy Setup

**Heading:** "Protect your PRISM." **Content:** App Lock (toggle), Biometrics (toggle), Private notifications (toggle, **enabled by default**) — _"Private notifications hide sensitive information from your lock screen."_ **Action:** **Continue.**

### Screen 18 — Building PRISM

**Visual:** light enters a prism, refracts, and the user's selected modules appear from the spectrum. Duration ~1–2 seconds. **Text:** "Building your PRISM…"

### Screen 19 — PRISM Ready

**Heading:** "Your PRISM is ready." **Copy:** "Everything you chose to track is now organized around you." **Action:** **Enter PRISM** → Today.

---

## 6. TODAY

### Screen 20 — Today

**Purpose:** the primary application screen; answers "What matters to me today?" (see [`PRODUCT_BIBLE.md`](./PRODUCT_BIBLE.md) §Core User Experience).
**Content:** greeting header ("Good morning, Alex." + date + "Here's what's happening today.") followed by dynamic, personalization-driven cards.
**Card types:** Medication (due today), Appointment (upcoming), Journey (recent milestone), Reflection (optional journal prompt), Reminder (custom). **Cards only appear when relevant** — see [`TECHNICAL_BIBLE.md`](./TECHNICAL_BIBLE.md) §Personalization Engine for the ranking pipeline.
**Empty state:** "Nothing urgent today." / "That's okay. Your PRISM is here whenever you need it." → **Add something** (opens Quick Add).

### Screen 21 — Quick Add

**Type:** bottom sheet, accessible from anywhere via the global **+**. **Heading:** "Add to PRISM."
**Content:** Medication · Injection · Appointment · Lab · Procedure · Milestone · Journal · Memory · Document — **filtered to only the user's enabled modules.** In MVP this means only Medication, Injection, Appointment, Milestone, and Journal appear, since Lab/Procedure/Memory/Document are P1 modules (§14) not yet enable-able.

### Screen 22 — Notifications

**Content:** Today's reminders, Upcoming reminders, Completed reminders, each with status (Scheduled/Completed/Skipped/Missed) in neutral, non-shame language.

---

## 7. CARE

### Screen 23 — Care Home

**Heading:** "Care." **Content:** sections for Medications, Injections, Appointments, Labs, Procedures — active/relevant modules shown first (see [`SCREEN_BIBLE.md`](#care-personalization) §CARE Personalization below).

### Screen 24 — Medications

**Content:** active medication cards (Name, Form, Schedule, Next scheduled event, Reminder status). **Action:** **Add medication** → Screen 25. Tap → Medication Detail.

### Screen 25 — Add Medication

**Fields:** Name, Form, Dosage text, Frequency, Schedule, Start date, End date, Reminder, Notes. **Action:** **Save medication.**

### Screen 26 — Medication Detail

**Content:** Name, Form, Dosage text, Schedule, Start date, End date, Reminder, Notes. **Actions:** **Log**, **Edit**, **Pause**, **Delete.** **Pause preserves history** — it does not delete past logs.

### Screen 27 — Edit Medication

Same fields as Add Medication. **Constraint:** changing configuration must not rewrite historical logs.

### Screen 28 — Medication Log

**Content:** chronological log entries (Date, Scheduled time, Status, Notes). **Filters:** All / Completed / Skipped / Missed.

### Screen 29 — Injection History

**Heading:** "Injections." **Content:** Date, Time, Medication, Site — optionally a simple calendar/timeline visual. **Action:** **Log injection** → Screen 30.

### Screen 30 — Log Injection

**Fields:** Medication, Date, Time, Site, Notes. **Site options:** Left thigh, Right thigh, Left glute, Right glute, Left abdomen, Right abdomen, Other, Don't track. **Action:** **Save injection.** No medical guidance is given on site selection.

### Screen 31 — Appointments

**Content:** sections **Upcoming** and **Past**, upcoming shown first. **Action:** **Add appointment** → Screen 32.

### Screen 32 — Add Appointment

**Fields:** Title, Provider, Category, Date, Time, Location, Notes, Reminder. **Action:** **Save appointment.**

### Screen 33 — Appointment Detail

**Content:** Title, Provider, Category, Date, Time, Location, Notes, Reminder. **Actions:** **Edit**, **Delete.**

### Screen 34 — Edit Appointment

Editable version of Appointment Detail.

### Screen 35 — Labs (P1)

**Content:** sections **Upcoming** and **Completed**; each row shows Lab title, Date, Provider, Status. **Action:** **Add lab** → Screen 36.

### Screen 36 — Add Lab (P1)

**Fields:** Title, Date, Provider, Status, Notes, Attachment. **Action:** **Save lab.**

### Screen 37 — Lab Detail (P1)

**Content:** all lab fields. **Actions:** **Edit**, **Delete**, **Open attachment.** PRISM provides no medical interpretation of results.

### Screen 38 — Procedures (P1)

**Content:** Procedure, Date, Provider, Category. **Action:** **Add procedure** → Screen 39.

### Screen 39 — Add Procedure (P1)

**Fields:** Title, Date, Provider, Category, Notes. **Action:** **Save procedure.**

### Screen 40 — Procedure Detail (P1)

**Content:** all procedure fields. **Actions:** **Edit**, **Delete.**

---

## 8. JOURNEY

### Screen 41 — Journey Home

**Heading:** "Your journey." **Content:** subsections Timeline, Milestones, Journal, Memories, with an optional contextual summary phrased as _"24 moments recorded"_ — never _"24 achievements."_

### Screen 42 — Timeline

**Purpose:** a unified, chronological view across all record types (Medication, Injection, Appointment, Lab, Procedure, Milestone, Journal, Memory). In MVP, only P0 record types (Medication, Injection, Appointment, Milestone, Journal) can appear, since Lab/Procedure/Memory don't exist as data sources until P1 ships. **Visual concept:** a subtle "path of light" connecting events (see [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) §Timeline), explicitly not a conventional medical timeline.

### Screen 43 — Timeline Event

**Behavior:** tapping an event opens its original record (e.g. Timeline → Injection → Injection Detail). Timeline never duplicates records — it is a view, not a separate data store.

### Screen 44 — Milestones

**Content:** milestones displayed chronologically; suggested milestones may appear when no custom milestone exists yet. **Action:** **Add milestone** → Screen 45.

### Screen 45 — Add Milestone

**Suggested choices (all optional, never required):** Came out · Started HRT · First appointment · First injection · Name change · Pronoun change · Legal gender marker change · Surgery consultation · Surgery · One month · Six months · One year · **Create your own.**
**Fields:** Title, Description, Date, Category, Icon. **Action:** **Save milestone.**

### Screen 46 — Milestone Detail

**Content:** Title, Date, Description, Category. **Actions:** **Edit**, **Delete.**

### Screen 47 — Journal

**Content:** entry cards (Title, Date, Preview, optional Mood). **Action:** **Write something** → Screen 48.

### Screen 48 — New Journal Entry

**Fields:** Title (optional), "What's on your mind?" (large text field), Mood (optional), Tags (optional), Photo (optional). **Action:** **Save entry.**

### Screen 49 — Journal Entry Detail

**Content:** Title, Date, Content, Mood, Tags, Photo. **Actions:** **Edit**, **Delete.** Journal content must remain private (never sent to analytics — see [`SECURITY.md`](./SECURITY.md)).

### Screen 50 — Memories (P1)

**Type:** visual-first grid or timeline. **Heading:** "Memories." **Subheading:** "Not progress. Memories." **Action:** **Add memory** → Screen 51.

### Screen 51 — Add Memory (P1)

**Fields:** Photo (optional), Title, Description, Date. **Action:** **Save memory.**

### Screen 52 — Memory Detail (P1)

**Content:** Image, Title, Description, Date. **Actions:** **Edit**, **Delete.**

---

## 9. YOU

### Screen 53 — You

**Purpose:** primary settings hub. **Sections:** **Me** (Profile) · **PRISM** (Customize PRISM) · **Privacy** (Privacy & App Lock) · **Preferences** (Notifications, Appearance, Accessibility) · **Data** (Export, Delete account) · **About** (Support, Legal).

### Screen 54 — Profile

**Content:** Name, Pronouns, Gender, Birthday, Journey start date, Profile photo — all as entered (all optional). **Action:** **Edit profile** → Screen 55.

### Screen 55 — Edit Profile

All fields optional; saves changes.

### Screen 56 — Customize PRISM

**Heading:** "Make PRISM yours." **Content (MVP):** module toggles for the five P0 modules only — Medications, Injections, Appointments, Milestones, Journal. Labs, Procedures, Memories, Legal, and Documents are P1 (§14) and are not offered as toggles until their screens ship — the `modules` table already supports all ten keys, so no schema change is needed when they're added. **Constraint:** toggling a module off changes only whether it's surfaced; it never deletes existing data (see [`DECISIONS.md`](./DECISIONS.md)).

### Screen 57 — Module Configuration

**Behavior:** selecting a module opens deeper configuration, e.g. Medication (Enabled, Reminder behavior), Journal (Enabled, Mood tracking, Photos), Memories (Enabled, Timeline integration).

### Screen 58 — Notification Settings

**Content:** Notifications enabled, Private notifications, Medication reminders, Injection reminders, Appointment reminders, Lab reminders, Custom reminders — each independently configurable.

### Screen 59 — Privacy

**Sections:** **App Security** (App lock, Biometrics, PIN) · **Notifications** (Private notifications) · **Data** (Export, Delete) · **Security information** (plain-language explanation of how PRISM protects information).

### Screen 60 — App Lock

**Content:** Enable App Lock, Use biometrics, Change PIN. If biometrics are unavailable on-device, offer PIN as the fallback.

### Screen 61 — Accessibility

**Content:** Text size, Reduced motion, Increased contrast, Screen reader optimizations. Respects OS-level accessibility settings as the default.

### Screen 62 — Appearance

**Content:** Light, Dark, System (default). Dark mode is a signature PRISM experience, not an afterthought (see [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)).

### Screen 63 — Data & Export

**Actions:** **Export my data**, **Download my data**, **Delete account** — each action's effect is explained in plain language before the user taps it.

### Screen 64 — Delete Account

**Heading:** "Delete your PRISM account?" **Copy:** "This permanently deletes your PRISM account and associated information." **Action:** requires explicit confirmation (e.g. **Delete my account**). No dark patterns — the path to deletion must be as clear as the path to any other setting.

### Screen 65 — About

**Content:** PRISM logo, Version, Product description, Privacy Policy, Terms, open-source acknowledgements where applicable.

### Screen 66 — Support

**Content:** Help center, Contact support, Report a problem, Privacy concern. Support forms avoid collecting sensitive information unnecessarily.

### Screen 67 — Legal Journey (P1)

**Content:** legal records — Name change, Gender marker, Driver's license, Passport, Birth certificate, Social Security, Custom — each with a status. Wording never implies legal transition is required (see [`PRODUCT_BIBLE.md`](./PRODUCT_BIBLE.md) §17).

### Screen 68 — Legal Item Detail (P1)

**Content:** Title, Category, Status, Date, Notes. **Actions:** **Edit**, **Delete.**

### Screen 69 — Documents (P1)

**Type:** high-security section (see [`SECURITY.md`](./SECURITY.md)). **Categories:** Medical, Labs, Surgery, Insurance, Legal, Other. **Behavior:** document names are shown; contents are not rendered until explicitly opened. **Action:** **Add document** → Screen 70.

### Screen 70 — Add Document (P1)

**Fields:** File, Title, Category. **Action:** **Secure document.** **Copy before upload:** "This file contains information you chose to store privately in PRISM."

### Screen 71 — Document Detail (P1)

**Content:** Document name, Category, Date, File type, Size. **Actions:** **Open**, **Share**, **Delete.** Sharing requires an explicit user action — it is never automatic or implied.

---

## 10. Global Screens

### Screen 72 — Search (P1)

**Content:** universal search field, placeholder "Search PRISM," scoped to Timeline, Medications, Appointments, Labs, Milestones, Journal, Memories, Legal, Documents — filtered to enabled modules only.

### Screen 73 — Search Results (P1)

**Content:** results grouped by category (e.g. Timeline: 3 results, Appointments: 1 result, Journal: 2 results, Milestones: 1 result). Search must respect the same privacy and authorization rules as every other read (RLS-scoped, enabled-modules-only).

### Screen 74 — Confirmation Modal

**Use:** for actions requiring confirmation, e.g. "Save this change?" with **Confirm**/**Cancel.** Not overused — reserved for actions where confirmation genuinely helps, not every save.

### Screen 75 — Delete Confirmation

**Content:** e.g. "Delete this entry? This cannot be undone." **Actions:** **Delete**, **Cancel.**

### Screen 76 — Error State

**Content:** "Something went wrong. Your information wasn't changed." **Actions:** **Try again**, **Go back.** Never exposes raw backend errors.

### Screen 77 — Offline State

**Content:** "You're offline." Plus, where applicable, "Your changes will sync when you're back online." Supported offline actions remain available.

### Screen 78 — App Lock Screen

**Content:** minimal — "PRISM" / "Unlock PRISM," biometric button where available, PIN fallback. Displays no user information whatsoever.

---

## 11. Personalization Behavior by Area

### TODAY Personalization

TODAY does not mirror the database — it interprets relevance. Given a medication due today, an appointment tomorrow, and a milestone from three months ago, TODAY surfaces (in order): Medication → Appointment → Journey reflection — not every record that exists.

### JOURNEY Personalization

JOURNEY adapts to what the user actually records. A user who only journals experiences JOURNEY as a journal; a user who only creates milestones experiences it as a milestone timeline; a user who uses everything gets a comprehensive personal history. The screens are the same — the emphasis is data-driven.

### CARE Personalization

CARE adapts the same way — a user who only tracks appointments should never be confronted with an empty, oversized medication dashboard (§CARE Home).

### User Control

At any point the user can: add a module, remove a module from view, change preferences, skip optional fields, edit records, delete records, export information, and delete their account.

## 12. Pre-Release Checks

### No Assumption Check

Before every major release, verify PRISM can be used fully without: identifying gender, selecting pronouns, taking hormones, taking medication, having surgery, changing a name, changing legal documents, or choosing a transition date. The answer must remain **yes** in every case.

### Accessibility Check

VoiceOver test, TalkBack test, dynamic text test, reduced motion test, high contrast test, keyboard navigation test where relevant, touch target test, color-independent status test.

### Security Check

Authentication tested, RLS tested, storage policies tested, account deletion tested, export tested, notification privacy tested, app lock tested, sensitive logging reviewed, third-party data flows reviewed.

## 13. Screen Development Order

Recommended build sequence (mirrors [`MASTER_BUILD_SPEC.md`](./MASTER_BUILD_SPEC.md) §Development Order): Splash → Welcome → Authentication → Onboarding → Today → Quick Add → Care → Medications → Medication Logging → Injections → Appointments → Labs → Journey → Timeline → Milestones → Journal → You → Customize → Privacy → App Lock → Notifications → Data → Legal → Documents → Search → Accessibility → Polish.

## 14. MVP Screen Priority

**P0 — Required for MVP:** Splash, Welcome, Sign Up, Sign In, Onboarding, Today, Quick Add, Care, Medications, Medication Detail, Medication Logging, Injections, Appointments, Journey, Timeline, Milestones, Journal, You, Customize PRISM, Privacy, App Lock, Notifications, Data & Export, Delete Account.

**P1 — Shortly after MVP:** Labs, Procedures, Memories, Legal Journey, Universal Search, Documents. Also P1 at the feature (not screen) level: Advanced recurring schedules, Supply tracking, Enhanced journal functionality.

> **Resolved:** this P0/P1 split was confirmed by explicit product-owner decision on 2026-09-01 — see [`DECISIONS.md`](./DECISIONS.md) §Full MVP (P0) / next-release (P1) scope. It supersedes the narrative "basic labs / procedures / basic legal journey" wording that had appeared elsewhere as part of MVP; those sections have since been corrected to match this list.

**P2 — Future:** AI Assistant, Health integrations, Provider information, Insurance, Advanced backup, PRISM Resources, PRISM Connect.

## 15. Final Screen Rule

Every PRISM screen must answer one question: **why does this screen exist?** If the answer is unclear, remove the screen. Every screen exists to make the user's journey **easier to manage, easier to understand, easier to remember, or easier to protect.**

## 16. Screen Bible Completion Criteria

An implemented screen is complete when it has a defined: purpose, entry point, exit point, primary action, data requirements, empty state, loading state, error state, privacy behavior, accessibility behavior, navigation behavior, and (where applicable) destructive-action handling — per the Global Screen Contract in §3 above.
