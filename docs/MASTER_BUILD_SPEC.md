# PRISM Master Build Specification

Version 1.0
Tagline: Your journey. Your way.

**Document purpose:** this document is the authoritative specification for designing, engineering, testing, and preparing PRISM for beta release. **Claude Code (and any engineer building PRISM) should treat this document as the source of truth.** When an implementation decision is not explicitly covered, choose the option that best preserves the principles in this document. Do not ask the product owner unnecessary clarification questions. Do not invent product requirements that conflict with this specification.

This document is a synthesis — full detail on any one area lives in its dedicated document: [`PRODUCT_BIBLE.md`](./PRODUCT_BIBLE.md), [`TECHNICAL_BIBLE.md`](./TECHNICAL_BIBLE.md), [`SCREEN_BIBLE.md`](./SCREEN_BIBLE.md), [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md), [`SECURITY.md`](./SECURITY.md), [`DECISIONS.md`](./DECISIONS.md). This document tells you what to build and in what order; the others tell you exactly how.

---

## 01. Product Definition

PRISM is a private, personalized app for transgender and gender-diverse people to manage, document, organize, and reflect on their individual gender-affirming journey. PRISM adapts to the individual — there is no required transition path. A person can use PRISM with HRT, without HRT, with injections, without injections, before surgery, after surgery, without surgery, while changing legal documents, without changing legal documents, while exploring their identity, after many years of transition, or without identifying with the concept of "transition" at all.

**The application must never require a user to medically, socially, legally, or physically transition.**

### What PRISM is not

Not a doctor, therapist, diagnostic tool, medical decision system, hormone dosing calculator, medication recommendation engine, surgery eligibility system, dysphoria scoring system, replacement for medical care, social network, dating application, or a platform for determining someone's gender. PRISM is a personal organization, tracking, documentation, and reflection tool.

### Target users

Transgender men, transgender women, nonbinary people, gender-fluid people, questioning people; people on HRT and people not on HRT; people using injections, patches, gels/creams, or blockers; people pursuing surgery and people not pursuing surgery; people changing legal documents and people not changing legal documents; people early in their journey and people many years into it. **Do not design primarily around one transition pathway.**

## 02. Core Philosophy & Product Principles

**Your journey. Your way.** — *There's no right way to transition.* Some people take hormones, some don't; some have surgery, some don't; some change their name, some don't; some know exactly what they want, others are still figuring things out. **PRISM adapts to every journey.** This philosophy must influence the product architecture, UX, database, copy, personalization, and visual design — not just the marketing copy.

1. **Person First** — the user is not a collection of medical records; the interface prioritizes the person over their data.
2. **No Assumptions** — never assume gender, pronouns, name, HRT status, medication, injections, surgery, dysphoria, transition status, transition start date, transition goals, or legal changes. Everything is optional unless technically required for account creation (e.g. an email to sign in with).
3. **Private by Default** — privacy is a core product feature. Sensitive information must never be unnecessarily exposed through notifications, lock screens, analytics, logs, URLs, screenshots, or metadata.
4. **No Judgment** — a missed medication record is not a failure; changing a plan, stopping HRT, starting HRT, changing pronouns, changing names — none of these are failures. The application records events; it does not judge them.
5. **No Finish Line** — PRISM must never imply that a user has completed transition, failed transition, fallen behind, or reached "the correct endpoint." There is no universal endpoint.

Full detail: [`PRODUCT_BIBLE.md`](./PRODUCT_BIBLE.md) §8–9.

## 03. Architecture

**Stack:** React Native + Expo (mobile, iOS + Android) · Supabase (PostgreSQL, Auth, Row Level Security, Storage, Edge Functions) · Next.js on Vercel (web — marketing, docs, support, legal, and potentially an account/data portal) · pnpm (package manager).

**Monorepo layout:**
```
prism/
├── apps/{mobile, web}/
├── packages/{ui, database, types, config, validation}/
├── supabase/{migrations, functions, seed, config.toml}
├── docs/{PRODUCT_BIBLE, TECHNICAL_BIBLE, SCREEN_BIBLE, DESIGN_SYSTEM, MASTER_BUILD_SPEC, SECURITY, DECISIONS}.md
├── package.json, pnpm-workspace.yaml, README.md
```

**Mobile feature structure** (feature-oriented, not layer-oriented):
```
features/
├── auth/  ├── onboarding/  ├── today/
├── care/{medications, injections, appointments, labs, procedures}/
├── journey/{timeline, milestones, journal, memories}/
└── you/{profile, customization, privacy, notifications, accessibility, data}/
```

**Architectural principles:** security first (server enforces ownership, never the client) · server is authoritative · modular by design (independent, toggleable modules) · configuration over hard-coding (the dashboard is generated, never per-user hard-coded) · progressive disclosure (never ask before it's needed) · accessibility is architecture (not a retrofit) · no sensitive information in logs, ever.

Full detail: [`TECHNICAL_BIBLE.md`](./TECHNICAL_BIBLE.md) §2–5.

## 04. Navigation

PRISM has exactly four primary destinations: **TODAY · CARE · JOURNEY · YOU**, presented as a bottom tab bar. **Do not add additional primary navigation tabs unless this specification is intentionally revised.** Secondary navigation within each tab is contextual (e.g. CARE's sub-navigation: Medications, Injections, Appointments, Labs, Procedures).

## 05. Personalization Engine

Architecture: `USER → Preferences → Enabled Modules → Current Data → Relevant Events → TODAY`. The dashboard is **dynamically generated**, never hard-coded.

**Initial module keys:** `medications`, `injections`, `appointments`, `labs`, `procedures`, `milestones`, `journal`, `memories`, `legal`, `documents`. Users enable or disable modules independently. Of these, `medications`, `injections`, `appointments`, `milestones`, and `journal` are P0 (toggleable in the MVP build); `labs`, `procedures`, `memories`, `legal`, and `documents` are P1 (§25) — the schema supports all ten keys from Foundation onward, but the MVP UI only offers the five P0 keys (see [`DECISIONS.md`](./DECISIONS.md)).

**Critical rule:** disabling a module **hides it** — it does **not** delete its data. Re-enabling a module restores its existing information exactly as it was. This is a non-negotiable rule (see [`DECISIONS.md`](./DECISIONS.md)); implement it at the query layer (filter by enabled modules), not by ever issuing a delete.

Ranking pipeline and priority order are specified in [`TECHNICAL_BIBLE.md`](./TECHNICAL_BIBLE.md) §Personalization Engine (Technical View).

## 06. Onboarding

Sequential, resumable, and every non-essential step is skippable. No step visually resembles a progress meter.

1. **Splash** — "PRISM" / "Your journey. Your way." Routes to Today, Welcome, or resumed onboarding.
2. **Welcome** — "Welcome to PRISM." Get started / Already have an account.
3. **Philosophy** — the approved PRISM philosophy, verbatim, never rewritten into clinical language.
4. **What Brings You Here?** — multi-select intent (managing medications, tracking injections, appointments, labs, surgery, legal changes, milestones, journaling, records, "keeping everything in one place," "I'm still figuring things out," "something else").
5. **Journey Stage** (optional) — Exploring / Preparing / In progress / Established / Somewhere else / Prefer not to say. **Must not** appear as a progress meter.
6. **Identity** (optional) — Name, Pronouns, Gender. Fully skippable.
7. **Care Setup** (optional) — Hormones, Medication, Injections, Patches, Gel/cream, Blockers, Surgery, Other, None of these. Drives which of the next three screens appear.
8. **Medication Setup** (conditional) — Name, Form, Dosage text, Frequency, Schedule, Start date, End date, Reminder, Notes.
9. **Injection Setup** (conditional) — Medication, Date/time, Site, Notes.
10. **Appointment Setup** (conditional) — Title, Provider, Category, Date/time, Location, Notes, Reminder.
11. **Journey Date** (optional) — Choose a date / I don't know / My journey doesn't have one specific start date / Skip. Never invent a default date.
12. **Privacy Setup** — App lock, Biometrics, Private notifications (**defaults to ON**).
13. **Building PRISM** — 1–2 second prism/light animation; never artificially delayed beyond actual setup time.
14. **Ready** — "Your PRISM is ready." → Today.

Full per-screen spec: [`SCREEN_BIBLE.md`](./SCREEN_BIBLE.md) §5.

## 07. TODAY

Structure: Greeting + Date → Priority information → Upcoming information → Recent meaningful information → Optional reflection → Quick Add.

**Personalization priority (render order):** (1) things requiring action today, (2) upcoming items, (3) recent meaningful activity, (4) optional reflection, (5) nothing. **Do not manufacture content to fill empty space** — an empty TODAY shows: *"Nothing urgent today. That's okay. Your PRISM is here whenever you need it."*

## 08. CARE

CARE is organized without feeling clinical — see [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) §19 and §27 (Data Density → Administrative mode).

### Medications
Fields: `id, user_id, name, form, dosage_text, frequency_type, frequency_config, start_date, end_date, reminder_enabled, notes, created_at, updated_at`. Forms: pill, injection, patch, gel, cream, other. Frequencies: daily, weekly, every X days, custom.

**Medication rules — PRISM can:** record medication, display user-entered dosage, create reminders, log completion/skipped/missed doses, record notes. **PRISM cannot:** recommend dosage, calculate hormone dosage, suggest dosage changes, determine whether a dose is appropriate, or diagnose medication issues. This is a hard boundary — not a copy-writing preference.

**Medication log statuses:** Scheduled, Completed, Skipped, Missed, Skipped intentionally. Never shame users for a status.

### Injections
Optional — not the identity of PRISM. Fields: `id, user_id, medication_id, injected_at, site, notes, created_at, updated_at`. Site values: left/right thigh, left/right glute, left/right abdomen, other, don't track. **Do not provide medical advice regarding injection sites.**

### Appointments
Fields: `id, user_id, title, provider, category, starts_at, ends_at, location, notes, reminder_enabled, created_at, updated_at`. Categories: Primary care, Gender-affirming care, Endocrinology, Surgery, Mental health, Lab, Other — users may add custom categories.

### Labs (P1)
PRISM tracks lab records; **it does not interpret them.** Fields: `id, user_id, title, date, provider, status, notes, attachment_id, created_at, updated_at`. Statuses: Scheduled, Completed, Results received, Follow-up needed. Not part of MVP (§25) — the schema and rules here apply once built.

### Procedures (P1)
Fields: `id, user_id, title, date, provider, category, notes, created_at, updated_at`. PRISM records procedures; it does not determine eligibility or readiness. Not part of MVP (§25) — the schema and rules here apply once built.

## 09. JOURNEY

More expressive than CARE (see [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) §20, §27 Personal mode).

### Timeline
Unifies medications, injections, appointments, labs, procedures, milestones, journal entries, and memories into one chronological view — visual metaphor: **path of light.** Timeline events **reference** their source records; the timeline is a view, never a second independent copy of the data. Selecting an event opens the original record. In MVP, Timeline surfaces only P0 record types (medications, injections, appointments, milestones, journal entries) — this requires no special-casing, since it already pulls only from enabled modules, and labs/procedures/memories automatically appear once their P1 modules ship.

### Milestones
Suggested (always optional, always paired with **"Create your own milestone"**): Came out, Started HRT, First appointment, First injection, Name change, Pronoun change, Legal gender marker change, Surgery consultation, Surgery, One month, Six months, One year.

### Journal
Fields: `id, user_id, title, content, mood, date, tags, created_at, updated_at`. Mood is optional; no clinical scoring. **Journal content must never be included in analytics** (see [`SECURITY.md`](./SECURITY.md)).

### Memories (P1)
Personal documentation — first Pride, favorite selfie, haircut, ID, birthday, a meaningful conversation, a special outfit, a trip, a personal achievement. Primary philosophy: **"Not progress. Memories."** Never frame photographs as proof of physical transition. Not part of MVP (§25); JOURNEY ships with Timeline, Milestones, and Journal only.

## 10. YOU

The user's control center. Sections: **Personal** (Profile, Edit Profile) · **PRISM** (Customize PRISM, Module Configuration) · **Experience** (Notifications, Appearance, Accessibility) · **Privacy** (Privacy, App Lock) · **Journey** (Legal Journey, Documents) · **Data** (Data & Export, Delete Account) · **Support** (Support, About). The Legal Journey and Documents sections themselves are P1 (§25) and are not present in the MVP build of YOU.

**Customize PRISM in MVP** exposes toggles for the five P0 modules only (`medications`, `injections`, `appointments`, `milestones`, `journal`). The `modules` table schema and its full set of module keys are unchanged — labs/procedures/legal/documents/memories remain valid keys the architecture supports — but the MVP UI simply does not yet offer them; each is added to the toggle list in the release its screens ship (see [`DECISIONS.md`](./DECISIONS.md)).

## 11. Legal Journey (P1)

Initial items: Name change, Gender marker, Driver's license, Passport, Birth certificate, Social Security, Custom. Statuses: Not started, Preparing, Filed, In progress, Approved, Complete. Legal information is user-managed tracking only — **PRISM does not provide legal advice**, and wording must never imply legal transition is required. Not part of MVP (§25).

## 12. Documents (P1)

Categories: Medical records, Lab results, Letters, Insurance, Surgery documents, Legal documents. **Documents require high security** — use private storage buckets, never expose public URLs, use short-lived signed URLs where a temporary link is genuinely necessary. Document functionality is P1 (see §25), but the storage architecture must anticipate it from the start rather than being bolted on later.

## 13. Quick Add

Global **+** action, "Add to PRISM": Medication, Injection, Appointment, Lab, Procedure, Milestone, Journal, Memory, Document — **only options relevant to the user's enabled modules are shown.** In the MVP build this means only Medication, Injection, Appointment, Milestone, and Journal ever appear, since the Lab/Procedure/Memory/Document modules are P1 (§25) and are not enabled-able until their screens ship.

## 14. Search (P1)

Universal search covers timeline, medications, appointments, labs, milestones, journal, memories, legal records, and documents. **Search must respect RLS and user ownership** — implemented as a query scoped like any other read, never a separately-privileged index. Search is a P1 (post-MVP) feature (§25); see [`TECHNICAL_BIBLE.md`](./TECHNICAL_BIBLE.md) §Search for the implementation approach (Postgres full-text search, not a third-party indexing service).

## 15. Notifications

Default: **private notifications ON.** Example: *"Your PRISM reminder is ready."* Never default to sensitive content such as *"Your testosterone injection is due"* or *"Your surgery appointment is tomorrow."* Users can intentionally opt into more detailed notifications.

## 16. App Lock

Support Face ID, Touch ID, Android biometrics, and PIN fallback where appropriate. The lock screen must not reveal medications, appointments, journey data, journal content, or sensitive notifications — it shows only the PRISM mark and an unlock prompt.

## 17. Authentication

**MVP:** email/password, email verification, password recovery, password reset, sign out. **Social login is not required for MVP.** Forgot-password behavior must not reveal whether an email address exists (enumeration protection).

## 18. Database

PostgreSQL via Supabase. All user-owned data has enforced ownership boundaries via `user_id` + RLS (§19). UUID primary keys; `created_at`/`updated_at` on mutable records; UTC timestamps internally, local timezone for display; `DATE` (not `TIMESTAMPTZ`) for date-only concepts like birthdays and milestones.

**Full schema** — `profiles`, `modules`, `medications`, `medication_logs`, `injections`, `appointments`, `labs`, `procedures`, `milestones`, `journal_entries`, `memories`, `legal_items`, `documents`, `reminders`, `settings`. **All 15 tables are built as part of Foundation/CARE/JOURNEY migrations regardless of P0/P1 UI scope** — per [`DECISIONS.md`](./DECISIONS.md), the schema anticipates P1 features (Labs, Procedures, Legal Journey, Memories, Documents); only the corresponding screens are deferred. The "Scope" column below indicates which release surfaces each table's data in the UI, not whether the table itself is created.

Canonical columns:

| Table | Scope | Columns |
|---|---|---|
| `profiles` | P0 | `id` UUID PK, `user_id` UUID UNIQUE NOT NULL, `display_name`, `pronouns`, `gender`, `birthday` DATE, `journey_start_date` DATE, `profile_photo_url`, `onboarding_completed` BOOLEAN DEFAULT FALSE, `created_at`, `updated_at` — everything except `user_id` is nullable |
| `modules` | P0 | `id` UUID PK, `user_id` NOT NULL, `module_key` TEXT NOT NULL, `enabled` BOOLEAN DEFAULT FALSE, `configuration` JSONB DEFAULT `'{}'`, `created_at`, `updated_at` — `UNIQUE(user_id, module_key)`. Rows may exist for any of the 10 module keys; MVP's UI only lets the user toggle the 5 P0 keys (§10) |
| `medications` | P0 | `id` UUID PK, `user_id` NOT NULL, `name` NOT NULL, `form`, `dosage_text`, `frequency_type`, `frequency_config` JSONB, `start_date`, `end_date`, `reminder_enabled` BOOLEAN DEFAULT FALSE, `notes`, `created_at`, `updated_at` |
| `medication_logs` | P0 | `id` UUID PK, `user_id` NOT NULL, `medication_id` NOT NULL, `scheduled_at`, `completed_at`, `status`, `notes`, `created_at`, `updated_at` |
| `injections` | P0 | `id` UUID PK, `user_id` NOT NULL, `medication_id` (nullable), `injected_at` NOT NULL, `site`, `notes`, `created_at`, `updated_at` |
| `appointments` | P0 | `id` UUID PK, `user_id` NOT NULL, `title` NOT NULL, `provider`, `category`, `starts_at` NOT NULL, `ends_at`, `location`, `notes`, `reminder_enabled` BOOLEAN DEFAULT FALSE, `created_at`, `updated_at` |
| `labs` | P1 | `id` UUID PK, `user_id` NOT NULL, `title` NOT NULL, `date` NOT NULL, `provider`, `status`, `notes`, `attachment_id`, `created_at`, `updated_at` |
| `procedures` | P1 | `id` UUID PK, `user_id` NOT NULL, `title` NOT NULL, `date` NOT NULL, `provider`, `category`, `notes`, `created_at`, `updated_at` |
| `milestones` | P0 | `id` UUID PK, `user_id` NOT NULL, `title` NOT NULL, `description`, `date` NOT NULL, `category`, `icon`, `created_at`, `updated_at` |
| `journal_entries` | P0 | `id` UUID PK, `user_id` NOT NULL, `title`, `content` NOT NULL, `mood`, `date` NOT NULL, `tags` TEXT[], `created_at`, `updated_at` |
| `memories` | P1 | `id` UUID PK, `user_id` NOT NULL, `title` NOT NULL, `description`, `date`, `media_id`, `created_at`, `updated_at` |
| `legal_items` | P1 | `id` UUID PK, `user_id` NOT NULL, `title` NOT NULL, `category` NOT NULL, `status` NOT NULL, `date`, `notes`, `created_at`, `updated_at` |
| `documents` | P1 | `id` UUID PK, `user_id` NOT NULL, `title` NOT NULL, `category` NOT NULL, `storage_path` NOT NULL, `mime_type`, `file_size` BIGINT, `uploaded_at`, `created_at`, `updated_at` |
| `reminders` | P0 | `id` UUID PK, `user_id` NOT NULL, `type` NOT NULL, `reference_id`, `scheduled_time` NOT NULL, `recurrence` JSONB, `notification_style` NOT NULL, `enabled` BOOLEAN DEFAULT TRUE, `created_at`, `updated_at` |
| `settings` | P0 | `user_id` UUID PK, `theme` DEFAULT `'system'`, `biometric_lock` BOOLEAN DEFAULT FALSE, `notification_privacy` BOOLEAN DEFAULT TRUE, `reduced_motion` BOOLEAN DEFAULT FALSE, `accessibility_preferences` JSONB, `created_at`, `updated_at` |

> **Note on `settings`:** the source material states `user_id` as the table's primary key in one place; treat `settings.user_id` as the sole primary key (one settings row per user) — do not add a separate surrogate `id` column, since that would allow a user to accumulate multiple settings rows and break the "one settings row per user" invariant the rest of the spec assumes.

Supabase Auth owns the `auth.users` identity table; every table above stores a `user_id` referencing it — never a duplicate credential store.

## 19. Security

Use Supabase Auth + PostgreSQL + Row Level Security + secure storage. **Every user-owned table requires RLS.** Core rule: an authenticated user can access only records where `user_id = auth.uid()`. **Never rely exclusively on frontend authorization.**

**Never put in the mobile application:** Supabase service-role keys, administrative secrets, private API keys, privileged credentials.

**Storage security:** private buckets for documents and media; access authorized through authenticated ownership; no publicly accessible document URLs; short-lived signed URLs where applicable.

Full detail: [`SECURITY.md`](./SECURITY.md).

## 20. Privacy

PRISM must: minimize collected information, allow optional identity information, avoid unnecessary and sensitive analytics, support data export, support account deletion, protect sensitive notifications and lock-screen content, never sell transition or health data, never target advertising based on transition or health information.

**Do not casually claim HIPAA compliance.** Actual legal obligations must be determined from the final operating model, with appropriate legal/privacy review — see [`SECURITY.md`](./SECURITY.md) §Legal/Privacy Review Requirements.

## 21. Accessibility

Required: Dynamic Type, VoiceOver, TalkBack, semantic labels, logical focus order, large touch targets (44×44px minimum, 48×48px preferred), keyboard navigation where applicable, high contrast, reduced motion, accessible forms, color-independent status communication. **Color must never be the only way to communicate meaning.**

## 22. Design System Implementation Requirements

- **Brand colors:** dark `#0B0B0F / #121218 / #191921 / #22222C`; light `#F8F8FA / #F2F2F5 / #EAEAEE / #DEDEE5`; spectrum accents Cyan `#5BCFFB`, Pink `#F5A9B8`, Violet `#B58CFF`, Mint `#8DE8C5`, Yellow `#FFE58A`.
- **Typography:** Inter (primary), Sora (display, used sparingly). Type scale and weights per [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) §5.
- **Spacing:** 8-point grid; 20px screen padding; 16–20px card padding; 44×44px minimum touch target.
- **Corner radius:** cards 18px, inputs 12–14px, buttons 14px, tags 999px (pill).
- **Visual language:** dark-first, geometric, premium, calm, expressive, private, light/refraction-inspired. Avoid generic healthcare blue, rainbow overload, syringe/pill/medical-cross branding, excessive glassmorphism/shadows/animation.
- **Signature visual metaphor** (Light → Prism → Spectrum) appears subtly in onboarding, the logo, the timeline, milestone moments, major transitions, and success states — never at the expense of usability. **Rule: if removing the PRISM aesthetic makes the interface easier to understand, remove the aesthetic.**
- **Core components:** `PRISMButton`, `PRISMIconButton`, `PRISMCard`, `PRISMSection`, `PRISMInput`, `PRISMTextArea`, `PRISMSelect`, `PRISMSwitch`, `PRISMChip`, `PRISMModal`, `PRISMSheet`, `PRISMToast`, `PRISMSkeleton`, `PRISMEmptyState`, `PRISMErrorState`, `PRISMListItem`, `PRISMHeader`, `PRISMBottomNav`, `PRISMQuickAdd`, `PRISMTimeline`, `PRISMMilestone`, `PRISMMemoryCard`, `PRISMReminderCard`. Every interactive component supports Default/Pressed/Focused/Selected/Disabled/Loading/Error/Success states — implement all of them, not just the default.
- **Forms** support Empty/Typing/Focused/Validation error/Submitting/Success/Network failure/Offline/Unsaved changes, with visible labels, accessible inputs, keyboard-aware layout, preserved input after validation errors, client *and* server validation, and unsaved-change protection.
- **Motion:** communicates light moving → refracting → settling; Micro 100–150ms, Standard 180–250ms, Large 300–450ms; respects system Reduce Motion (remove parallax/floating/refractive animation, simplify transitions).
- **Approved empty-state copy:** General "Nothing here yet. That's okay." · Journey "Your story starts wherever you decide." · Memories "Save the moments that matter to you." · Journal "Whenever you're ready."
- **Error states:** "Something went wrong. Your information wasn't changed." + Try again / Go back. Never expose raw backend errors.
- **Offline:** "You're offline. Your changes will sync when you're back online." Never silently lose user-entered data; never falsely claim a write succeeded before it's persisted.

Full detail: [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md).

## 23. Screen Inventory

78 screens across Authentication (7), Onboarding (12), TODAY (3), CARE (18), JOURNEY (12), YOU (19), and Global (7). Full inventory and per-screen specification: [`SCREEN_BIBLE.md`](./SCREEN_BIBLE.md) §2.

**Screen implementation rule:** every screen must answer *"Why does this screen exist?"* — it must make the user's journey easier to manage, understand, remember, document, organize, or protect. If it doesn't, reconsider the screen.

## 24. MVP Scope (P0)

**This scope is final** — adopted by explicit product-owner decision on 2026-09-01, recorded in [`DECISIONS.md`](./DECISIONS.md) §Full MVP (P0) / next-release (P1) scope. It supersedes the narrative MVP wording that appeared in earlier drafts of this document and of `PRODUCT_BIBLE.md`.

- **Authentication:** sign up, sign in, email verification, password recovery, session handling.
- **Onboarding:** the full sequential flow (Philosophy → What Brings You Here? → Journey Stage → Identity → Care Setup → Medication/Injection/Appointment Setup → Journey Date → Privacy Setup → Building PRISM → Ready).
- **Personalization:** the module-driven configuration model, module selection, and the personalization engine that drives TODAY.
- **TODAY:** personalized dashboard, dynamic cards, Quick Add.
- **CARE:** medications, medication reminders and logging, injections, appointments.
- **JOURNEY:** timeline, milestones, journal.
- **YOU:** customize PRISM, privacy, notifications, app lock, accessibility, data export, account deletion.
- **Foundation (cross-cutting, required to build any of the above):** repository, navigation, Supabase, database, RLS, design system, theme system.

Labs, Procedures, and Legal Journey are **not** part of MVP (see §25). Foundation, Identity/Personalization, and cross-cutting requirements (Accessibility, Privacy, Security) are prerequisites for every P0 feature area above, not separate optional scope.

P0/P1/P2 screen-level breakdown: [`SCREEN_BIBLE.md`](./SCREEN_BIBLE.md) §14.

> **Module toggle scoping:** Customize PRISM and Quick Add expose only the five P0 module keys (`medications`, `injections`, `appointments`, `milestones`, `journal`) in the MVP build. See §10 and §13 below, and [`DECISIONS.md`](./DECISIONS.md) §Customize PRISM and Quick Add expose only P0 modules until P1 ships.

## 25. P1 Scope (Next Release)

**Adopted by explicit product-owner decision on 2026-09-01** (see [`DECISIONS.md`](./DECISIONS.md)). This is the release immediately after MVP — it supersedes and absorbs what earlier drafts of this document called "Version 1.1":

- **Labs** — full feature (list, add, detail), deferred from MVP in its entirety.
- **Procedures** — full feature (list, add, detail), deferred from MVP in its entirety.
- **Legal Journey** — full feature, deferred from MVP in its entirety.
- **Memories** — the fourth JOURNEY sub-feature; JOURNEY ships in MVP with Timeline, Milestones, and Journal only.
- **Documents** — the secure document feature; the storage architecture anticipates it (§12) but no Documents UI ships in MVP.
- **Universal Search** — cross-record search (§14); MVP ships without a Search screen.
- **Advanced recurring schedules** — `medications.frequency_type` values beyond `daily` / `weekly` / `every_x_days` (i.e. richer `custom` recurrence patterns).
- **Supply tracking** — remaining-quantity/refill tracking for medications; not part of the P0 `medications` schema.
- **Enhanced journal functionality** — beyond the P0 Journal's title/content/mood/tags/photo fields (e.g. prompts, richer formatting).

**Architecture must anticipate all of the above without building their UI now** — the full 15-table database schema (§18), the `modules` table's complete set of module keys, and Timeline's multi-source design already account for every P1 feature. Do not remove or simplify any of this to "match" P0; P0 is a scoping decision about what ships first, not about what the architecture supports.

Also still applicable from the original Version 1.1 candidate list, timed at the team's discretion alongside or after the above: home-screen widgets, advanced timeline visualization, additional customization.

## 26. Version 2 Scope

Secure document vault, advanced photo memories, cloud backup, advanced exports, health ecosystem integrations, provider information, insurance, PRISM Resources, PRISM Insights, PRISM Assistant, optional PRISM Connect.

**Community should NOT be part of V1.** Do not turn PRISM into a social network.

### AI strategy (V2, optional)

**PRISM Assistant** may eventually answer questions about the user's *own* stored information ("When was my last appointment?" "Show my milestones from the past year." "When did I start tracking this medication?"). AI must **not**: recommend dose changes, diagnose, recommend stopping medication, determine surgery eligibility or readiness, or make medical decisions of any kind.

If AI is implemented: use minimum necessary data, respect user authorization scoping, never expose unrelated records, never train external models on private user data without explicit consent and legal basis, log AI access carefully, and let users understand what data is being used.

### Business model

Core PRISM experience is free. Potential PRISM+ (premium, unvalidated): secure document vault, advanced backups/exports, photo memories, advanced customization, additional storage. Validate willingness to pay before overbuilding premium functionality. **Never monetize through selling personal transition or health data.**

## 27. Testing Requirements

- **Unit:** validation, personalization logic, recurrence logic, date handling, utilities, permissions.
- **Integration:** authentication, database, RLS, CRUD flows, reminders, module configuration.
- **End-to-end:** signup, onboarding, enabling modules, adding/logging medication, adding injection, appointment, milestone, journal, customization, export, account deletion.
- **Accessibility:** screen reader, dynamic text, keyboard navigation where applicable, contrast, reduced motion, touch target sizes.
- **Security:** unauthorized database access, RLS, storage permissions, authentication boundaries, session handling, sensitive logging, notification privacy.

Full detail: [`TECHNICAL_BIBLE.md`](./TECHNICAL_BIBLE.md) §18.

## 28. Development Roadmap

**Phase 1 — Foundation:** repository, monorepo, Expo app, Next.js web app, Supabase, environment configuration, authentication, database migrations, RLS, design tokens, theme system, navigation, core UI components.

**Phase 2 — Identity:** onboarding, profile, module selection, personalization engine, settings.

**Phase 3 — TODAY:** dashboard, reminder engine, personalized cards, Quick Add.

**Phase 4 — CARE:** medications, medication logs, reminders, injections, appointments, labs, procedures.

**Phase 5 — JOURNEY:** timeline, milestones, journal, memories.

**Phase 6 — YOU:** customization, privacy, app lock, notifications, accessibility, appearance, data export, account deletion, legal journey.

**Phase 7 — Hardening:** offline behavior, security audit, accessibility audit, performance optimization, error handling, analytics privacy review, E2E tests, documentation.

**Phase 8 — Beta:** internal testing, closed beta, collect feedback, fix critical issues, review retention, review trust/privacy feedback, iterate.

**Phase 9 — Launch:** production Supabase, production environment, app store configuration, Privacy Policy, Terms, support system, data deletion process, security review, final accessibility review, release.

### Implementation milestones (for Claude Code specifically)

`01` Repository & architecture → `02` Supabase & authentication → `03` Database & RLS → `04` Design system → `05` Onboarding & personalization → `06` TODAY → `07` CARE → `08` JOURNEY → `09` YOU → `10` Privacy & security → `11` Accessibility → `12` Testing → `13` Polish → `14` Beta readiness.

**After each milestone:** run tests, run type checking, run linting, verify the build, inspect affected screens, fix regressions, update documentation. Do not proceed to the next milestone with known regressions.

### Git conventions

Meaningful, conventional commits (`feat(auth): add email authentication`, `fix(today): hide disabled modules`, `security(storage): restrict document access`). Avoid giant meaningless commits ("finished app," "updates," "stuff," "changes").

## 29. Acceptance Criteria

PRISM MVP is complete when a new user can:

1. Create an account
2. Verify email
3. Complete onboarding
4. Select modules
5. Optionally provide identity information
6. Optionally configure care
7. Reach a personalized TODAY screen
8. Add a medication
9. Log medication
10. Create a reminder
11. Record an injection
12. Create an appointment
13. Create a milestone
14. Create a journal entry
15. View their timeline
16. Customize enabled (P0) modules
17. Use private notifications
18. Enable app lock
19. Export their data
20. Delete their account
21. Use the application **without** providing gender
22. Use the application **without** providing pronouns
23. Use the application **without** HRT
24. Use the application **without** injections
25. Use the application **without** surgery
26. Use the application **without** a journey start date

Items 21–26 are as load-bearing as 1–20 — an MVP that only satisfies the first 20 has not met this specification. Lab and procedure record creation are intentionally **not** on this list — Labs and Procedures are P1 (§25), per the resolved decision in [`DECISIONS.md`](./DECISIONS.md).

## 30. Quality Gates

Before declaring MVP complete, verify:

- **Functionality:** all P0 flows work; CRUD operations work; persistence works; navigation works; reminders work.
- **Security:** RLS verified; unauthorized access rejected; private storage protected; secrets protected; sensitive logging eliminated.
- **Privacy:** notification privacy works; app lock works; analytics reviewed; export works; deletion works.
- **Accessibility:** screen reader tested; Dynamic Type tested; contrast tested; reduced motion tested; touch targets tested.
- **Reliability:** network failures handled; offline states handled; forms recover correctly; no silent data loss.
- **Design:** consistent tokens; consistent typography; consistent components; restrained spectrum usage; dark mode polished; light mode polished.
- **Documentation:** README updated; architecture documented; environment documented; database documented; security documented; setup instructions verified.

### UX quality bar

Every screen needs intentional spacing, correct typography, meaningful hierarchy, proper loading behavior, empty states, error states, keyboard behavior, accessibility, correct navigation, and consistent components. **Do not accept placeholder UI as finished functionality.**

### Design review checklist (per screen, before approval)

- **Product** — does it serve the user's journey? is it necessary? does it avoid assumptions?
- **UX** — is the purpose obvious? is the primary action obvious? is the flow simple?
- **Visual** — does it look like PRISM? is the hierarchy clear? is spectrum color restrained?
- **Accessibility** — can it be used without color? does Dynamic Type work? does screen reader navigation work? are touch targets large enough? does Reduce Motion work?
- **Privacy** — is sensitive data minimized? could this expose private information? are notifications safe?
- **Engineering** — is data persisted correctly? is RLS correct? are errors handled? is offline behavior defined? are tests present?

### The PRISM Test (applies to every product decision)

1. Does this feel like PRISM?
2. Does this assume something about the user?
3. Is this information actually necessary?
4. Does this make the user's journey easier?
5. Is the interface calmer than the problem?
6. Is privacy protected?
7. Does this imply a finish line?
8. Does accessibility win when aesthetics conflict?

## 31. Non-Negotiable Product Rules

These rules override convenience:

1. No universal transition path.
2. No assumptions about identity or medical care.
3. Privacy by default.
4. No medical advice.
5. No transition progress score.
6. No transition finish line.
7. Disabled modules hide data; they do not delete it.
8. User data belongs to the user.
9. Accessibility is not optional.
10. Do not sacrifice usability for the PRISM aesthetic.
11. Do not manufacture content when the user has nothing to show.
12. Do not turn PRISM into a social network.
13. Do not monetize by selling personal data.
14. Do not make AI the center of the product.
15. Every feature must make the journey easier to manage, understand, remember, document, or protect.

The full, dated decision log (including anything added after this document was written) lives in [`DECISIONS.md`](./DECISIONS.md).

---

## Appendix A — Build Directive for Claude Code

**Your role:** lead engineer, product engineer, UI engineer, QA engineer, and technical architect responsible for building PRISM. You have authority to make implementation decisions within the constraints of this specification. Build the application end-to-end. Do not repeatedly ask the product owner for decisions that can reasonably be made from this specification. When implementation details are unspecified, choose the simplest production-quality solution that preserves, in order: **privacy, accessibility, security, maintainability, personalization, PRISM's design language.**

**Primary objective:** build a production-quality MVP of PRISM. The final application must run, authenticate users, persist user data, enforce ownership, personalize the experience, provide the specified navigation, implement core CARE and JOURNEY functionality, implement YOU/settings, protect sensitive information, provide accessible UI, handle errors/loading/empty states/offline conditions, pass automated tests, and be documented. **Do not build a static prototype pretending to be a working application.**

### Implementation rules

- **Rule A — Inspect first.** Before changing anything: inspect the repository, package configuration, existing source, environment configuration, and Supabase configuration; determine what already works; preserve useful existing implementation. Do not destroy working functionality unnecessarily.
- **Rule B — Build incrementally.** Implement in vertical slices (e.g. Medication: UI → validation → database → RLS → persistence → loading → errors → tests). Do not build 50 screens with fake data and postpone backend integration.
- **Rule C — Real data.** MVP functionality must use real persistence. Do not rely on hard-coded mock data except for intentional development fixtures.
- **Rule D — Security first.** Implement RLS before exposing production data through UI. Test unauthorized access.
- **Rule E — Reusable components.** Do not duplicate UI code across screens when a reusable PRISM component should exist.
- **Rule F — Keep personalization centralized.** Do not hard-code dashboard logic separately into each screen; build a clear personalization layer (see §05).
- **Rule G — Do not overbuild.** Do not implement V2 features during MVP unless required to support the architecture.

### Final instruction

Build PRISM as if it will be trusted with someone's most personal information. Do not optimize for novelty, engagement, or screen time. Optimize for **trust, clarity, privacy, personalization, accessibility, reliability.**

And above everything else:

# Your journey. Your way.
