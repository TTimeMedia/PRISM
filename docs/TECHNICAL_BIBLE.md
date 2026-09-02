# PRISM Technical Bible

Version: 1.0
Status: Engineering specification
Tagline: Your journey. Your way.

This document defines _how PRISM is built_. It assumes familiarity with [`PRODUCT_BIBLE.md`](./PRODUCT_BIBLE.md) for product intent. Screen-by-screen implementation detail lives in [`SCREEN_BIBLE.md`](./SCREEN_BIBLE.md); visual implementation detail lives in [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md); the executable synthesis of all of it lives in [`MASTER_BUILD_SPEC.md`](./MASTER_BUILD_SPEC.md).

---

## 1. Engineering Objective

Build PRISM as a secure, personalized, mobile-first application that adapts its experience to the individual user. The architecture must support:

- Personalized modules
- Optional identity information
- Optional medical/care information
- Private user data
- Secure authentication
- Reliable reminders
- Offline-capable workflows
- Future expansion
- Accessibility
- Cross-platform mobile development

**The architecture must not encode assumptions about what a transgender journey looks like.** This is an engineering constraint, not just a design one: no schema field should be required unless it is structurally necessary (e.g., a row's primary key), and no dashboard logic should special-case a specific transition path.

## 2. Recommended Stack

| Layer    | Technology                                                                                                              |
| -------- | ----------------------------------------------------------------------------------------------------------------------- |
| Mobile   | React Native + Expo (current stable tooling), targeting iOS and Android                                                 |
| Backend  | Supabase — PostgreSQL, Supabase Auth, Row Level Security, Supabase Storage, Edge Functions where appropriate            |
| Web      | Next.js — marketing site, documentation, support, privacy/legal pages; a future admin interface may be added separately |
| Hosting  | Vercel (for the Next.js web application)                                                                                |
| Database | PostgreSQL through Supabase — the authoritative source of truth for synchronized application data                       |

Do not make social login a requirement for MVP; email + password + verification is sufficient to start (§7).

## 3. Architectural Principles

1. **Security first** — Sensitive user data must never be accessible merely because a frontend request knows another user's ID. Database authorization must enforce ownership.
2. **Server is authoritative** — The client must never be trusted to enforce security. The frontend can hide functionality; the backend must enforce permissions.
3. **Modular by design** — PRISM consists of independent modules that can be independently enabled, disabled, and expanded.
4. **Configuration over hard-coding** — Do not hard-code the user's personalized dashboard. It is generated from **user configuration + current data + relevance rules**.
5. **Progressive disclosure** — Do not ask users for information until it's needed. If someone doesn't enable medication tracking, don't ask for medication details during onboarding.
6. **Accessibility is architecture** — Accessibility cannot be added at the end; components must be designed with it from the beginning.
7. **No sensitive information in logs** — Never log journal contents, medication names unnecessarily, dosages, gender identity, pronouns, legal information, medical records, document contents, or private photos. Production logs should contain identifiers necessary for debugging, not sensitive user content.

## 4. Repository Architecture

Recommended monorepo:

```
prism/
├── apps/
│   ├── mobile/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── types/
│   │   └── assets/
│   └── web/
│       ├── app/
│       ├── components/
│       ├── lib/
│       └── public/
├── packages/
│   ├── ui/
│   ├── database/
│   ├── types/
│   ├── config/
│   └── validation/
├── supabase/
│   ├── migrations/
│   ├── functions/
│   ├── seed/
│   └── config.toml
├── docs/
│   ├── PRODUCT_BIBLE.md
│   ├── TECHNICAL_BIBLE.md
│   ├── SCREEN_BIBLE.md
│   ├── DESIGN_SYSTEM.md
│   ├── MASTER_BUILD_SPEC.md
│   ├── SECURITY.md
│   └── DECISIONS.md
├── package.json
├── README.md
├── pnpm-workspace.yaml
└── .gitignore
```

## 5. Mobile Architecture

Use feature-oriented organization — each feature owns its screens, components, hooks, validation, service logic, and types. Avoid giant global files.

```
features/
├── auth/
├── onboarding/
├── today/
├── care/
│   ├── medications/
│   ├── injections/
│   ├── appointments/
│   ├── labs/
│   └── procedures/
├── journey/
│   ├── timeline/
│   ├── milestones/
│   ├── journal/
│   └── memories/
├── you/
│   ├── profile/
│   ├── customization/
│   ├── privacy/
│   ├── notifications/
│   ├── accessibility/
│   └── data/
└── settings/
```

### Navigation

Primary navigation is a tab bar: **TODAY / CARE / JOURNEY / YOU**. Secondary navigation is contextual — e.g. CARE contains Medications, Injections, Appointments, Labs, Procedures as its own sub-navigation.

## 6. Web Architecture

Next.js, hosted on Vercel. Initial responsibilities: marketing website, documentation, support, and privacy/legal pages. A future administrative interface may be added as a separate concern rather than folded into the marketing site.

## 7. Supabase Architecture

Supabase provides PostgreSQL, authentication, Row Level Security, storage, and Edge Functions. Supabase Auth owns authentication identities; application tables reference the authenticated user's UUID and never duplicate credential storage.

### Authentication

- Use Supabase Auth.
- Initial (MVP) methods: email + password, password recovery, email verification.
- Future authentication methods (e.g., social login, passkeys) can be added later — they are not required for MVP.

### User Lifecycle

**New user:**

```
Account Created → Email Verification → Onboarding → Profile Creation
→ Module Configuration → Privacy Configuration → Today
```

**Returning user:**

```
Authentication → Load Profile → Load Module Configuration → Load Relevant Data → Today
```

## 8. Database Architecture

- Use UUIDs for primary keys.
- Every user-owned record includes `user_id` where appropriate.
- Mutable records carry `created_at` and `updated_at`.
- Store timestamps in UTC internally; display in the user's local timezone.

### Core tables

`profiles`, `modules`, `medications`, `medication_logs`, `injections`, `appointments`, `labs`, `procedures`, `milestones`, `journal_entries`, `memories`, `legal_items`, `documents`, `reminders`, `settings`. All 15 tables are created during Foundation/CARE/JOURNEY migrations regardless of P0/P1 UI scope — the architecture anticipates P1 features (Labs, Procedures, Legal Journey, Memories, Documents) even though their screens ship later; see [`MASTER_BUILD_SPEC.md`](./MASTER_BUILD_SPEC.md) §18 and §24–25 for exactly which tables' data is exposed in the MVP UI.

Full column-level schema for each table is defined in [`MASTER_BUILD_SPEC.md`](./MASTER_BUILD_SPEC.md) §Database, which is the canonical schema reference for implementation. Summary of key modeling decisions:

- **`profiles`** — everything except `user_id` is optional (display_name, pronouns, gender, birthday, journey_start_date, profile_photo_url all nullable).
- **`modules`** — one row per `(user_id, module_key)` with an `enabled` boolean and a `configuration` JSONB blob. New modules plug into this table without schema changes or dashboard rewrites (see §14 Future-Proofing).
- **`medications`** — `dosage_text` is user-entered, informational data only; PRISM never calculates or recommends dosage.
- **`medication_logs`** — status is one of `scheduled | completed | skipped | missed | skipped_intentionally`; the neutral status vocabulary is a product requirement (see [`PRODUCT_BIBLE.md`](./PRODUCT_BIBLE.md) §8.4 No Judgment), not just a UX preference.
- **`injections`** — `site` is a tracking label (e.g. `left_thigh`, `not_tracked`), never a medical recommendation.
- **`labs`** — PRISM stores lab records; it does not interpret results.
- **`legal_items`** — status is one of `not_started | preparing | filed | in_progress | approved | complete`.
- **`documents`** — requires separate secure storage architecture; `storage_path` must never be publicly resolvable (see §11 File Storage below).
- **`reminders`** — `notification_style` is one of `private | standard | custom`; `private` is the default (see [`SECURITY.md`](./SECURITY.md)).
- **`settings`** — one row per user; `notification_privacy` defaults to `TRUE`.

### API / data access patterns

- All application data access goes through Supabase's PostgREST/RPC layer or Edge Functions — never a bespoke server that re-implements authorization.
- Reads and writes are scoped by the authenticated session; the client never passes another user's ID to fetch or mutate data, and RLS (§9) is the enforcement layer that makes that unexploitable even if it did.
- Prefer typed database access (generated types from the Supabase schema) over hand-written query strings, to keep `packages/database` and `packages/types` as the single source of truth for the data shape used across mobile and web.

## 9. Security Architecture

### Row Level Security

Every user-owned table must have RLS enabled. The fundamental policy: an authenticated user may only access records where `user_id = auth.uid()`. Policies must exist for SELECT, INSERT, UPDATE, and DELETE as appropriate. **Do not rely on frontend filtering.**

### Storage Security (File Storage)

Private storage buckets are used for sensitive files — candidate buckets: `profile-photos`, `memories`, `documents`, `attachments`. Storage policies must verify ownership. **Never create public buckets for sensitive PRISM information.** Storage paths must never be publicly resolvable; use authenticated access and short-lived signed URLs where a temporary public link is genuinely necessary.

### Data Ownership

The user owns their information. PRISM must provide mechanisms to view, edit, delete, export, and (eventually) migrate it.

### Account Deletion

Account deletion must: (1) confirm the user's intention, (2) explain what will be deleted, (3) delete application records, (4) delete associated storage files, (5) delete the authentication account, (6) ensure no orphaned sensitive data is left behind. Deletion must be testable — cover it in integration tests, not just manual QA.

### Data Export

Initial export supports structured data: JSON and CSV preferred; human-readable PDF is a future enhancement. Export should include the user's relevant records comprehensively enough to be genuinely useful, not a token gesture.

Full security posture (secrets management, logging restrictions, analytics restrictions, incident considerations) is documented in [`SECURITY.md`](./SECURITY.md).

## 10. Personalization Engine (Technical View)

TODAY is generated dynamically, never hard-coded per user.

**Inputs:** `profile`, `enabled_modules`, `medications`, `medication_logs`, `appointments`, `labs`, `procedures`, `milestones`, `journal_entries`, `memories`, `settings`.

**Outputs:** the engine classifies records into `due_today`, `upcoming`, `recent`, `meaningful`, `hidden`.

**Priority order:**

1. Things requiring action today
2. Upcoming items
3. Recent meaningful information
4. Optional reflection
5. Nothing — if there is nothing meaningful to show, **do not manufacture content**; show a calm empty state.

**Conceptual pipeline:**

```
getUserProfile()
  → getEnabledModules()
  → getRelevantRecords()
  → calculateTodayItems()
  → filterIrrelevantItems()
  → rankItems()
  → renderDashboard()
```

The engine must be deterministic and testable. **Personalization rule:** if a module is disabled, its content must not surface anywhere — e.g. if `medications = disabled`, no medication card appears on TODAY, in Quick Add, or in search.

### Future-proofing

The architecture must allow new modules (e.g. `resources`, `insurance`, `providers`, `voice_notes`, `ai_assistant`, `health_integrations`) to plug into the existing `modules` table and dashboard pipeline without rebuilding navigation or the TODAY engine.

## 11. Validation

Use schema validation for forms, API input, database mutations, and user configuration. Validation must occur before data reaches the database. **Never rely exclusively on client-side validation** — RLS and server-side/database constraints are the actual boundary.

## 12. State Management

Separate:

- **Server state** — Supabase/database data.
- **Local state** — UI state.
- **Persistent local state** — preferences and offline data where appropriate.

Do not put the entire application into one global store.

### Caching

Cache data that improves responsiveness (profile, module configuration, today's records, recent timeline). Sensitive data should not be cached indefinitely, and cache invalidation must be explicit rather than time-based guesswork.

## 13. Error Handling

Every major feature needs a defined **loading**, **empty**, **error**, and **offline** state (see also [`SCREEN_BIBLE.md`](./SCREEN_BIBLE.md) for per-screen specifications). Error states are user-facing and calm — never a raw technical message. Offline states tell the user what's happening, e.g. _"You're offline. Your changes will sync when you're back online."_

## 14. Offline Behavior

MVP supports limited offline behavior, in priority order:

1. Read today's information.
2. Read recently loaded information.
3. Log simple events.
4. Queue writes.
5. Synchronize when online.

Future versions can expand offline functionality. **Sync conflicts must never silently overwrite user data** — preserve the server record, preserve the local record where possible, resolve deterministically, and surface the conflict to the user when necessary. User data takes priority over implementation convenience.

### Timezone handling

Store absolute timestamps in UTC; convert to local time for display. Date-only records (birthdays, milestones) remain date-based rather than being pushed through timezone conversion, so a recorded date never shifts a day due to travel.

## 15. Notifications

Use native push notifications through Expo-supported infrastructure.

```
Reminder Created → Schedule Notification → Native Notification → User Action → PRISM → Record Updated
```

**Private is the default notification style.** Content:

- Private: _"Your PRISM reminder is ready."_
- Standard: _"You have something scheduled in PRISM."_
- Custom: user-defined text where appropriate.

Avoid sensitive lock-screen content by default (see [`SECURITY.md`](./SECURITY.md) for the full private-notification rationale).

## 16. Search

Universal search (see [`PRODUCT_BIBLE.md`](./PRODUCT_BIBLE.md) §11 and [`SCREEN_BIBLE.md`](./SCREEN_BIBLE.md) Screen 72–73) covers medications, appointments, labs, timeline, milestones, journal, memories, legal items, and documents. Implement as a query scoped to `user_id = auth.uid()` via RLS like every other read, using Postgres full-text search (`tsvector`/`tsquery`) or a Supabase-native equivalent rather than a third-party indexing service, to avoid sending sensitive content off-platform. Only enabled modules' content should be searchable, consistent with the personalization rule in §10.

## 17. Accessibility Architecture

Every interactive component must have an accessible label, accessible role, accessible state, and logical focus order. Touch targets must be comfortably usable. Do not depend solely on color to communicate status. Full design-level accessibility requirements are in [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) §Accessibility.

## 18. Testing Architecture

Testing layers, in order: **Unit → Integration → End-to-End → Accessibility → Security → Real-device testing.**

### Unit tests

Date calculations, reminder calculations, timeline sorting, personalization, module filtering, validation, status handling.

### Integration tests

Authentication, Supabase queries, RLS, CRUD workflows, reminder creation, offline synchronization.

### End-to-end tests (critical workflows)

- **Signup:** Create account → Verify → Onboarding → Today
- **Medication:** Add medication → Schedule → Reminder → Log → Timeline
- **Journey:** Create milestone → Timeline → Edit → Delete
- **Privacy:** Enable app lock → Close app → Reopen → Authentication required

### Security testing

Attempt to: access another user's record, guess another user's UUID, modify another user's record, access another user's file, access deleted records, bypass client-side permissions. **Every attempt must fail.**

### Performance

PRISM should feel immediate: fast cold launch, instant navigation between cached screens, optimistic UI where safe, minimal unnecessary network requests, paginated long timelines, lazy-loaded images, efficient database queries.

## 19. Environment Strategy

Maintain **development**, **staging**, and **production** environments. Never test destructive migrations directly against production.

### Environment variables

Sensitive credentials must never be committed to Git. Use environment variables for the Supabase URL, Supabase keys, API credentials, notification configuration, and analytics configuration. **Never expose service-role credentials to the mobile client.**

## 20. Development Workflow & Git Conventions

Use meaningful, conventional commits, e.g.:

```
feat(auth): add email authentication
feat(onboarding): add module selection
feat(today): build personalized dashboard
feat(care): add medication tracking
fix(reminders): correct recurring schedule
security(storage): restrict document access
```

## 21. Definition of Done

A feature is not complete because it renders. A feature is complete when:

- UI works
- Data persists
- Validation works
- Loading state works
- Empty state works
- Error state works
- Accessibility works
- Security rules exist
- Tests exist
- Offline behavior is defined
- Analytics do not leak sensitive information
- Documentation exists

## 22. Engineering Rules

1. Sensitive user data must never be accessible merely because a request knows another user's ID — enforce ownership server-side, always.
2. The dashboard is generated from configuration + data + relevance rules — never hard-coded per user or per journey type.
3. Don't ask for information before it's needed (progressive disclosure).
4. Accessibility, security, and testability are designed in from the start, not retrofitted.
5. Never log or emit-to-analytics: journal contents, medication names/dosages unnecessarily, gender identity, pronouns, legal information, medical records, document contents, private photos.
6. New modules must plug into the existing `modules` table and TODAY pipeline without rewriting navigation.

### Engineering North Star

PRISM should feel simple on the surface while being disciplined underneath.

The user should see: **Your journey. Your way.**
The engineering team should see: **Secure. Modular. Personalized. Testable. Extensible.**

Both describe the same product.
