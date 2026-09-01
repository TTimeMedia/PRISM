# PRISM

**Your journey. Your way.**

PRISM is a private, personalized app for transgender and gender-diverse people to manage, document, organize, and reflect on their individual gender-affirming journey. PRISM does not define what transition is supposed to look like — it adapts to the individual. A person may take hormones, or not. They may have surgery, or not. They may change their name, or not. They may know exactly what they want, or still be figuring it out. PRISM supports all of those journeys, equally, without assumptions.

> **There's no right way to transition. PRISM adapts to every journey.**

## Status

This repository currently contains PRISM's **documentation foundation only** — product definition, technical architecture, screen specification, design system, security posture, and the executable build specification. **No application code has been written yet.** Establishing and validating this documentation was the deliberate first step, ahead of any implementation work — see [`docs/MASTER_BUILD_SPEC.md`](./docs/MASTER_BUILD_SPEC.md) for what happens next.

## Product Philosophy

PRISM is built around five principles, detailed in [`docs/PRODUCT_BIBLE.md`](./docs/PRODUCT_BIBLE.md):

1. **Person First** — PRISM adapts to the person; it never forces a predefined transition path.
2. **No Assumptions** — never assumes gender, pronouns, HRT status, medication, surgery, or a transition start date. Everything is optional.
3. **Private by Default** — privacy is foundational, not a premium feature.
4. **No Judgment** — a missed medication, a changed plan, starting or stopping HRT — none of these are failures. PRISM records what happened; it does not judge why.
5. **No Finish Line** — there is no universal "completed transition" state.

PRISM is **not** a doctor, a diagnostic tool, a hormone dosing calculator, or a social network. It organizes and documents the user's experience — it does not determine what the user should do medically.

## Technology Stack

| Layer | Technology |
|---|---|
| Mobile | React Native + Expo (iOS + Android) |
| Backend | Supabase (PostgreSQL, Auth, Row Level Security, Storage, Edge Functions) |
| Web | Next.js on Vercel (marketing, documentation, support, legal) |
| Package manager | pnpm |

Full architectural rationale: [`docs/TECHNICAL_BIBLE.md`](./docs/TECHNICAL_BIBLE.md).

## Planned Repository Structure

PRISM is designed as a monorepo. The structure below is specified in [`docs/TECHNICAL_BIBLE.md`](./docs/TECHNICAL_BIBLE.md) and [`docs/MASTER_BUILD_SPEC.md`](./docs/MASTER_BUILD_SPEC.md) and will be created as implementation begins:

```
prism/
├── apps/
│   ├── mobile/          # React Native + Expo app
│   └── web/              # Next.js marketing/support site
├── packages/
│   ├── ui/                # Shared PRISM design system components
│   ├── database/          # Supabase types & query layer
│   ├── types/             # Shared TypeScript types
│   ├── config/             # Shared configuration
│   └── validation/         # Shared schema validation
├── supabase/
│   ├── migrations/
│   ├── functions/
│   ├── seed/
│   └── config.toml
├── docs/                   # This documentation system (see below)
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## Documentation Structure

All product, technical, and design documentation lives in [`docs/`](./docs):

| Document | Purpose |
|---|---|
| [`PRODUCT_BIBLE.md`](./docs/PRODUCT_BIBLE.md) | Vision, philosophy, positioning, target users, MVP definition, success metrics — *what PRISM is and why* |
| [`TECHNICAL_BIBLE.md`](./docs/TECHNICAL_BIBLE.md) | Architecture, stack, database, security, testing, engineering rules — *how PRISM is built* |
| [`SCREEN_BIBLE.md`](./docs/SCREEN_BIBLE.md) | Every screen in the app (78 total), organized by Authentication, Onboarding, TODAY, CARE, JOURNEY, YOU, and Global |
| [`DESIGN_SYSTEM.md`](./docs/DESIGN_SYSTEM.md) | Visual language — color, typography, spacing, components, motion, accessibility |
| [`MASTER_BUILD_SPEC.md`](./docs/MASTER_BUILD_SPEC.md) | **The authoritative implementation specification** — synthesizes the above into an executable build plan |
| [`SECURITY.md`](./docs/SECURITY.md) | Security and privacy posture: RLS, storage, secrets, logging, analytics, incident response |
| [`DECISIONS.md`](./docs/DECISIONS.md) | Dated log of explicit product decisions, and any unresolved contradictions in the source material |
| [`BUILD_STATUS.md`](./docs/BUILD_STATUS.md) | Current build status, MVP/P1 scope, milestone tracking, and the implementation checklist |
| [`archive/PRISM_MASTER_SOURCE.docx`](./docs/archive/PRISM_MASTER_SOURCE.docx) | The original PRISM master document this documentation system was built from |

### **`docs/MASTER_BUILD_SPEC.md` is the authoritative implementation specification.**

When any other document appears to conflict with it on an implementation detail, `MASTER_BUILD_SPEC.md` governs — and any genuine contradiction between source documents is tracked explicitly in `docs/DECISIONS.md` rather than silently resolved.

## How Claude Code Should Use This Documentation

1. **Read [`docs/MASTER_BUILD_SPEC.md`](./docs/MASTER_BUILD_SPEC.md) first.** It is written as a direct build directive and links out to the other documents for full detail on any given area.
2. **Check [`docs/DECISIONS.md`](./docs/DECISIONS.md) before making a scope call** — it records every explicit product decision, including the finalized MVP (P0) / next-release (P1) boundary. See [`docs/BUILD_STATUS.md`](./docs/BUILD_STATUS.md) for the current build-tracking view.
3. **Do not re-litigate settled product principles.** The five principles in `PRODUCT_BIBLE.md` (Person First, No Assumptions, Private by Default, No Judgment, No Finish Line) and the fifteen Non-Negotiable Rules in `MASTER_BUILD_SPEC.md` §31 override convenience — when an implementation detail is unspecified, choose the option that best preserves them, in this order: privacy, accessibility, security, maintainability, personalization, PRISM's design language.
4. **Build incrementally, in vertical slices**, per `MASTER_BUILD_SPEC.md` Appendix A (Rule B) — UI → validation → database → RLS → persistence → loading/error states → tests, one feature at a time, not fifty screens of mock data.
5. **Security and RLS come before UI exposure**, per Appendix A (Rule D). Never expose a table through the UI before its Row Level Security policies exist and are tested.
6. **Keep documentation synchronized with implementation.** If a build decision deviates from these documents, update the relevant document (and `DECISIONS.md` if it's a product-level decision) in the same change.

## Development Setup

Implementation has not started, so there is no working tree to install yet. Once Phase 1 (Foundation) of [`MASTER_BUILD_SPEC.md`](./docs/MASTER_BUILD_SPEC.md) §28 begins, this section will be replaced with real setup instructions (`pnpm install`, Expo/Next.js dev servers, Supabase local development, etc.). Until then, treat this repository as documentation-only.

## Environment Configuration

Per [`SECURITY.md`](./docs/SECURITY.md) §14–15: sensitive credentials must never be committed to Git. Required environment variables (Supabase URL, Supabase anon key, API credentials, notification configuration, analytics configuration) will be documented here and in `.env.example` once the codebase exists. Service-role keys and other privileged credentials must never be exposed to the mobile client — see `SECURITY.md` for the full rule set. Maintain separate development, staging, and production environments; never test destructive migrations against production.

## Testing

Testing strategy (unit → integration → end-to-end → accessibility → security → real-device testing) is defined in [`TECHNICAL_BIBLE.md`](./docs/TECHNICAL_BIBLE.md) §18 and [`MASTER_BUILD_SPEC.md`](./docs/MASTER_BUILD_SPEC.md) §27. A feature is not "done" because it renders — see the Definition of Done in `TECHNICAL_BIBLE.md` §21.

## Development Workflow

- Use feature-oriented organization (each feature owns its screens, components, hooks, validation, and types) — see `TECHNICAL_BIBLE.md` §5.
- Use conventional, meaningful commits (e.g. `feat(care): add medication tracking`, `fix(today): hide disabled modules`) — see `TECHNICAL_BIBLE.md` §20.
- Follow the implementation milestone sequence in `MASTER_BUILD_SPEC.md` §28: Repository & architecture → Supabase & authentication → Database & RLS → Design system → Onboarding & personalization → TODAY → CARE → JOURNEY → YOU → Privacy & security → Accessibility → Testing → Polish → Beta readiness.

## Security Expectations

PRISM handles gender identity, medication, medical, legal, and journal data — among the most sensitive information a person can generate. In short (full detail in [`SECURITY.md`](./docs/SECURITY.md)):

- **Row Level Security on every user-owned table**, enforced server-side and verified by adversarial tests — never rely on frontend filtering.
- **Private notifications and a content-free lock screen by default.**
- **No sensitive content** in logs, analytics, crash reports, URLs, or debugging artifacts, ever.
- **No service-role or privileged credentials on the client**, ever.
- **Comprehensive, tested account deletion and data export.**
- **No sale of transition, health, or identity data** — and no compliance claims (e.g. "HIPAA compliant") without qualified legal review.

## Contributing

This project does not yet have a public contribution process. If you're working on PRISM, read `docs/MASTER_BUILD_SPEC.md` and `docs/DECISIONS.md` before making product or architectural changes, and keep documentation and implementation in sync.
