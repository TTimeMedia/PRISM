# PRISM Build Status

**STATUS: MILESTONE 05 (JOURNEY) COMPLETE**
**CURRENT MILESTONE: 06 — YOU**

Last updated: 2026-09-02 (JOURNEY milestone complete)

This document tracks where PRISM actually is against [`MASTER_BUILD_SPEC.md`](./MASTER_BUILD_SPEC.md)'s implementation milestones. It is a living document — update it at the end of every milestone, not just at the start of the project. It does not restate product or technical detail; it points at the document that owns each fact.

---

## 1. Current Project Status

PRISM's Foundation milestone (`01`), Authentication & Identity milestone (`02`), Personalization (Onboarding) milestone (`03`), CARE milestone (`04`), and JOURNEY milestone (`05`) are all complete. Foundation established the monorepo, both apps, all shared packages, the full Supabase schema with RLS, the design system foundation, the navigation shell, and cross-cutting infrastructure. Authentication & Identity built the seven Authentication screens with real working session handling, email verification, and password recovery via deep link. Personalization (Onboarding) built all 12 onboarding screens, the resumable onboarding-step routing infrastructure, module selection driven by the user's Care Setup answers, and the personalized TODAY engine with a real, dynamic TODAY screen. CARE built full CRUD for Medications (with dose logging and Pause/Resume), Injections, and Appointments across all 12 P0 CARE screens. JOURNEY built Journey Home, a unified Timeline (medications, injections, appointments, milestones, and journal entries in one chronological view — never a second data store), full CRUD for Milestones and Journal, and two new named design-system components (`PRISMTimeline`, `PRISMMilestone`) — see §9 (Foundation), §10 (Authentication & Identity), §11 (Personalization / Onboarding), §12 (CARE), and §13 (JOURNEY) below for what was built and how each was verified. No YOU feature screens exist yet; that begins with Milestone 06.

## 2. Documentation Status

All seven core documents plus the README are complete, cross-linked, and consistent as of this review:

| Document                                         | Status                                                                                                         |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| [`PRODUCT_BIBLE.md`](./PRODUCT_BIBLE.md)         | Complete — MVP definition updated to match the resolved P0/P1 split                                            |
| [`TECHNICAL_BIBLE.md`](./TECHNICAL_BIBLE.md)     | Complete                                                                                                       |
| [`SCREEN_BIBLE.md`](./SCREEN_BIBLE.md)           | Complete — all 78 screens tagged P0/P1 where relevant                                                          |
| [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)         | Complete                                                                                                       |
| [`MASTER_BUILD_SPEC.md`](./MASTER_BUILD_SPEC.md) | Complete — MVP scope, database scope table, acceptance criteria, and P1 scope all updated and cross-consistent |
| [`SECURITY.md`](./SECURITY.md)                   | Complete                                                                                                       |
| [`DECISIONS.md`](./DECISIONS.md)                 | Complete — MVP scope contradiction resolved and recorded; two new decisions recorded from this review          |
| [`README.md`](../README.md)                      | Complete                                                                                                       |
| `archive/PRISM_MASTER_SOURCE.docx`               | Preserved, unchanged                                                                                           |

No further documentation-only work is scheduled before Foundation begins. Documentation is expected to keep changing _alongside_ implementation (see [`README.md`](../README.md) §How Claude Code Should Use This Documentation, item 6) — that is normal and required, not a sign this document is out of date.

## 3. MVP Scope (P0)

Confirmed by explicit product-owner decision on 2026-09-01 (see [`DECISIONS.md`](./DECISIONS.md)):

Authentication · Onboarding · Personalization · TODAY · Medications · Medication reminders/logging · Injections · Appointments · Timeline · Milestones · Journal · Customize PRISM · Privacy · Notifications · App lock · Accessibility · Data export · Account deletion.

Full detail: [`MASTER_BUILD_SPEC.md`](./MASTER_BUILD_SPEC.md) §24.

## 4. P1 Scope (Next Release)

Labs · Procedures · Legal Journey · Memories · Documents · Universal Search · Advanced recurring schedules · Supply tracking · Enhanced journal functionality.

The full 15-table database schema and the `modules` table's complete set of module keys are built during Foundation regardless — P1 status defers _screens_, not schema. Full detail: [`MASTER_BUILD_SPEC.md`](./MASTER_BUILD_SPEC.md) §25.

## 5. Development Milestones

Per [`MASTER_BUILD_SPEC.md`](./MASTER_BUILD_SPEC.md) §28:

`01` Repository & architecture → `02` Supabase & authentication → `03` Database & RLS → `04` Design system → `05` Onboarding & personalization → `06` TODAY → `07` CARE → `08` JOURNEY → `09` YOU → `10` Privacy & security → `11` Accessibility → `12` Testing → `13` Polish → `14` Beta readiness.

### Current Milestone

**YOU** (milestone `06`) — not yet started. Profile, Customize PRISM (P0 module toggles), Notifications, Privacy, App lock, Accessibility, Appearance, Data export, and Account deletion are built here.

### Completed Milestones

- **Foundation** (milestone `01`) — complete as of 2026-09-02. See §9 below for what was built and how it was verified.
- **Authentication & Identity** (milestone `02`) — complete as of 2026-09-02. See §10 below.
- **Personalization (Onboarding)** (milestone `03`) — complete as of 2026-09-02. See §11 below.
- **CARE** (milestone `04`) — complete as of 2026-09-02. See §12 below.
- **JOURNEY** (milestone `05`) — complete as of 2026-09-02. See §13 below.

### Remaining Milestones

Nine (`06` through `14`), starting with YOU.

## 6. Known Open Decisions

The MVP scope contradiction that was open at the end of the initial documentation pass has been resolved (see [`DECISIONS.md`](./DECISIONS.md)). No product-level decisions are currently open. The following are **implementation-level** choices intentionally left to the engineer at the point they're needed, per this specification's own philosophy of not over-specifying (`MASTER_BUILD_SPEC.md` Appendix A): they should be made and then recorded in `DECISIONS.md` (if product-visible) or left as ordinary code, not raised back to the product owner.

- **`reminders.recurrence` JSON shape** — the column exists and its purpose is specified (§`MASTER_BUILD_SPEC.md` §18), but the internal JSON structure is not yet designed; the `reminders` table itself has no CRUD built yet. (`medications.frequency_config`'s shape, by contrast, is already resolved — `frequencyConfigSchema` in `packages/validation/src/care.ts` — and is exercised by real Add/Edit Medication forms as of the CARE milestone.) Design `recurrence`'s shape when the actual reminder-scheduling engine is built (see §14 Known Technical Risks).
- **Push notification delivery provider** — `TECHNICAL_BIBLE.md` §15 specifies "native push notifications through Expo-supported infrastructure" but doesn't name a specific service. Expo's own push notification service is the natural default given the Expo-based stack; per `SECURITY.md` §6 (security red flags apply to any third-party service touching user data), give it one explicit privacy review before the Notifications work in milestone `09`/`10`, same as any other third-party dependency — not a blocker, just don't skip the review because it's the "obvious" default.
- **Icon library** — `DESIGN_SYSTEM.md` §13 describes the required visual characteristics (geometric, rounded, simple, thin-to-medium stroke) but does not name a library. Pick one during the Design System milestone (`04`) and record the choice in `DECISIONS.md` since it affects every screen.
- **Data export file structure** — `SECURITY.md` §9 specifies formats (JSON/CSV) and a completeness bar but not whether export is one combined file or a per-table bundle. Decide during milestone `10` (Privacy & security).
- **Biometric/local-auth library** — an Expo-ecosystem implementation detail (e.g. `expo-local-authentication`), not a product decision.

None of the above blocks starting Foundation (`01`); none of them are needed until later milestones.

## 7. Implementation-Readiness Audit

Performed against `MASTER_BUILD_SPEC.md`, `SCREEN_BIBLE.md`, `TECHNICAL_BIBLE.md`, `DESIGN_SYSTEM.md`, and `SECURITY.md` as of this review. Method: for each area, check whether an engineer starting cold could proceed without asking a basic product question.

| Area                   | Readiness | Notes                                                                                                                                |
| ---------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Navigation             | Ready     | 4-tab structure, contextual sub-navigation fully specified                                                                           |
| Screen requirements    | Ready     | All 78 screens specified with purpose/content/actions; P0/P1 now unambiguous                                                         |
| Database models        | Ready     | Full 15-table schema with columns/types/defaults; two JSON-shape details deferred (§6)                                               |
| User ownership         | Ready     | `user_id` on every table; ownership model unambiguous                                                                                |
| RLS                    | Ready     | Policy pattern (`user_id = auth.uid()`) and required policy types specified; SQL itself is Foundation-milestone work, not a spec gap |
| Personalization        | Ready     | Engine pipeline, priority order, and P0/P1 module-key scoping fully specified                                                        |
| Onboarding             | Ready     | All 12 screens, fields, and conditional logic specified                                                                              |
| Notification behavior  | Ready     | Content rules and pipeline specified; provider choice is a Foundation-time default (§6)                                              |
| App lock               | Ready     | Methods, fallback, and lock-screen content restrictions specified                                                                    |
| Accessibility          | Ready     | Support matrix and touch-target sizes specified consistently across documents                                                        |
| Error states           | Ready     | Approved copy and interaction pattern specified globally                                                                             |
| Loading states         | Ready     | Pattern (skeletons over spinners, no artificial delay) specified                                                                     |
| Empty states           | Ready     | Approved copy specified per feature area                                                                                             |
| Offline behavior       | Ready     | MVP priority order and conflict-resolution rule specified; exact sync algorithm is Hardening-milestone work, not a spec gap          |
| Authentication         | Ready     | Methods, verification, recovery, and enumeration protection specified                                                                |
| Data export            | Ready     | Format and completeness bar specified; file structure is a milestone-10 detail (§6)                                                  |
| Account deletion       | Ready     | Explicit 6-step sequence specified                                                                                                   |
| Design tokens          | Ready     | Exact hex values, spacing, radius, and typography scale specified                                                                    |
| Component requirements | Ready     | Named component set with required interaction states specified                                                                       |
| MVP boundaries         | Ready     | Resolved and consistent across all documents as of this review (§3–4)                                                                |

**Genuinely blocking items found: none.** The one real blocker this review surfaced — Customize PRISM and Quick Add both listing all ten module keys, including five now deferred to P1, which would have dead-ended a user tapping a toggle with no screen behind it — was resolved during this same review (see [`DECISIONS.md`](./DECISIONS.md) §Customize PRISM and Quick Add expose only P0 modules until P1 ships) and is reflected in `MASTER_BUILD_SPEC.md`, `SCREEN_BIBLE.md`, and `PRODUCT_BIBLE.md`. No requirements were invented beyond what was needed to close that specific gap.

## 8. Implementation Checklist

Unchecked — nothing has been built yet. Update this checklist at the end of each milestone; do not mark an item done until it meets the Definition of Done in [`TECHNICAL_BIBLE.md`](./TECHNICAL_BIBLE.md) §21 (UI, persistence, validation, loading/empty/error states, accessibility, security, tests, offline behavior, privacy-safe analytics, documentation — not just "it renders").

### Foundation

- [x] Repository architecture (monorepo layout per `TECHNICAL_BIBLE.md` §4)
- [x] React Native / Expo app scaffolded
- [x] Next.js web foundation (marketing/support/legal pages)
- [x] Supabase project configuration
- [x] Environment configuration (dev/staging/production, documented variables)
- [x] Design tokens implemented
- [x] Shared components (`packages/ui` core set — see `DESIGN_SYSTEM.md` §27)
- [x] Navigation (TODAY/CARE/JOURNEY/YOU tab bar; placeholder screens only — contextual sub-navigation is built alongside each feature in its own milestone)
- [x] Error handling (global error boundary, standard error/loading/empty state components)
- [x] Testing infrastructure (unit/integration runners wired up; E2E runner is not yet configured — deferred to the Testing milestone (`12`) since there are no real screens to drive yet)

### Authentication

- [x] Sign up
- [x] Sign in
- [x] Email verification
- [x] Password recovery (with enumeration protection)
- [x] Session handling

### Personalization

- [x] Onboarding (all 12 screens)
- [x] Module selection (P0 modules only)
- [x] Profile
- [x] Journey stage
- [x] Care configuration
- [x] Personalized TODAY (engine + dynamic cards)

### Care

- [x] Medications (Add/Detail/Edit/Pause-Resume/Delete)
- [x] Medication logs (log a dose, chronological history with filters)
- [ ] Reminders — `reminder_enabled` is stored and editable on medications/appointments, but no push-notification delivery exists yet (see §6 — provider not yet chosen; scheduled for milestone `09`/`10`)
- [x] Injections (log + history)
- [x] Appointments (Add/Detail/Edit/Delete)

### Journey

- [x] Timeline (medications/injections/appointments/milestones/journal entries, unified)
- [x] Milestones (Add/Detail/Edit/Delete, suggested titles)
- [x] Journal (Write/Detail/Edit/Delete, free-text mood, tags)

### YOU

- [ ] Profile
- [ ] Customize PRISM (P0 module toggles)
- [ ] Notifications
- [ ] Privacy
- [ ] App lock
- [ ] Accessibility
- [ ] Appearance
- [ ] Data export
- [ ] Account deletion

### Quality

- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Accessibility testing
- [ ] Security testing
- [ ] Offline behavior testing
- [ ] Privacy review
- [ ] Beta readiness

## 9. Foundation Milestone (01) — Completion Notes

Completed 2026-09-02. This section records what was built, the engineering decisions made along the way that are internal (not product-visible, so not duplicated in `DECISIONS.md`), and how the milestone was verified.

### What was built

- **Monorepo**: pnpm workspaces (`apps/*`, `packages/*`), shared strict `tsconfig.base.json`, root scripts for dev/build/typecheck/lint/format/test across all workspace projects.
- **`apps/mobile`**: Expo + TypeScript + Expo Router, feature-oriented folder structure (`features/{auth,onboarding,today,care/*,journey/*,you,settings}` — reserved with `README.md` placeholders where screens aren't built yet), the TODAY/CARE/JOURNEY/YOU tab navigation shell with structural placeholder screens, global error boundary, offline banner, keyboard-aware screen wrapper, light/dark theme support, accessibility foundation (semantic roles/labels, Reduce Motion respected, minimum touch targets), Supabase client with platform-aware session storage, React Query for server state, Zustand+AsyncStorage for local persistent preferences (deliberately small — see `lib/store/appStore.ts`'s own doc comment on why it must not grow into a second database).
- **`apps/web`**: Next.js marketing homepage foundation only, no product functionality, no Supabase dependency.
- **`packages/types`**: single source of truth for all 15 entity row shapes and the P0/P1 module-key partition.
- **`packages/config`**: environment variable access (`requireEnv`).
- **`packages/validation`**: Zod schemas for every P0 (and stubbed P1) form, shared between client and future server use.
- **`packages/database`**: full generated `Database` type covering all 15 tables, typed Supabase client factory.
- **`packages/ui`**: design tokens (colors, typography, spacing, radius, motion, shadows) exactly per `DESIGN_SYSTEM.md`, `ThemeProvider`, and the full named component set (18 components) with interaction states.
- **`supabase/`**: `config.toml`, 8 migrations implementing the full 15-table schema exactly per `TECHNICAL_BIBLE.md` (no invented medical logic, no dosing/hormone calculations), RLS policies on every user-owned table scoped to `auth.uid()`, storage bucket RLS, and a committed adversarial RLS test suite.

### Engineering decisions (internal — not product-visible, so not recorded in `DECISIONS.md`)

- **`lucide-react-native` bumped to `^1.39.0`** (from the `^0.475.0` initially referenced) — the `0.x` line has no React 19 peer support; verified against the package's own published `peerDependencies` before choosing it.
- **pnpm build-script allowlist**: `"pnpm": {"onlyBuiltDependencies": ["esbuild", "unrs-resolver"]}` added to root `package.json` instead of running interactive `pnpm approve-builds`, since this environment is non-interactive and pnpm 10 blocks postinstall scripts by default.
- **Metro config fix (`apps/mobile/metro.config.js`)**: `disableHierarchicalLookup` was removed. Combined with a restricted `nodeModulesPaths`, it broke resolution of pnpm's nested transitive dependencies — e.g. `@tanstack/query-core`, which pnpm correctly nests inside `@tanstack/react-query`'s own `node_modules` but which only Metro's default hierarchical lookup (walking up the directory tree from the requiring file) can find. This was caught by `expo export --platform web` failing with `Unable to resolve module @tanstack/query-core`, fixed, and re-verified. `unstable_enableSymlinks` is kept, since pnpm still needs symlink-following for workspace packages.
- **Supabase auth session storage is platform-aware** (`apps/mobile/lib/supabase/storage.ts`): `AsyncStorage` on native, a guarded `localStorage`-backed adapter on web that no-ops when `localStorage` is undefined. The previous unconditional `AsyncStorage` usage crashed with `ReferenceError: window is not defined` during Expo Router's static web export, because AsyncStorage's own web implementation touches `window.localStorage` at call time, and static export renders in Node with no `window`. Caught and fixed the same way as the Metro issue.
- **Mobile Jest configuration**: `jest-expo`'s own default `transformIgnorePatterns` is used unmodified (an earlier hand-written override had a malformed regex, found by reading the preset's actual source rather than guessing); `react-native-worklets/jest/resolver.js` is wired as the `resolver` (its own documented fix for worklets native-module errors under the test renderer); `@react-native-async-storage/async-storage` and `lucide-react-native` (which ships ESM-only `.mjs` in this version, unparseable by Jest's default transform) are redirected via `moduleNameMapper` to their CJS/mock builds; the `renderWithProviders` test helper passes explicit `initialMetrics` to `SafeAreaProvider` (its own documented testing pattern), since it never resolves a native frame measurement under the test renderer otherwise.
- **RLS verification methodology**: Docker (needed for the full local Supabase stack) was unavailable in this environment, so RLS was verified against a real local PostgreSQL 16 instance with hand-built minimal `auth`/`storage` schema stand-ins faithful to Supabase's real ones. The committed, idempotent adversarial test suite (`supabase/tests/database/rls_isolation_test.sql`) proves cross-user access is blocked on every user-owned table and on storage objects, that CHECK constraints reject invalid enum values, that the `settings` single-row-per-user invariant holds, and that the `handle_new_user()` bootstrap trigger works. All temporary test-database artifacts were removed after verification; the committed test file is the only permanent trace, and it documents how to re-run it against a real local Supabase project.
- **ESLint flat config** (`apps/mobile/eslint.config.js`) added using `eslint-config-expo/flat`, required for ESLint 9 (no flat config shipped by default in the Expo template used).

### Verification performed (Quality Gate)

- `pnpm install` succeeds cleanly across all 8 workspace projects.
- `pnpm -r typecheck` passes with zero errors.
- `pnpm -r test` passes 23/23 tests (mobile Jest 4, web Vitest 2, `packages/types` Vitest 3, `packages/validation` Vitest 14).
- ESLint passes with zero errors/warnings on `apps/mobile` and `apps/web`.
- Prettier formatting is clean repository-wide.
- `apps/web`: `next build` succeeds; marketing pages prerender as static content.
- `apps/mobile`: `expo export --platform web` succeeds (after the two fixes above). Visual verification was done via `expo start --web` — the dev/client-rendered path, and the relevant one, since this app's shipped web presence is the separate Next.js marketing site, not this Expo app in static-export form — in both light and dark mode, across all four tabs. Screenshots confirmed exact PRISM color tokens in both themes, the approved empty-state copy verbatim, correct active-tab highlighting, and no layout defects. Full detail in the Final Report for this milestone.
- **Non-blocking observation**: Expo Router's _static_ web export (as distinct from the dev server) shows a theme-resolution inconsistency between the server-rendered pass and client hydration — the resolved color scheme can differ between the pre-rendered HTML and the hydrated client on first paint. This did not reproduce under `expo start --web` (confirmed correct in both themes) and does not affect the native iOS/Android app. It is not a blocker because static web export is not a shipped target for this app; worth a look only if that changes.

## 10. Authentication & Identity Milestone (02) — Completion Notes

Completed 2026-09-02. Built on the auth foundation from Milestone 01 (Supabase client, `AuthProvider`, platform-aware session storage).

### What was built

- **Seven Authentication screens** (`features/auth/screens/`, routed from `app/(auth)/`): Welcome, Sign Up, Sign In, Forgot Password, Reset Password, Email Verification — see `docs/SCREEN_BIBLE.md` §4. Copy matches the spec verbatim (verified via screenshot, not just code review).
- **Root navigation guards** (`app/_layout.tsx`, `app/(auth)/_layout.tsx`): Expo Router's `Stack.Protected` gates `(tabs)` vs. `(auth)` on session state, and gates `reset-password` specifically on `isPasswordRecovery` within the auth group. The native splash screen now stays up until both fonts and the initial session check resolve, then routes straight to the correct destination — implementing Screen 01 (Splash)'s behavior without a separate routed screen.
- **`packages/validation/src/auth.ts`**: email/password/sign-up/sign-in/forgot-password/reset-password Zod schemas. Password minimum length (8) is a recorded decision — see `docs/DECISIONS.md` "Minimum password length is 8 characters".
- **`lib/auth/actions.ts`**: thin wrappers around `supabase.auth.*` (signUp, signIn, sendPasswordResetEmail, updatePassword, resendVerificationEmail, signOut) — kept separate from screens so they're unit-testable without rendering.
- **`lib/auth/errors.ts`**: maps Supabase `AuthApiError` codes to PRISM's approved, non-technical error copy (never the raw backend message) — with a handful of specific, still-calm messages (e.g. "Please verify your email before signing in.") where the user genuinely needs to know what to do next.
- **`lib/auth/deepLinks.ts` + `AuthProvider.tsx`**: password recovery works via the emailed deep link. Supabase's implicit-flow recovery link (`prism://reset-password#access_token=...&type=recovery`) is parsed by hand (there is no `window.location` on native, and the client is configured with `detectSessionInUrl: false`), the session is established via `setSession()`, and `isPasswordRecovery` is tracked manually — `setSession()` always fires a `SIGNED_IN` auth event, never `PASSWORD_RECOVERY` (that event is only emitted by the browser-only URL-detection code path this app doesn't use), so the link's own `type=recovery` parameter is the actual source of truth, not the emitted event name.
- **YOU placeholder gets a working "Sign out"** action — session handling needs a real, working way to end a session even before the rest of Screen 53 exists (Milestone `09`).

### Engineering decisions (internal — not product-visible beyond the password-length one already in `DECISIONS.md`)

- **`react-hook-form` + `@hookform/resolvers/zod`** is the form pattern for every auth screen (already a Foundation-era dependency, unused until now) — controlled inputs via `Controller`, validation via the shared Zod schemas, so client validation and the shape sent to Supabase never drift apart.
- **Enumeration protection implementation**: Forgot Password shows the fixed "If an account exists…" message on every successful submit regardless of the underlying result (Supabase's own `resetPasswordForEmail` already doesn't reveal existence). A genuine failure (network, rate limit) is deliberately _not_ folded into that same message — those aren't "does this email exist" signals, so distinguishing them doesn't weaken the protection.
- **"Open email" is best-effort** (`Linking.openURL('mailto:')`, silently no-ops on failure) — there is no universal cross-platform API to open the platform mail app's inbox specifically.
- **"Change email" on the Email Verification screen** returns to Sign Up rather than attempting to mutate a pending signup — there is no session yet to change an email against.

### Verification performed

- `pnpm -r typecheck` passes with zero errors across all 8 workspace projects (including Expo Router's own generated route types, regenerated via `expo export --platform web` after adding the new routes).
- `pnpm -r test` passes 52/52 tests — 29 new for this milestone (10 validation schema tests, 13 `lib/auth` unit tests covering deep-link parsing and error mapping, 6 screen-level tests covering navigation and form validation/submission).
- ESLint passes with zero errors/warnings; Prettier formatting is clean repository-wide.
- `expo export --platform web` bundles all 22 routes (7 auth + 4 tabs, each reachable both bare and `(group)`-prefixed) with no errors.
- **Visual verification** via `expo start --web` (dev/client-rendered — see Milestone 01's note on why this is the relevant path, not the static export): every auth screen screenshotted in both light and dark mode, confirming exact PRISM color tokens, the approved copy verbatim, and correct layout. Live interaction was also verified, not just static screenshots: submitting Sign Up with an invalid email, a too-short password, and mismatched passwords produced the correct inline red-bordered fields with the exact Zod error messages, with no crash and no raw error exposed.
- Password recovery's deep-link handling (`parseAuthDeepLink`, `isPasswordRecoveryLink`) is covered by unit tests against realistic implicit-flow URLs (including an expired-link error response), but the full end-to-end flow — a real email delivered by a live Supabase project, tapped on a device — could not be exercised in this environment (no live Supabase project, no physical device/simulator). The code follows Supabase's documented native pattern; this is the one piece of Milestone 02 that still needs a real device + live project pass before shipping.

## 11. Personalization (Onboarding) Milestone (03) — Completion Notes

Completed 2026-09-02. Built on the working session layer from Milestone 02.

### What was built

- **Migration** (`supabase/migrations/20260902120000_onboarding_profile_fields.sql`): `profiles.journey_stage` (CHECK-constrained enum), `profiles.intent text[]`, `profiles.onboarding_step text`, `settings.app_lock_enabled boolean not null default false`. Re-verified end-to-end against the same real local-Postgres RLS methodology from Milestone 01 (fresh `prism_verify` database, all 9 migrations applied in order, full adversarial RLS suite re-run, all 10 assertions still pass).
- **`packages/types/src/onboarding.ts`**: `JOURNEY_STAGES`, `INTENT_OPTIONS` (12), `CARE_SETUP_OPTIONS` (9), the 12-step `ONBOARDING_STEPS` sequence, and the pure `getNextOnboardingStep(current, {careSetup, intent})` branching function — UI-framework-free and unit-tested independently of any screen.
- **`packages/validation/src/onboarding.ts`**: Zod schemas for every onboarding screen's input (Identity, Care Setup, Injection Setup, Appointment Setup, Privacy Setup), all matching the "everything optional, always skippable" pattern the Screen Bible requires.
- **`lib/profile/queries.ts`, `lib/care/mutations.ts`**: the first real React Query mutations beyond auth — `useProfile`/`useUpdateProfile`, `useModules`/`useSetModuleEnabled`, `useSettings`/`useUpdateSettings`, plus minimal `useCreateMedication`/`useCreateAppointment` for the two onboarding screens that persist a real record. Read queries rely on RLS to scope results (no manual `user_id` filter); mutations filter by `user_id` for update targeting.
- **Onboarding routing** (`app/(onboarding)/_layout.tsx`, `lib/onboarding/routes.ts`): a third `Stack.Protected` branch in the root layout (`(tabs)` / `(onboarding)` / `(auth)`, mutually exclusive on session + `onboarding_completed`), with the onboarding stack's `initialRouteName` resuming at `profile.onboarding_step` so a user who closes the app mid-onboarding picks up exactly where they left off.
- **All 12 onboarding screens** (`features/onboarding/screens/`): Philosophy (the PRISM Manifesto, verbatim), Intent, Journey Stage, Identity, Care Setup, Medication Setup, Injection Setup, Appointment Setup, Journey Date, Privacy Setup, Building, Ready. Medication/Injection/Appointment Setup are conditionally skipped per `getNextOnboardingStep` based on the user's Care Setup and Intent answers — never shown to a user who didn't ask for that kind of tracking.
- **Personalization engine** (`services/personalization/engine.ts`): `calculateTodayItems → filterIrrelevantItems → rankItems → buildTodayDashboard`, per `TECHNICAL_BIBLE.md` §10's pipeline. Pure and deterministic (takes an explicit `now: Date`), classifying real appointments/milestones/journal entries into `due_today` / `upcoming` / `recent` / `meaningful` / `hidden` buckets, ranked due-today-first.
- **Real TODAY screen** (`features/today/screens/TodayScreen.tsx`, `lib/today/queries.ts`): a dynamic time-of-day greeting, loading skeletons, the approved empty state, and populated cards driven entirely by the engine above. A disabled module's records are never fetched at all (not merely filtered after the fact) — the strongest form of "if a module is disabled, its content must not surface anywhere."

### Product-visible decisions (recorded in `DECISIONS.md`)

See `DECISIONS.md` § Personalization (Onboarding) for: explicit `onboarding_step` persistence for resumability, Care Setup's raw selection not being persisted (only its module-enablement effect), Appointment Setup being gated by the Intent screen rather than Care Setup, and App Lock/Biometrics defaulting off while Private notifications defaults on at Privacy Setup.

### Engineering decisions (internal — not product-visible, so not recorded in `DECISIONS.md`)

- **`Database` type generic-inference bug, found and fixed.** The very first real `.insert()`/`.update()` calls beyond `.auth.*` (this milestone's `useUpdateProfile`, `useCreateMedication`, etc.) silently typed as `never`, which would have broken every future milestone's database writes if it had gone unnoticed. Root cause: `supabase-js`'s `SupabaseClient` generic resolves a table's `Row`/`Insert`/`Update` types via a structural check that silently fails — resolving to `never` — specifically when the type is a **named interface reference** (e.g. `Profile`) that has **any array-typed field** (`intent: string[] | null`), as opposed to an inline object literal. Isolated via ~17 minimal standalone reproduction files (created and deleted, not committed). Fixed in `packages/database/src/database.types.ts` by wrapping every `Row`/`Insert`/`Update` in a `Flatten<T> = { [K in keyof T]: T[K] }` mapped type, which forces TypeScript to re-materialize the type as a fresh object type rather than a named reference. Also required adding a `Relationships: []` field to every table (required by `postgrest-js`'s `GenericTable` type, previously missing) and widening `Insertable`'s optional-key computation to include any nullable-valued field (`NullableKeys<Row>`), since Zod's `.nullable().optional()` produces `T | null | undefined`, not just `T | null`.
- **A second, related typed-routes bug, found and fixed during this milestone's own visual verification.** `lib/onboarding/routes.ts`'s `onboardingStepHref()` originally built its return value via a `` `/(onboarding)/${string}` `` template-literal type. That type doesn't structurally match Expo Router's generated `Href` union (a closed set of specific literal route strings), even though every value it actually produces is one of those literals — `pnpm --filter @prism/mobile typecheck` only caught this once `.expo/types/router.d.ts` had been freshly regenerated (see Visual Verification below), which is why it wasn't caught by the very first typecheck pass earlier in this milestone. Fixed by replacing the template interpolation with an explicit `Record<OnboardingStep, Href>` literal-to-literal map.
- **Onboarding resume reconstructs the Care Setup signal from `modules`, not from a stored raw answer** (`lib/onboarding/careSetupSignal.ts`): since Care Setup's raw multi-select is deliberately not persisted (see `DECISIONS.md`), a user resuming onboarding partway through needs an equivalent signal to decide whether Medication/Injection Setup should still appear. `careSetupSignalFromModules()` derives a Care-Setup-shaped string array from which modules are already enabled, which `getNextOnboardingStep` then branches on exactly as it would the original answer.
- **`PRISMDateInput`** (`packages/ui/src/components/PRISMDateInput.tsx`): a validated text-entry stand-in for a platform-native date picker (`YYYY-MM-DD`, numeric-and-punctuation keyboard), used in Medication Setup, Appointment Setup, and Journey Date. `SCREEN_BIBLE.md` §3's Global Screen Contract calls for a native picker; this sandbox has no device/simulator to verify a native module against, so a real-but-simpler stand-in was built and documented rather than either integrating an unverified native module sight-unseen or silently skipping the requirement. Swapping in a real native picker is a tracked follow-up (see §12 below), not a blocker.

### Verification performed (Quality Gate)

- `pnpm -r typecheck` passes with zero errors across all 8 workspace projects (after fixing the typed-routes issue above).
- `pnpm -r test` passes 96/96 tests — 44 new for this milestone (9 `packages/types` onboarding-logic tests, 14 `packages/validation` onboarding-schema tests, 5 `careSetupSignal` tests, 2 onboarding-screen tests, comprehensive personalization-engine tests covering every bucket/ranking/filtering rule, and a rewritten `TodayScreen` test suite covering empty/named-greeting/populated/error states).
- ESLint passes with zero errors/warnings on `apps/mobile` and `apps/web`; Prettier formatting is clean repository-wide (the one file Prettier flags, `apps/mobile/expo-env.d.ts`, is Expo's own auto-generated, gitignored file, not project source).
- `apps/web`: `next build` still succeeds.
- The new migration was re-verified against a fresh local-Postgres RLS check (see "What was built" above): valid `journey_stage` values accepted, an invalid value rejected by the CHECK constraint, `intent` arrays round-trip correctly, `app_lock_enabled` defaults to `false`, and all 10 existing RLS adversarial assertions still pass unchanged.
- **Visual verification**: since reaching `(onboarding)` or a populated `(tabs)` route through the app's real navigation requires a live authenticated session (unavailable in this sandbox — no live Supabase project, no device/simulator), the root `Stack.Protected` guards in `app/_layout.tsx` were **temporarily** short-circuited (`guard={showTabs || true}` etc.) for the sole purpose of reaching every route directly by URL under `expo start --web`, screenshotted via Playwright (light mode for all 12 onboarding screens; TODAY in both light and dark), and the bypass was then **fully reverted** before any commit — `git diff` on `app/_layout.tsx` confirms only the real three-branch guard logic remains. All 12 onboarding screens rendered with the exact `SCREEN_BIBLE.md` copy, correct chip/toggle/form states, and the `YYYY-MM-DD` date-input stand-in visible where specified. TODAY rendered the dynamic greeting (falling back to a generic greeting with no profile name set) and the approved empty-state copy in both themes. One screen (Building) could not be fully screenshotted past its animated dots — it auto-advances by calling `useUpdateProfile`, which correctly throws `"No authenticated session."` under this bypass since no real session exists; this is the expected behavior of a real guard clause, not a defect, and mirrors Milestone 02's password-recovery deep link as a flow that needs a real device + live project pass before shipping.

## 12. CARE Milestone (04) — Completion Notes

Completed 2026-09-02. Built on the minimal create-only Medication/Appointment mutations onboarding already exercised (`lib/care/mutations.ts`).

### What was built

- **Full CRUD across all 12 P0 CARE screens** (`features/care/screens/`, routed from a new nested stack at `app/(tabs)/care/`): Care Home, Medications (list, Add, Detail, Edit, Log a dose, Medication Log history), Injection History, Log Injection, Appointments (list, Add, Detail, Edit).
- **`app/(tabs)/care/` nested routing**: the `care` tab, previously a single placeholder file, became a directory with its own `_layout.tsx` (`<Stack screenOptions={{ headerShown: false }} />`, relying on Expo Router's file-based auto-discovery rather than explicitly listing every screen) and file-based dynamic `[id]` routes for Medication/Appointment detail, edit, and history.
- **`lib/care/queries.ts`** (new): read queries for medications, a single medication, medication logs (scoped by `medication_id`), injections, appointments, and a single appointment — all RLS-scoped, no manual `user_id` filters on reads, following the exact pattern established in `lib/profile/queries.ts`.
- **`lib/care/mutations.ts`** (expanded): `useUpdateMedication`, `usePauseMedication` (pause/resume via `end_date` — see `docs/DECISIONS.md` § CARE), `useDeleteMedication`, `useCreateMedicationLog`, `useCreateInjection`, `useUpdateAppointment`, `useDeleteAppointment` — alongside the existing `useCreateMedication`/`useCreateAppointment`. Appointment mutations also invalidate the `today-items` query key, since TODAY classifies appointments (`services/personalization/engine.ts`).
- **Shared form components** (`features/care/components/`): `MedicationForm` (used identically by Add and Edit Medication, per the spec's own "same fields" instruction), `AppointmentForm` (same for Add/Edit Appointment), `ChipField` (a labeled single-select chip row for Form/Frequency/Site/Status), `DaysOfWeekSelect` (weekly schedule day picker).
- **`lib/care/dateTime.ts`** (new): `toISODateTime`/`splitISODateTime`, the shared local-date-and-time ⇄ stored-UTC-ISO conversion used everywhere a CARE form collects date and time as separate fields (Log Injection, Log a dose, Add/Edit Appointment) — see `docs/TECHNICAL_BIBLE.md` §14 Timezone handling.
- **`features/care/medicationDisplay.ts`** (new): `describeFrequency()` and `isMedicationActive()` — pure, unit-tested helpers; see the "Next scheduled event" decision in `docs/DECISIONS.md` § CARE for why this describes the configured schedule rather than resolving a next-dose timestamp.
- **`packages/validation/src/care.ts`** (expanded): `medicationUpdateSchema`, `medicationLogCreateSchema` (renamed from the previously-unused `medicationLogUpdateSchema`), `appointmentUpdateSchema`, and a new `appointmentFormSchema` shaped for CARE's own Add/Edit Appointment forms (separate `date`/`time` fields, required `title` — distinct from onboarding's `appointmentSetupSchema`, which derives a title from category since it never asks for one directly).

### Product-visible decisions (recorded in `DECISIONS.md`)

See `DECISIONS.md` § CARE for: Pause/Resume expressed via `end_date` rather than an invented status column, CARE Home showing only enabled modules with real-activity sections first, and "Next scheduled event" being deliberately not computed (the configured schedule is described honestly instead).

### Engineering decisions (internal — not product-visible, so not recorded in `DECISIONS.md`)

- **A second typed-routes gap, found and fixed during this milestone's own quality gate.** `pnpm --filter @prism/mobile typecheck` passed cleanly right after all CARE screens were written, then failed once `.expo/types/router.d.ts` was regenerated — because that regeneration is triggered by `expo start` (the dev server), not `expo export` (confirmed by timestamp: `expo export --platform web` left the file untouched, while a subsequent `expo start --web` regenerated it within seconds of the first request). Once regenerated, the file correctly typed every new static and dynamic (`[id]`) CARE route; the remaining failures were straightforward `string | null | undefined` vs. `string | null` mismatches in `AppointmentForm.tsx` between the Zod-inferred optional-field shape and the UI components' prop types, fixed by normalizing with `?? null`/`?? ''` at each call site. Documented here so a future milestone doesn't re-diagnose the same "typecheck was clean, then wasn't" surprise: **always run `expo start --web` (or otherwise force route-type regeneration) before the final typecheck pass whenever new routes were added**, not just `expo export`.
- **Appointment date/time editing converts through local time, not a UTC string slice.** An early version of `EditAppointmentScreen` pre-filled its Date/Time fields via `appointment.starts_at.slice(0, 10)`/`.slice(11, 16)` — since `starts_at` is stored as a UTC ISO string but the form's Date/Time fields are meant to represent local time (matching how `toISODateTime` combines them on create), this would have silently shown the wrong time to any user not in UTC. Caught during implementation, not by a test; fixed by adding `splitISODateTime()` as the documented inverse of `toISODateTime()` in `lib/care/dateTime.ts`.
- **`medicationLogUpdateSchema` renamed to `medicationLogCreateSchema`.** It was defined in Milestone 03 but never used; CARE is the first milestone to actually create a log entry, and there is no log-editing screen in the spec, so "create" is the accurate name.

### Verification performed (Quality Gate)

- `pnpm -r typecheck` passes with zero errors across all 8 workspace projects (after the typed-routes regeneration and `AppointmentForm.tsx` fixes above).
- `pnpm -r test` passes 125/125 tests — 20 new for this milestone (12 new `packages/validation` schema tests, 6 pure-function tests for `medicationDisplay`/`dateTime`, and a `MedicationsScreen` test suite covering the empty state, Active/Paused sectioning, and header navigation).
- ESLint passes with zero errors/warnings on `apps/mobile` and `apps/web`; Prettier formatting is clean repository-wide (the one file Prettier flags, `apps/mobile/expo-env.d.ts`, is Expo's own auto-generated, gitignored file).
- `apps/web`: `next build` still succeeds.
- **Visual verification**: the same temporary root-guard-bypass methodology from Milestone 03 was used (no live Supabase project or device in this sandbox to establish a real session) — reverted before commit, confirmed via `git diff` showing zero changes to `app/_layout.tsx`. Screenshotted: Care Home (empty state, since no session means no enabled modules — a real, correct rendering path, not a stand-in), Medications list (empty state), Add Medication (full form, light + dark — every field, chip group, and the conditional weekly/every-X-days/time-of-day sub-fields all render correctly), Medication Detail (the approved generic error state, since the session-gated fetch has no data to return — confirms the screen degrades safely rather than crashing), Injection History (empty state), Log Injection (full form, correctly omitting the Medication chip field when the medications list is empty), Appointments (empty state), Add Appointment (full form, light + dark), Appointment Detail (error state, same reasoning as Medication Detail). No console or page errors on any screen.

## 13. JOURNEY Milestone (05) — Completion Notes

Completed 2026-09-02. Built on CARE's data layer patterns and the working TODAY personalization engine from Milestone 03.

### What was built

- **All 9 P0 JOURNEY screens** (`features/journey/screens/`, routed from a new nested stack at `app/(tabs)/journey/`): Journey Home, Timeline, Milestones (list, Add, Detail, Edit), Journal (list, New, Detail, Edit). Memories (Screens 50-52) is P1 and has no screens yet, consistent with the existing "Customize PRISM and Quick Add expose only P0 modules until P1 ships" decision.
- **Timeline engine** (`services/journey/timeline.ts`): `buildTimelineEvents()` unifies medications (as real logged doses from `medication_logs`, not a predicted schedule — see `docs/DECISIONS.md` § JOURNEY), injections, appointments, milestones, and journal entries into a single reverse-chronological list. Pure and unit-tested, following the same shape as the TODAY engine from Milestone 03. Timeline events reference their source records (`sourceId`) — Timeline is a view, never a second data store.
- **`lib/journey/timelineQuery.ts`** (new): the data-fetching half of Timeline — only fetches records for modules that are actually enabled, the same personalization rule already applied to TODAY and CARE Home.
- **`lib/journey/queries.ts` / `lib/journey/mutations.ts`** (new): full CRUD for milestones and journal entries, following the exact `lib/care/*` pattern (RLS-scoped reads, `user_id`-filtered mutations, query-key invalidation). Milestone/journal mutations also invalidate `today-items`, since TODAY classifies both record types.
- **Two new named design-system components** (`packages/ui/src/components/`): `PRISMTimeline` (the "path of light" — a vertical line connecting event dots, spectrum-colored per record type) and `PRISMMilestone` (a milestone card with a larger icon, spectrum accent, date, and title — "a user-created milestone must feel equally important as a suggested one," per `docs/DESIGN_SYSTEM.md` §16). Both were listed in the design system's named component inventory (§27) since Foundation but not built until JOURNEY needed them.
- **Shared form components** (`features/journey/components/`): `MilestoneForm` (Add/Edit Milestone, with all 12 suggested titles from `docs/MASTER_BUILD_SPEC.md` §09 as pre-fill chips, always paired with a free-text "Create your own"), `JournalEntryForm` (New/Edit Journal Entry), `TagInput` (a simple add/remove tag row for journal entries).

### Product-visible decisions (recorded in `DECISIONS.md`)

See `DECISIONS.md` § JOURNEY for: medication timeline events sourced from real logs rather than a predicted schedule, injection timeline events routing to Injection History (there is no Injection Detail screen in the P0 inventory, despite Screen 43's own illustrative example), journal entries having no Photo field (the canonical schema has no column for one), and Mood being free text rather than a chip-select mood tracker (explicitly ruled out by `docs/DESIGN_SYSTEM.md` §14).

### Engineering decisions (internal — not product-visible, so not recorded in `DECISIONS.md`)

- **Date-only records get a synthetic sort key, never a display change.** Milestones and journal entries store a bare `YYYY-MM-DD` date, while injections/appointments/medication logs store a full UTC timestamp. To interleave both kinds sensibly on one chronological list, `buildTimelineEvents()` converts a bare date to a synthetic midday-UTC sort key (`dateToSortKey()`) purely for ordering — the record's own `date` field, and everything actually displayed, is untouched. This keeps faith with `docs/TECHNICAL_BIBLE.md` §14's "a recorded date never shifts a day due to travel" rule, since only an internal comparison key is affected, never the shown date.
- **Applied the CARE milestone's typed-routes lesson proactively.** Having found (and documented) in Milestone 04 that `.expo/types/router.d.ts` only regenerates via `expo start`, not `expo export`, this milestone ran the dev server and hit every new dynamic route by hand _before_ the final typecheck pass, rather than discovering the same stale-types surprise again. `TimelineScreen.tsx`'s `recordHref()` helper is explicitly typed to return `Href` (imported from `expo-router`) rather than a bare `string`, matching the fix already applied to `onboardingStepHref()` in Milestone 03 — the same class of bug (a function computing a route dynamically needs its return type spelled out as `Href`, or the literal-template inference that makes direct `router.push(\`/x/${id}\`)` calls type-check doesn't carry through a wrapping function).

### Verification performed (Quality Gate)

- `pnpm -r typecheck` passes with zero errors across all 8 workspace projects.
- `pnpm -r test` passes 158/158 tests — 33 new for this milestone (10 new `packages/validation` schema tests, 9 Timeline engine tests covering every record type plus cross-type ordering, and a `MilestonesScreen` test suite covering the empty state, list rendering, and navigation).
- ESLint passes with zero errors/warnings on `apps/mobile` and `apps/web`; Prettier formatting is clean repository-wide (the one file Prettier flags, `apps/mobile/expo-env.d.ts`, is Expo's own auto-generated, gitignored file).
- `apps/web`: `next build` still succeeds.
- **Visual verification**: the same temporary root-guard-bypass methodology from Milestones 03-04 was used (no live Supabase project or device in this sandbox to establish a real session) — reverted before commit, confirmed via `git diff` showing zero changes to `app/_layout.tsx`. Screenshotted: Journey Home (Timeline section always visible; Milestones/Journal sections correctly absent since no session means no enabled modules), Timeline (approved empty state), Milestones (approved empty state), Add Milestone (full form, light + dark — all 12 suggested-title chips, the free-text Title field, and the icon picker all render correctly), Milestone Detail (the approved generic error state, since the session-gated fetch has no data to return), Journal (approved empty state), New Journal Entry (full form, light + dark — Mood renders as free text, not a chip row, confirming the design decision), Journal Entry Detail (error state, same reasoning as Milestone Detail). No console or page errors on any screen.

## 14. Known Technical Risks

- **No real reminder-scheduling engine exists yet — still open after CARE.** CARE (`04`) built `reminder_enabled` as a stored, editable boolean on medications and appointments, and full dose/schedule data entry, but no push-notification delivery, and no logic that resolves a `frequency_config` into an actual next-occurrence timestamp. This is now the most consequential open gap blocking three related things: recurring reminders across timezones/DST (`TECHNICAL_BIBLE.md` §14's "should not move when a user travels" requirement), TODAY's "medication due today" classification (deliberately not fabricated — see `services/personalization/engine.ts`), and Medications' "Next scheduled event" (deliberately described in plain language instead — see `docs/DECISIONS.md` § CARE). Resolve all three together, in one place, when the reminder engine is actually built — not piecemeal per-surface.
- **Offline sync conflict resolution.** The rule ("never silently overwrite; resolve deterministically; surface conflict when necessary" — `TECHNICAL_BIBLE.md` §14) is clear in intent but the exact algorithm (last-write-wins vs. field-level merge vs. user-prompted resolution) is left open. Address during Hardening.
- **Third-party push notification service.** Even the default provider (§6) touches user data in transit and deserves the same "security red flag" review as any other third-party integration before it's wired up in milestone `09`/`10` — don't let "it's the standard Expo default" skip that review.
- **`frequency_config`/`recurrence` JSON schema drift.** Because these are JSONB with no enforced shape, inconsistent writes across the mobile app and any future web/admin surface are a real risk if the shape isn't validated centrally (see `packages/validation` in `TECHNICAL_BIBLE.md` §4). Define and validate the shape once, in one shared package, not per-call-site — the shape is already centralized in `packages/validation/src/care.ts`'s `frequencyConfigSchema`; the remaining risk is only in the not-yet-built engine that consumes it.
- **`PRISMDateInput` is a text-entry stand-in, not a native picker.** Used across onboarding's date fields (Medication/Appointment Setup, Journey Date), every CARE date field (Add/Edit Medication, Log Injection, Log a dose, Add/Edit Appointment), and now every JOURNEY date field too (Add/Edit Milestone, New/Edit Journal Entry) — the same sandbox constraint (no device/simulator to verify a native module end-to-end) applies everywhere it's used. Swap in a real native picker (e.g. `@react-native-community/datetimepicker`) once on-device verification is possible — not a blocker for continued build-out, but tracked so it isn't forgotten before Beta.
- **A growing list of flows need a real-device + live-project pass before shipping**, since none of them can be constructed in this no-backend, no-device sandbox: password-recovery's deep link, the onboarding auto-advance mutation (Building screen), every CARE mutation and populated-data state (medications, injections, appointments), and — new in this milestone — every JOURNEY mutation exercised against real data (creating/editing a milestone, writing/editing a journal entry) and the JOURNEY screens' data-driven states (a populated Timeline actually interleaving multiple record types in the right order, populated Milestones/Journal lists, Milestone/Journal Entry Detail with real records, Journey Home's moment-count summary). All are code-complete and covered by unit/schema tests; visual verification this milestone confirmed the _code paths_ render correctly under a session-less bypass (forms, empty states, the approved generic error state) but never exercised a real write, a populated list, or the Timeline's actual cross-type interleaving logic against live data. Verify the full write path together the first time a live Supabase project + physical device/simulator is available — this is the single most important pre-Beta verification gap across every milestone so far.

## 15. Known Legal/Privacy Review Items

Tracked in full in [`SECURITY.md`](./SECURITY.md) §21 — restated here for build-status visibility, all pre-launch (not pre-Foundation) items:

- Privacy Policy and Terms of Service (text not yet drafted)
- Data retention policy — concrete retention window not yet defined
- Security incident procedure — not yet documented
- App store privacy disclosures — not yet prepared
- HIPAA / health-privacy applicability determination — **explicitly not decided**; no compliance claim may be made anywhere in-product, in marketing, or in app-store listings until qualified legal counsel has reviewed PRISM's actual business relationships and data flows

None of these block engineering work through Beta (milestone `09`); all of them block public Launch (milestone `14`'s successor, per `MASTER_BUILD_SPEC.md` §28 Phase 9).
