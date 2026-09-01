# PRISM Product Bible

**Your journey. Your way.**

Version: 1.0
Status: Product definition — pre-development
Category: Gender-affirming journey, care, organization & personal tracking
Platforms: iOS + Android (React Native + Expo), companion web (Next.js)

This document defines *what PRISM is and why it exists*. For implementation details, see [`TECHNICAL_BIBLE.md`](./TECHNICAL_BIBLE.md), [`SCREEN_BIBLE.md`](./SCREEN_BIBLE.md), [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md), and the authoritative build spec, [`MASTER_BUILD_SPEC.md`](./MASTER_BUILD_SPEC.md).

---

## 1. Vision

**PRISM is a private, personalized space for navigating, managing, and documenting a person's gender-affirming journey.**

PRISM does not define what transition is supposed to look like — it adapts to the individual. A person may take hormones, or not. They may have surgery, or not. They may change their name, or not. They may know exactly what they want, or still be figuring it out. PRISM supports all of those journeys.

PRISM should feel less like a medical record system and more like a **personal operating system for a person's journey**.

### Core promise

**Your journey. Your way.**

## 2. Name

**PRISM.** The name and visual metaphor is deliberate: **Light → Prism → Spectrum**, not **Rainbow → Pride → generic LGBTQ app**. A prism takes one beam of light and refracts it into a spectrum unique to how it passes through — the same input, an individual result. That is the product in one image: one app, refracted differently for every person who uses it.

## 3. Tagline

**Your journey. Your way.**

This line is the product's north star (§16) and should anchor the splash screen, the marketing website hero, and app store copy.

## 4. The PRISM Manifesto

> **There's no right way to transition.**
>
> Some people take hormones. Some don't.
> Some have surgery. Some don't.
> Some change their name. Some don't.
> Some know exactly what they want. Others are still figuring things out.
>
> **PRISM adapts to every journey.**

## 5. Product Positioning

PRISM should be described as:

**A private, personalized app for organizing and documenting your gender-affirming journey.**

Core benefits: personalized, private, flexible, nonjudgmental, designed for every kind of journey.

PRISM's biggest competitive advantage is not *"we track testosterone."* It is:

**"We don't assume what your journey looks like."**

That distinction should influence the entire product, from onboarding through every screen.

## 6. Who PRISM Is For

PRISM is designed for:

- Trans men, trans women, nonbinary people, gender-fluid people, gender-questioning people
- People exploring their identity
- People socially, medically, and/or legally transitioning
- People pursuing surgery, and people not pursuing surgery
- People using HRT, and people not using HRT
- People using injections, patches, gels, creams, or other medications
- People who want to track nothing medical at all
- People who simply want a private place to document their journey

PRISM should work equally well for someone who has been transitioning for ten days and someone who has been transitioning for ten years.

## 7. Who PRISM Is Not For

PRISM is **not**:

- A doctor, therapist, or medical provider — nor a replacement for medical care
- A diagnostic tool, hormone dosing calculator, or medication recommendation system
- A surgery eligibility system or dysphoria assessment
- A gender identity test
- A social network or dating app
- A medical advice platform or provider marketplace

PRISM organizes and documents the user's experience. It does not determine what the user should do medically.

## 8. Product Philosophy

PRISM is built around five principles.

### 8.1 Person First
PRISM adapts to the person. The product must never force a predefined transition path.

### 8.2 No Assumptions
PRISM must never assume: gender, pronouns, sexual orientation, HRT usage, medication usage, surgery, dysphoria, legal transition, social transition, transition start date, transition goals, or a transition endpoint. Every relevant area is optional.

### 8.3 Private by Default
PRISM contains extremely personal information. Privacy is not a premium feature — it is foundational. Private notifications are enabled by default. Sensitive information should never unnecessarily appear on a lock screen.

### 8.4 No Judgment
A missed medication is not a failure. A changed plan is not a failure. Stopping HRT is not a failure. Starting HRT is not a failure. Changing a name or pronouns is not a failure. Not transitioning medically is not a failure. **PRISM records what happened. It does not judge why it happened.**

### 8.5 No Finish Line
PRISM must never communicate "You completed your transition." There is no universal completion state. The user's journey belongs to them.

## 9. Product Principles

These principles operationalize the philosophy above into rules a designer or engineer can apply directly:

- **Every feature must pass this test:** *Does this make PRISM more useful without telling the user what their journey should look like?* If yes, build it. If no, reconsider it. (The PRISM Rule.)
- Suggested content (milestones, categories, prompts) is always optional and always overridable by a user-created equivalent.
- Language stays neutral and non-clinical: "Skipped intentionally," not "Failed"; "Your story starts wherever you decide," not "No milestones found."
- No feature may imply a required path, a required identity label, or a required medical status.
- Community/social features are explicitly out of scope unless a compelling, privacy-respecting reason emerges (see [`DECISIONS.md`](./DECISIONS.md)).

See the full **Anti-Feature List** and **Non-Negotiable Product Rules** in [`MASTER_BUILD_SPEC.md`](./MASTER_BUILD_SPEC.md).

## 10. Personalization Philosophy

PRISM's core experience model:

```
USER → PREFERENCES → ENABLED MODULES → USER DATA → TODAY'S RELEVANT INFORMATION → PERSONALIZED EXPERIENCE
```

The app should only show the user what is useful to them. A user who tracks nothing medical should never see medical clutter. A user who only journals should see JOURNEY prioritized on TODAY.

**Relevance priorities** (in order):
1. What is due today?
2. What is coming soon?
3. What happened recently?
4. What might be meaningful?
5. What should stay hidden because it isn't relevant?

The last question matters as much as the first — knowing what *not* to show is as core to personalization as knowing what to show. See [`TECHNICAL_BIBLE.md`](./TECHNICAL_BIBLE.md) for the engine's technical implementation and [`MASTER_BUILD_SPEC.md`](./MASTER_BUILD_SPEC.md) for the module-driven configuration model.

## 11. Core User Experience

PRISM has four primary navigation destinations:

| Destination | Role |
|---|---|
| **TODAY** | The user's personalized home screen — relevance. "What matters to me today?" |
| **CARE** | Medications, injections, appointments, labs, and procedures — organization. |
| **JOURNEY** | Timeline, milestones, journal, and memories — story and reflection. |
| **YOU** | Identity, customization, privacy, settings, legal information, account — control. |

**Core user experience rule:** PRISM should always answer *"What is useful to this person right now?"* — never *"How can we show them more features?"*

### The ideal session

A user opens PRISM. The app recognizes what matters to them. They immediately see what they need. They log something. They look at their journey. Maybe they write something. Then they close the app. They don't feel like they just used a hospital database — they feel like they spent a moment with **their own story**. A successful PRISM session might take twenty seconds, and that is success, not a failure to engage.

### Product emotion

PRISM should make the user feel: **seen, organized, safe, in control, not judged, not rushed, not defined by the app.**

## 12. Product Boundaries

PRISM stores and organizes what the user tells it. It does not interpret, recommend, or diagnose. Concretely:

- Users may enter dosage information; PRISM may store and display it. PRISM must **never** recommend doses, calculate hormone doses, suggest dose changes, determine whether a dose is appropriate, or diagnose medication problems.
- PRISM stores lab information; it does not interpret medical results.
- PRISM does not provide medical claims about injection sites, surgery readiness, or hormone levels.
- An optional future **PRISM Assistant** may help users navigate *their own* recorded information ("When was my last appointment?"). It must never answer medical-decision questions ("Should I increase my testosterone dose?"). See §51/§60–61 of the source material and [`MASTER_BUILD_SPEC.md`](./MASTER_BUILD_SPEC.md) §AI Strategy.
- AI is optional and must never become the identity of PRISM.
- Community and social features (public profiles, follower counts, leaderboards) are out of scope — see the Anti-Feature List in [`MASTER_BUILD_SPEC.md`](./MASTER_BUILD_SPEC.md).

## 13. MVP Definition

**This scope was confirmed by explicit product-owner decision on 2026-09-01** (see [`DECISIONS.md`](./DECISIONS.md) §Full MVP (P0) / next-release (P1) scope), resolving an earlier inconsistency across source material about whether Labs, Procedures, and Legal Journey belonged in the first release. They do not.

The first release includes:

- **Account** — signup, login, email verification, password recovery, account deletion
- **Onboarding** — philosophy, module selection, identity, care setup, privacy setup
- **Personalization** — the module-driven configuration model and the engine that drives TODAY
- **TODAY** — personalized dashboard, relevant cards, Quick Add
- **CARE** — medications, medication logging, reminders, injections, appointments
- **JOURNEY** — timeline, milestones, journal
- **YOU** — profile, Customize PRISM, notifications, privacy, app lock, accessibility, settings
- **Data** — export, account deletion

**Deferred to the next release (P1):** Labs, Procedures, Legal Journey, Memories, Documents, Universal Search, advanced recurring schedules, supply tracking, and enhanced journal functionality. The database schema and storage architecture anticipate all of these from the start (see [`TECHNICAL_BIBLE.md`](./TECHNICAL_BIBLE.md) and [`MASTER_BUILD_SPEC.md`](./MASTER_BUILD_SPEC.md) §18) — only their user-facing screens are deferred.

Full screen-by-screen MVP priority (P0/P1/P2) is defined in [`SCREEN_BIBLE.md`](./SCREEN_BIBLE.md) §MVP Screen Priority and [`MASTER_BUILD_SPEC.md`](./MASTER_BUILD_SPEC.md) §24–25.

## 14. Future Vision

### P1 / Version 1.1 (adopted scope — see [`DECISIONS.md`](./DECISIONS.md))
Labs, Procedures, Legal Journey, Memories, Documents, Universal Search, advanced recurring schedules, supply tracking, and enhanced journal functionality — this is the confirmed next-release scope from §13 above, not a loose candidate list. Also still under consideration for this release or later, at the team's discretion: home-screen widgets, advanced timeline visualization, additional customization.

### Version 2 (candidate features)
Secure document vault, advanced photo memories, cloud backup, enhanced export, health-ecosystem integrations where appropriate, provider information, insurance information, PRISM Resources, PRISM Insights, an optional PRISM Assistant, and an optional PRISM Connect.

Community is explicitly **not** a V1 priority. PRISM should not become another social network unless there is a compelling, deliberately-evaluated reason to do so.

### Business model

**Free tier** covers core functionality: personalized dashboard, medications, appointments, Journey, milestones, journal, and basic reminders.

**Potential PRISM+** (premium, unvalidated): secure document vault, advanced backups and exports, photo memories, advanced customization, additional storage.

The business model must **never** depend on selling user data. Before launching any paid feature, validate that users actually want it — do not assume.

## 15. Success Metrics

PRISM should not optimize purely for screen time or engagement. A twenty-second session — open, check, log, leave — is a success, not a failure to engage.

Metrics that matter:

- Onboarding completion
- Module activation
- Reminder completion
- Record creation
- Weekly and monthly retention
- Export usage
- Account deletion success (as a trust signal, not just an attrition signal)
- Crash-free sessions
- Notification engagement
- User satisfaction
- Trust / privacy perception

## 16. User Research Strategy

Before public launch, test with a diverse group including: trans men, trans women, nonbinary people, HRT users and non-users, injection users and non-users, people early in their journey and people further along, and people pursuing surgery and people who are not.

Ask questions that surface hidden assumptions, not aesthetic preference:

- What did PRISM assume about you?
- Did you understand what to do?
- What felt unnecessary?
- What did you expect to find?
- What felt uncomfortable?
- Would you trust PRISM with this information?
- What would make you stop using it?

**Beta:** target 50–100 users. Goals: find usability problems, identify privacy concerns, test personalization, validate onboarding and reminders and core workflows, and discover unnecessary features. Do not expand feature scope just because testers suggest every possible feature — look for patterns, not a wish list.

## 17. Product Decisions That Affect the Overall Experience

The explicit, load-bearing product decisions below shape every downstream screen and technical choice. The authoritative, dated log of these (plus anything added later) lives in [`DECISIONS.md`](./DECISIONS.md); the ones most central to the product experience are:

- The primary navigation is TODAY / CARE / JOURNEY / YOU, and each destination has a distinct job (relevance / organization / story / control) — features should not blur these roles.
- Disabled modules hide data; they do not delete it (§Customize PRISM, §Modules).
- Suggested milestones, categories, and prompts are never mandatory and are always paired with a "create your own" option.
- Private notifications are the default, not an opt-in.
- PRISM is not, and must never present itself as, a medical provider.

## 18. Brand Voice

PRISM should sound calm, direct, respectful, modern, human, affirming, and intelligent. Avoid excessive inspirational language, infantilizing language, clinical jargon, assumptions, political slogans, and forced positivity. PRISM does not need to constantly remind the user that it is "proud" — it simply needs to respect them.

**Microcopy examples:**

| Prefer | Avoid |
|---|---|
| Add medication | Begin your medication journey! |
| Log injection | Track your transformation! |
| Your story starts wherever you decide. | Start becoming your true self! |
| Skipped intentionally | Failed |
| You've logged 12 times this month. | 🔥 47-day streak! |

PRISM should never imply that someone is incomplete, and should use **light reinforcement**, never addictive gamification or shame-based streaks.

## 19. Trust

PRISM's most important product asset is not its UI. It is **trust**. Every design decision should be evaluated against one question:

**Would I trust this app with the most private parts of my life?**

If the answer is no, redesign it.

## 20. Final Product Statement

PRISM exists because there has never been a single correct way to navigate gender. Some journeys are medical. Some are social. Some are legal. Some are emotional. Some are private. Some are complicated. Some are still being figured out. PRISM does not decide which journey is legitimate. It gives people a place to manage, document, remember, and understand **their own**.

### The North Star

Every PRISM decision should ultimately serve one sentence:

# Your journey. Your way.

Not the app's journey. Not society's journey. Not a doctor's journey. Not someone else's transition.

**Yours.**
