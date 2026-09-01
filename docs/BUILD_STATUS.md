# PRISM Build Status

**STATUS: READY TO BEGIN DEVELOPMENT**
**CURRENT MILESTONE: Foundation**

Last updated: 2026-09-01 (final pre-development documentation review)

This document tracks where PRISM actually is against [`MASTER_BUILD_SPEC.md`](./MASTER_BUILD_SPEC.md)'s implementation milestones. It is a living document — update it at the end of every milestone, not just at the start of the project. It does not restate product or technical detail; it points at the document that owns each fact.

---

## 1. Current Project Status

PRISM has a complete, internally-consistent documentation foundation and **no application code**. This is the intended state at the end of the documentation phase — see [`README.md`](../README.md) §Status. A pre-development review pass (this document's creation) resolved the one open scope contradiction found during the initial documentation build and performed an implementation-readiness audit (§7 below). Nothing found in that audit blocks starting the Foundation milestone.

## 2. Documentation Status

All seven core documents plus the README are complete, cross-linked, and consistent as of this review:

| Document | Status |
|---|---|
| [`PRODUCT_BIBLE.md`](./PRODUCT_BIBLE.md) | Complete — MVP definition updated to match the resolved P0/P1 split |
| [`TECHNICAL_BIBLE.md`](./TECHNICAL_BIBLE.md) | Complete |
| [`SCREEN_BIBLE.md`](./SCREEN_BIBLE.md) | Complete — all 78 screens tagged P0/P1 where relevant |
| [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) | Complete |
| [`MASTER_BUILD_SPEC.md`](./MASTER_BUILD_SPEC.md) | Complete — MVP scope, database scope table, acceptance criteria, and P1 scope all updated and cross-consistent |
| [`SECURITY.md`](./SECURITY.md) | Complete |
| [`DECISIONS.md`](./DECISIONS.md) | Complete — MVP scope contradiction resolved and recorded; two new decisions recorded from this review |
| [`README.md`](../README.md) | Complete |
| `archive/PRISM_MASTER_SOURCE.docx` | Preserved, unchanged |

No further documentation-only work is scheduled before Foundation begins. Documentation is expected to keep changing *alongside* implementation (see [`README.md`](../README.md) §How Claude Code Should Use This Documentation, item 6) — that is normal and required, not a sign this document is out of date.

## 3. MVP Scope (P0)

Confirmed by explicit product-owner decision on 2026-09-01 (see [`DECISIONS.md`](./DECISIONS.md)):

Authentication · Onboarding · Personalization · TODAY · Medications · Medication reminders/logging · Injections · Appointments · Timeline · Milestones · Journal · Customize PRISM · Privacy · Notifications · App lock · Accessibility · Data export · Account deletion.

Full detail: [`MASTER_BUILD_SPEC.md`](./MASTER_BUILD_SPEC.md) §24.

## 4. P1 Scope (Next Release)

Labs · Procedures · Legal Journey · Memories · Documents · Universal Search · Advanced recurring schedules · Supply tracking · Enhanced journal functionality.

The full 15-table database schema and the `modules` table's complete set of module keys are built during Foundation regardless — P1 status defers *screens*, not schema. Full detail: [`MASTER_BUILD_SPEC.md`](./MASTER_BUILD_SPEC.md) §25.

## 5. Development Milestones

Per [`MASTER_BUILD_SPEC.md`](./MASTER_BUILD_SPEC.md) §28:

`01` Repository & architecture → `02` Supabase & authentication → `03` Database & RLS → `04` Design system → `05` Onboarding & personalization → `06` TODAY → `07` CARE → `08` JOURNEY → `09` YOU → `10` Privacy & security → `11` Accessibility → `12` Testing → `13` Polish → `14` Beta readiness.

### Current Milestone

**Foundation** (milestone `01`) — not yet started. See §8 Implementation Checklist below for its scope.

### Completed Milestones

None. Documentation is not an implementation milestone in this sequence — it is the prerequisite that makes milestone `01` startable without the product owner being asked basic questions mid-build.

### Remaining Milestones

All fourteen (`01` through `14`), in full, starting with Foundation.

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

| Area | Readiness | Notes |
|---|---|---|
| Navigation | Ready | 4-tab structure, contextual sub-navigation fully specified |
| Screen requirements | Ready | All 78 screens specified with purpose/content/actions; P0/P1 now unambiguous |
| Database models | Ready | Full 15-table schema with columns/types/defaults; two JSON-shape details deferred (§6) |
| User ownership | Ready | `user_id` on every table; ownership model unambiguous |
| RLS | Ready | Policy pattern (`user_id = auth.uid()`) and required policy types specified; SQL itself is Foundation-milestone work, not a spec gap |
| Personalization | Ready | Engine pipeline, priority order, and P0/P1 module-key scoping fully specified |
| Onboarding | Ready | All 12 screens, fields, and conditional logic specified |
| Notification behavior | Ready | Content rules and pipeline specified; provider choice is a Foundation-time default (§6) |
| App lock | Ready | Methods, fallback, and lock-screen content restrictions specified |
| Accessibility | Ready | Support matrix and touch-target sizes specified consistently across documents |
| Error states | Ready | Approved copy and interaction pattern specified globally |
| Loading states | Ready | Pattern (skeletons over spinners, no artificial delay) specified |
| Empty states | Ready | Approved copy specified per feature area |
| Offline behavior | Ready | MVP priority order and conflict-resolution rule specified; exact sync algorithm is Hardening-milestone work, not a spec gap |
| Authentication | Ready | Methods, verification, recovery, and enumeration protection specified |
| Data export | Ready | Format and completeness bar specified; file structure is a milestone-10 detail (§6) |
| Account deletion | Ready | Explicit 6-step sequence specified |
| Design tokens | Ready | Exact hex values, spacing, radius, and typography scale specified |
| Component requirements | Ready | Named component set with required interaction states specified |
| MVP boundaries | Ready | Resolved and consistent across all documents as of this review (§3–4) |

**Genuinely blocking items found: none.** The one real blocker this review surfaced — Customize PRISM and Quick Add both listing all ten module keys, including five now deferred to P1, which would have dead-ended a user tapping a toggle with no screen behind it — was resolved during this same review (see [`DECISIONS.md`](./DECISIONS.md) §Customize PRISM and Quick Add expose only P0 modules until P1 ships) and is reflected in `MASTER_BUILD_SPEC.md`, `SCREEN_BIBLE.md`, and `PRODUCT_BIBLE.md`. No requirements were invented beyond what was needed to close that specific gap.

## 8. Implementation Checklist

Unchecked — nothing has been built yet. Update this checklist at the end of each milestone; do not mark an item done until it meets the Definition of Done in [`TECHNICAL_BIBLE.md`](./TECHNICAL_BIBLE.md) §21 (UI, persistence, validation, loading/empty/error states, accessibility, security, tests, offline behavior, privacy-safe analytics, documentation — not just "it renders").

### Foundation
- [ ] Repository architecture (monorepo layout per `TECHNICAL_BIBLE.md` §4)
- [ ] React Native / Expo app scaffolded
- [ ] Next.js web foundation (marketing/support/legal pages)
- [ ] Supabase project configuration
- [ ] Environment configuration (dev/staging/production, documented variables)
- [ ] Design tokens implemented
- [ ] Shared components (`packages/ui` core set — see `DESIGN_SYSTEM.md` §27)
- [ ] Navigation (TODAY/CARE/JOURNEY/YOU tab bar + contextual sub-navigation)
- [ ] Error handling (global error boundary, standard error/loading/empty state components)
- [ ] Testing infrastructure (unit/integration/E2E runners wired up)

### Authentication
- [ ] Sign up
- [ ] Sign in
- [ ] Email verification
- [ ] Password recovery (with enumeration protection)
- [ ] Session handling

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

## 9. Known Technical Risks

- **Recurring reminders across timezones/DST.** `TECHNICAL_BIBLE.md` §14 requires that a weekly reminder "should not move" when a user travels, but does not specify the exact scheduling algorithm. Real, tractable risk — resolve during the CARE milestone (`07`) when the reminder engine is built, and cover it explicitly in that milestone's tests.
- **Offline sync conflict resolution.** The rule ("never silently overwrite; resolve deterministically; surface conflict when necessary" — `TECHNICAL_BIBLE.md` §14) is clear in intent but the exact algorithm (last-write-wins vs. field-level merge vs. user-prompted resolution) is left open. Address during Hardening (`07`).
- **Third-party push notification service.** Even the default provider (§6) touches user data in transit and deserves the same "security red flag" review as any other third-party integration before it's wired up in milestone `09`/`10` — don't let "it's the standard Expo default" skip that review.
- **`frequency_config`/`recurrence` JSON schema drift.** Because these are JSONB with no enforced shape, inconsistent writes across the mobile app and any future web/admin surface are a real risk if the shape isn't validated centrally (see `packages/validation` in `TECHNICAL_BIBLE.md` §4). Define and validate the shape once, in one shared package, not per-call-site.

## 10. Known Legal/Privacy Review Items

Tracked in full in [`SECURITY.md`](./SECURITY.md) §21 — restated here for build-status visibility, all pre-launch (not pre-Foundation) items:

- Privacy Policy and Terms of Service (text not yet drafted)
- Data retention policy — concrete retention window not yet defined
- Security incident procedure — not yet documented
- App store privacy disclosures — not yet prepared
- HIPAA / health-privacy applicability determination — **explicitly not decided**; no compliance claim may be made anywhere in-product, in marketing, or in app-store listings until qualified legal counsel has reviewed PRISM's actual business relationships and data flows

None of these block engineering work through Beta (milestone `09`); all of them block public Launch (milestone `14`'s successor, per `MASTER_BUILD_SPEC.md` §28 Phase 9).
