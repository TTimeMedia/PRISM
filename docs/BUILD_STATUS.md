# PRISM Build Status

**STATUS: MILESTONE 02 (AUTHENTICATION & IDENTITY) COMPLETE**
**CURRENT MILESTONE: 03 — Personalization (Onboarding)**

Last updated: 2026-09-02 (Authentication & Identity milestone complete)

This document tracks where PRISM actually is against [`MASTER_BUILD_SPEC.md`](./MASTER_BUILD_SPEC.md)'s implementation milestones. It is a living document — update it at the end of every milestone, not just at the start of the project. It does not restate product or technical detail; it points at the document that owns each fact.

---

## 1. Current Project Status

PRISM's Foundation milestone (`01`) and Authentication & Identity milestone (`02`) are both complete. Foundation established the monorepo, both apps, all shared packages, the full Supabase schema with RLS, the design system foundation, the navigation shell, and cross-cutting infrastructure. Authentication & Identity built the seven Authentication screens (Sign Up, Sign In, Forgot/Reset Password, Email Verification, plus Welcome) on that foundation, with real working session handling, email verification, and password recovery via deep link — see §9 (Foundation) and §10 (Authentication & Identity) below for what was built and how each was verified. No onboarding or P0/P1 feature screens exist yet; that begins with Milestone 03.

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

**Personalization (Onboarding)** (milestone `03`) — not yet started. The 12 onboarding screens, module selection, profile/journey-stage/care setup, and the personalized TODAY engine are built here, on top of the working session layer from `02`.

### Completed Milestones

- **Foundation** (milestone `01`) — complete as of 2026-09-02. See §9 below for what was built and how it was verified.
- **Authentication & Identity** (milestone `02`) — complete as of 2026-09-02. See §10 below.

### Remaining Milestones

Twelve (`03` through `14`), starting with Personalization.

## 6. Known Open Decisions

The MVP scope contradiction that was open at the end of the initial documentation pass has been resolved (see [`DECISIONS.md`](./DECISIONS.md)). No product-level decisions are currently open. The following are **implementation-level** choices intentionally left to the engineer at the point they're needed, per this specification's own philosophy of not over-specifying (`MASTER_BUILD_SPEC.md` Appendix A): they should be made and then recorded in `DECISIONS.md` (if product-visible) or left as ordinary code, not raised back to the product owner.

- **`medications.frequency_config` and `reminders.recurrence` JSON shape** — the column exists and its purpose is specified (§`MASTER_BUILD_SPEC.md` §18), but the internal JSON structure for "every X days" / day-of-week schedules is not. Design this during the CARE milestone (`07`) alongside the reminder engine that consumes it.
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

- [ ] Onboarding (all 12 screens)
- [ ] Module selection (P0 modules only)
- [ ] Profile
- [ ] Journey stage
- [ ] Care configuration
- [ ] Personalized TODAY (engine + dynamic cards)

### Care

- [ ] Medications
- [ ] Medication logs
- [ ] Reminders
- [ ] Injections
- [ ] Appointments

### Journey

- [ ] Timeline
- [ ] Milestones
- [ ] Journal

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

## 11. Known Technical Risks

- **Recurring reminders across timezones/DST.** `TECHNICAL_BIBLE.md` §14 requires that a weekly reminder "should not move" when a user travels, but does not specify the exact scheduling algorithm. Real, tractable risk — resolve during the CARE milestone (`07`) when the reminder engine is built, and cover it explicitly in that milestone's tests.
- **Offline sync conflict resolution.** The rule ("never silently overwrite; resolve deterministically; surface conflict when necessary" — `TECHNICAL_BIBLE.md` §14) is clear in intent but the exact algorithm (last-write-wins vs. field-level merge vs. user-prompted resolution) is left open. Address during Hardening (`07`).
- **Third-party push notification service.** Even the default provider (§6) touches user data in transit and deserves the same "security red flag" review as any other third-party integration before it's wired up in milestone `09`/`10` — don't let "it's the standard Expo default" skip that review.
- **`frequency_config`/`recurrence` JSON schema drift.** Because these are JSONB with no enforced shape, inconsistent writes across the mobile app and any future web/admin surface are a real risk if the shape isn't validated centrally (see `packages/validation` in `TECHNICAL_BIBLE.md` §4). Define and validate the shape once, in one shared package, not per-call-site.

## 12. Known Legal/Privacy Review Items

Tracked in full in [`SECURITY.md`](./SECURITY.md) §21 — restated here for build-status visibility, all pre-launch (not pre-Foundation) items:

- Privacy Policy and Terms of Service (text not yet drafted)
- Data retention policy — concrete retention window not yet defined
- Security incident procedure — not yet documented
- App store privacy disclosures — not yet prepared
- HIPAA / health-privacy applicability determination — **explicitly not decided**; no compliance claim may be made anywhere in-product, in marketing, or in app-store listings until qualified legal counsel has reviewed PRISM's actual business relationships and data flows

None of these block engineering work through Beta (milestone `09`); all of them block public Launch (milestone `14`'s successor, per `MASTER_BUILD_SPEC.md` §28 Phase 9).
