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
**Implications:** Toggling a module in Customize PRISM changes only what is *surfaced* (TODAY, CARE, search, Quick Add); the underlying rows are untouched and reappear exactly as they were if the module is re-enabled. This is Non-Negotiable Rule 7 (`MASTER_BUILD_SPEC.md` §31) and must be implemented at the query/filter layer, never via a delete.

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
**Implications:** This boundary applies to every layer, including any future AI assistant (`MASTER_BUILD_SPEC.md` §26 AI Strategy) — an assistant may help a user find their *own* recorded information, but must refuse questions that require a medical judgment.

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

### OPEN — MVP scope conflict: Labs, Procedures, and Legal Journey
**Date flagged:** 2026-09-01
**Status:** Open — requires product decision
**Conflict:**
- The source Master Build Specification's P0/MVP list (its §57, reflected loosely in `MASTER_BUILD_SPEC.md` §24) includes **"basic labs"** and **"procedures"** under CARE, and **"basic legal journey"** under an "Additional" heading — implying all three are part of the MVP.
- The source Screen Bible's explicit screen-by-screen MVP priority (its §99, preserved verbatim in `SCREEN_BIBLE.md` §14) puts the **entire Labs, Procedures, and Legal Journey feature sets in P1 ("shortly after MVP")** — not P0.
- The source Product Bible's own MVP list (its §53) includes "Basic labs" under Care but does **not** mention Procedures or Legal Journey at all in its P0 description — partially agreeing with each side.
**Reason this matters:** This determines real build sequencing. Building three additional feature areas (with their own screens, database interactions, and tests) into "MVP" versus deferring them to P1 is a meaningful scope and timeline difference, not a copy-editing nuance.
**Recommended resolution (not yet adopted — flagged for the product owner):** Treat Labs, Procedures, and Legal Journey as **P1** for the purposes of the initial build, per the Screen Bible's explicit screen-level breakdown, which is the most granular and implementation-facing of the three sources. `SCREEN_BIBLE.md` §14 and `MASTER_BUILD_SPEC.md` §24 currently preserve their respective source wording rather than pre-resolving this in one direction; treat `SCREEN_BIBLE.md` §14 as the tie-breaker until the product owner confirms.
**Implications once resolved:** Whichever direction is chosen, update `MASTER_BUILD_SPEC.md` §24 and §29 (Acceptance Criteria items 13–14, which currently assume lab/procedure creation is part of MVP) and `SCREEN_BIBLE.md` §14 to agree exactly, and remove this entry's "Open" status.

### RESOLVED — `settings` table primary key
**Date flagged:** 2026-09-01
**Status:** Resolved (minor/technical, not a product-level contradiction)
**Conflict:** The Technical Bible's schema for `settings` uses `user_id UUID PRIMARY KEY` as the sole key. The Master Build Specification's schema for the same table lists both `id UUID PRIMARY KEY` and `user_id UUID PRIMARY KEY`, which is not valid as written (a table cannot have two independent primary keys) and would also allow multiple settings rows per user if "fixed" by adding a surrogate `id`.
**Resolution:** `user_id` is the sole primary key of `settings` (one row per user), matching the Technical Bible and the invariant the rest of the specification assumes (e.g. "Load Module Configuration" in the user lifecycle expects exactly one settings row). Documented in `MASTER_BUILD_SPEC.md` §18.

---

## Adding New Decisions

When a new explicit product decision is made, append it to the relevant section above (or add a new section) using the same `Decision / Date / Status / Reason / Implications` format. Do not silently edit or remove a past decision's entry — if a decision changes, add a new entry referencing the old one and mark the old one's Status as `Superseded (see [new entry]).`
