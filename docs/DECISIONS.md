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
**Reason:** Core manifesto: "There's no right way to transition." (`PRODUCT_BIBLE.md` §4)
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
