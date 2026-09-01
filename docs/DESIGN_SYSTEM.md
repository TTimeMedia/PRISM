# PRISM Design System

Version 1.0 — Visual & Interaction Foundation
Tagline: Your journey. Your way.

This document defines PRISM's visual and interaction language. It exists to keep PRISM from drifting toward a generic healthcare app, a generic LGBTQ+ app, a generic fitness app, or a generic productivity app — each a real and specific failure mode named below. For product intent, see [`PRODUCT_BIBLE.md`](./PRODUCT_BIBLE.md); for how these tokens map onto components, see [`MASTER_BUILD_SPEC.md`](./MASTER_BUILD_SPEC.md) §Design System Implementation.

---

## 1. Visual Philosophy

PRISM should feel:

- **Personal** — this is someone's space, not a clinic portal.
- **Premium** — intentional, polished, and considered.
- **Private** — calm, discreet, and trustworthy.
- **Expressive** — identity is welcome without being forced.
- **Modern** — contemporary without chasing UI trends.
- **Calm** — no anxiety-inducing medical dashboard aesthetic.
- **Human** — information should feel approachable.

### The central visual metaphor

PRISM is built around **Light → Prism → Spectrum**. Light enters a prism and becomes something more expansive — one input, refracted into a spectrum unique to how it passes through. That metaphor should influence the interface without becoming literal everywhere: subtle refraction, spectrum highlights, light trails, translucent surfaces, geometric shapes, controlled gradients, soft glow, moments of color emerging from darkness.

**The interface should still look excellent if all spectrum effects were removed.** The metaphor is seasoning, not the meal.

## 2. The PRISM Aesthetic

### What PRISM should feel like

Imagine combining **Apple-level restraint** with **a private journal** with **a beautifully designed personal dashboard** with **subtle light/refraction** with **the emotional intelligence of a product that knows there is no universal transition path.** That is PRISM.

### What PRISM should NOT feel like

| Failure mode | Symptoms |
|---|---|
| Generic healthcare app | Blue, white, charts, medical icons, clinical language |
| Generic LGBTQ+ app | Rainbow everywhere, flags everywhere, Pride imagery everywhere |
| Generic fitness app | Progress rings, streaks, achievements, gamification |
| Generic productivity app | Endless checklists, tasks, notification overload, productivity scores |
| Generic social app | Likes, followers, feeds, engagement loops |

**Do not use:** rainbow backgrounds everywhere, excessive gradients, rainbow borders, stereotypical LGBTQ+ iconography, syringe/pill imagery as the primary brand identity, generic medical blue, excessive glassmorphism.

### Brand personality

PRISM should communicate **"This belongs to you,"** never **"Here is your transition checklist."** The interface should never make a person feel like they're being evaluated.

**Preferred language:** Your journey · Your PRISM · Your records · Your memories · What matters to you · Whenever you're ready · Nothing here yet. That's okay. · You can change this anytime.

**Avoid:** Progress score · Transition percentage · Completion percentage · You're behind · You're on track · Transition completed · Failed · Overdue transition milestone · Normal/abnormal · Pass/fail.

## 3. Design Principles

1. **Person before data** — information serves the person; never make the database structure visible in the experience.
2. **Progressive disclosure** — show what matters now, hide complexity until needed. A medication list should not feel like a pharmacy database.
3. **Color has meaning** — spectrum colors are accents, not decoration; color is never the only way information is communicated.
4. **Space is part of the interface** — PRISM should breathe; avoid dense layouts unless the information genuinely requires density.
5. **Privacy should be visible** — privacy is part of the product's identity, not an afterthought buried inside Settings.
6. **No finish line** — the UI must never imply that someone's journey has a universal endpoint.

## 4. Color System

PRISM uses a **dark-first** visual language.

### Core dark tokens

| Token | Value | Usage |
|---|---|---|
| `PRISM_BLACK` | `#0B0B0F` | App background, lock screen, splash screen |
| `PRISM_DARK` | `#0F0F14` | Secondary background regions |
| `PRISM_SURFACE` | `#121218` | Cards, sheets, navigation surfaces |
| `PRISM_SURFACE_2` | `#191921` | Elevated cards, input fields, secondary controls |
| `PRISM_SURFACE_3` | `#22222C` | Selected controls, strong emphasis surfaces |

### Light mode

| Token | Value |
|---|---|
| `PRISM_WHITE` | `#F8F8FA` |
| `PRISM_LIGHT` | `#F2F2F5` |
| `PRISM_LIGHT_2` | `#EAEAEE` |
| `PRISM_LIGHT_3` | `#DEDEE5` |

Light mode is **not** a simple inversion of dark mode — it must independently preserve hierarchy, softness, premium feel, and spectrum accents. Use warm/off-white surfaces; avoid pure white everywhere, harsh black text, and excessive borders.

### Spectrum palette (signature accent system)

| Token | Value | Typical use |
|---|---|---|
| `PRISM_CYAN` | `#5BCFFB` | Primary action, active navigation, links, focus state |
| `PRISM_PINK` | `#F5A9B8` | Personal/journey moments, memories, emotional/reflection surfaces |
| `PRISM_VIOLET` | `#B58CFF` | Journey, milestones, special moments |
| `PRISM_MINT` | `#8DE8C5` | Completed states, positive confirmations, successful saves |
| `PRISM_YELLOW` | `#FFE58A` | Attention, upcoming, gentle reminders |

These assignments are guidelines, not rigid rules. **Spectrum gradient** (Cyan → Pink → Violet → Mint → Yellow) is reserved for branding, hero moments, subtle highlights, and the PRISM logo — never for every button, card, background, heading, or icon. A spectrum gradient should feel *special*.

### Text colors

| Token | Dark mode | Light mode |
|---|---|---|
| `TEXT_PRIMARY` | `#F8F8FA` | `#111116` |
| `TEXT_SECONDARY` | `#B8B8C2` | `#5F5F6B` |
| `TEXT_TERTIARY` | `#858591` | `#858591` |
| `TEXT_DISABLED` | `#555560` | `#B0B0BA` |
| `TEXT_INVERSE` | `#0B0B0F` | `#F8F8FA` |

### Borders

Borders should be subtle — avoid heavy outlines.

| Token | Dark | Light |
|---|---|---|
| `BORDER_SUBTLE` | `rgba(255,255,255,0.07)` | `rgba(0,0,0,0.06)` |
| `BORDER_DEFAULT` | `rgba(255,255,255,0.11)` | `rgba(0,0,0,0.10)` |
| `BORDER_STRONG` | `rgba(255,255,255,0.18)` | `rgba(0,0,0,0.16)` |

### Color accessibility

Never communicate meaning through color alone. Bad: *green = completed.* Better: *✓ Completed*, with green as a supporting cue. Applies equally to warnings, errors, reminders, selected states, and categories.

### Dark mode & light mode character

Dark mode is PRISM's **signature** environment — deep, quiet, premium, private (not "black + neon cyberpunk"), with spectrum accents used selectively against the dark foundation. Light mode should feel clean, soft, and optimistic.

## 5. Typography

**Primary typeface: Inter** — navigation, body, forms, labels, buttons, data, settings, system information.

**Display typeface: Sora** — used sparingly for PRISM branding, major screen headings, hero moments, onboarding, and special milestone moments. Sora should create distinction without making the app feel like a marketing website.

### Type scale (size / line-height)

| Style | Size / Line-height |
|---|---|
| Display XL | 40 / 46 |
| Display L | 34 / 40 |
| Display M | 28 / 34 |
| Heading XL | 24 / 30 |
| Heading L | 20 / 26 |
| Heading M | 18 / 24 |
| Body L | 17 / 25 |
| Body M | 15 / 22 |
| Body S | 14 / 20 |
| Caption | 12 / 17 |
| Micro | 11 / 15 |

Avoid excessive font sizes — mobile interfaces should prioritize readability over visual drama.

### Font weights

Regular (400), Medium (500), Semibold (600), Bold (700). Primary UI favors 400/500/600; 700 is reserved for strong emphasis.

## 6. Spacing

Use an 8-point base grid: **4, 8, 12, 16, 24, 32, 40, 48, 64, 80px.**

| Use | Value |
|---|---|
| Screen horizontal padding | 20px |
| Card padding | 16px |
| Large card padding | 20px |
| Section spacing | 32px |
| Major section spacing | 48px |
| Button height | 52px |
| Input height | 52px |
| Minimum touch target | 44px |
| Preferred touch target | 48px+ |

## 7. Corner Radius

PRISM uses soft but controlled geometry.

| Token | Value | Recommended use |
|---|---|---|
| Radius XS | 6px | — |
| Radius S | 10px | — |
| Radius M | 14px | Inputs (12–14px), Buttons (14px) |
| Radius L | 18px | Cards (18px) |
| Radius XL | 24px | Large feature cards (24px) |
| Radius Pill | 999px | Tags |

Avoid putting every element inside a pill.

## 8. Shadows & Surface Hierarchy

PRISM relies on **contrast**, not dramatic shadows.

- Dark mode: `0 8px 32px rgba(0,0,0,0.25)` — extremely subtle elevation.
- Light mode: `0 8px 30px rgba(0,0,0,0.08)`.

Never use dramatic floating-card shadows.

**Layer hierarchy:** Background → Surface → Elevated Surface → Interactive Surface → Focused Surface. Example: Background `#0B0B0F` → Card `#121218` → Input `#191921` → Selected `#22222C`.

## 9. Cards

Cards are a primary PRISM component. **Standard card:** Surface background, 18px radius, 16–20px padding, subtle border, minimal shadow. A card contains a clear title, supporting information, an optional icon, and an optional action. **Do not make every piece of information a card.**

### TODAY cards

TODAY is the most personalized surface in the app. Cards are prioritized: (1) action required now, (2) upcoming, (3) recent, (4) reflection, (5) nothing. Content is fully dynamic — no fixed card set for every user.

## 10. Buttons

| Type | Spec | Use |
|---|---|---|
| **Primary** | 52px height, 14px radius, weight 600, strong-but-restrained accent | The single most important action on screen. Never every button as a spectrum gradient. |
| **Secondary** | Transparent or surface background, subtle border | Supporting actions |
| **Tertiary** | Text-only | Cancel, Edit, Learn more, secondary navigation |
| **Destructive** | Reserved styling | Only for genuinely destructive actions — never use red simply because something is inactive |

## 11. Inputs

Inputs should feel like part of the product, not a browser form: visible label above the field, supporting text below.

**Rules:** labels always visible (never placeholder-as-label); errors appear below the field; entered values are preserved after a validation error; keyboard-aware layout; dynamic text size support; clear focus state; never use color alone to communicate an error.

### Selection controls

Segmented controls, radio buttons, checkboxes, switches, and chips — chosen by context, not chips for everything. **Module selection cards** should be visually richer than a plain checkbox row (icon, title, short description, selected-state check).

## 12. Navigation

Primary navigation — TODAY / CARE / JOURNEY / YOU — uses a bottom navigation bar. Active tab: stronger text, subtle spectrum accent, clear icon treatment. Inactive tabs: muted text, muted icon. Avoid oversized navigation icons.

### Quick Add

The global **+** should feel like *"Capture something,"* not *"Enter data."* The Quick Add sheet ("Add to PRISM") lists: Medication, Injection, Appointment, Lab, Procedure, Milestone, Journal, Memory, Document — **only the options relevant to the user's enabled modules.**

## 13. Icons

A consistent, modern icon library: geometric, rounded, simple, thin-to-medium stroke, easily recognizable, generally 20–24px. Avoid cartoon icons, overly detailed medical illustrations, and inconsistent icon weights.

## 14. Logo

The PRISM logo should be geometric, exploring prism geometry, refraction, the letter P, and spectrum emerging from a single shape. It must work monochrome, black/white, spectrum, as an app icon, favicon, social avatar, and in print. **Never use a syringe, pill, medical cross, or generic rainbow.**

## 15. Timeline Visual Language

The JOURNEY timeline should not look like a hospital record — it uses a **path of light**, with events emerging from the path and subtle spectrum changes distinguishing event categories. The timeline should communicate *"Your story is unfolding,"* never *"You are progressing toward completion."*

## 16. Milestone Visual Language

Milestones deserve slightly more visual emphasis than ordinary records: a larger icon, spectrum accent, date, title, and optional image (e.g. "✦ First Pride — September 2026 — A moment worth remembering."). Custom milestones must feel equally important as suggested milestones — no visual second-class treatment for a user-created entry.

## 17. Journal Visual Language

Journal should feel intentionally quiet. Avoid clinical mood trackers, mental-health dashboards, and aggressive mood charts — the primary experience is writing. Mood is optional and must never be a forced rating.

## 18. Memories

Memories prioritize visual storytelling — a photo grid layout. Primary concept: **"Not progress. Memories."** Avoid before/after framing entirely; PRISM never implies photographs exist to document physical change.

## 19. Care Visual Language

CARE should feel organized but not clinical. Categories may use subtle visual differentiation — Medications (Cyan), Injections (Violet), Appointments (Mint), Labs (Yellow), Procedures (Pink) — but color must never be the only differentiator (see §4 Color Accessibility).

## 20. Journey Visual Language

JOURNEY can be more expressive than CARE: gradients, light paths, larger typography, imagery, subtle spectrum effects.

**The four-area visual distinction:** CARE = structure. JOURNEY = story. TODAY = relevance. YOU = control. This distinction is load-bearing — it's how the same design system produces four visually and emotionally distinct areas without becoming inconsistent.

## 21. YOU Visual Language

YOU should be quieter — it is the control center. Sections: Profile · Customize PRISM · Privacy, Notifications, Appearance, Accessibility · Legal Journey, Documents · Data & Export, Support, About. Group logically; do not let Settings become an endless flat list.

## 22. Privacy UI

Privacy should feel premium, not intimidating — e.g. a Privacy screen headlined "Your information belongs to you," with clear toggles (Face ID, Private notifications) and clear links (Export your data →, Delete your account →).

### App Lock

The lock screen exposes almost nothing: the PRISM mark, "Unlock to continue," and a biometric prompt. No medication names, appointments, notifications, journey information, or profile information — ever.

### Notifications

Default: **private notifications ON.** Example: *"Your PRISM reminder is ready."* Never default to *"Your testosterone injection is due"* or *"Your surgery appointment is tomorrow."* Sensitive context stays hidden unless the user explicitly opts in to more detail.

### Privacy-safe visual design

Never display sensitive information unnecessarily — not in notifications, not on the lock screen. The user chooses how much information is exposed; the default is always the least revealing option.

## 23. Motion

Motion is part of the PRISM identity, representing *light moving → refracting → settling.*

**Standard durations:** Micro 100–150ms · Standard 180–250ms · Large 300–450ms. Use easing, not linear motion.

### Signature PRISM motion

Reserve subtle refraction effects for: onboarding, PRISM creation, milestone creation, successful save, and major navigation transitions — a tiny light travels across a surface, briefly splits into spectrum colors, then disappears. It should feel like a signature, **not** an animation that happens on every tap.

### Reduced motion

When Reduce Motion is enabled: remove floating animation, refractive movement, parallax, and elaborate transitions; replace with fades, instant state changes, and minimal opacity transitions. PRISM must remain fully understandable without motion.

### Haptics

Use sparingly — appropriate for successful save, completed medication log, milestone creation, destructive confirmation. Avoid haptics on every interaction.

## 24. Accessibility

Accessibility is a product requirement, not a checklist item added at the end. Support: Dynamic Type, screen readers, VoiceOver, TalkBack, keyboard navigation where applicable, high contrast, reduced motion, large touch targets, accessible labels, semantic headings, logical focus order.

**Minimum touch target:** 44×44px. **Preferred:** 48×48px.

## 25. Empty States

Empty states should be human, never clinical:

| Context | Copy |
|---|---|
| General | "Nothing here yet. That's okay." |
| Journey | "Your story starts wherever you decide." |
| Memories | "Save the moments that matter to you." |
| Journal | "Whenever you're ready." |
| Care | "Nothing added yet. You can add something whenever you need to." |

Avoid cartoon illustrations unless they genuinely improve the experience.

## 26. Error States

Errors are calm and specific — never `Error 500`. Use *"Something went wrong. Your information wasn't changed."* with **Try again** and, when useful, **Go back.** Never expose raw Supabase/backend errors to users.

### Loading states

Avoid generic spinners where possible — prefer skeletons, subtle shimmer, and soft transitions. The PRISM initialization moment ("Building your PRISM…" with a light-refracting visual) should run roughly 1–2 seconds; never artificially delay loading beyond that.

### Confirmation modals

Use sparingly, e.g. *"Delete this journal entry? This can't be undone."* with Cancel/Delete. Reserve for genuinely high-risk actions.

## 27. Component Architecture

Build reusable components rather than designing each screen independently. Core component set:

`PRISMButton` · `PRISMIconButton` · `PRISMCard` · `PRISMSection` · `PRISMInput` · `PRISMTextArea` · `PRISMSelect` · `PRISMSwitch` · `PRISMChip` · `PRISMModal` · `PRISMSheet` · `PRISMToast` · `PRISMSkeleton` · `PRISMEmptyState` · `PRISMErrorState` · `PRISMListItem` · `PRISMHeader` · `PRISMBottomNav` · `PRISMQuickAdd` · `PRISMTimeline` · `PRISMMilestone` · `PRISMMemoryCard` · `PRISMReminderCard`

### Design tokens

Centralize tokens rather than scattering arbitrary values throughout the app, e.g.:

```
colors.background / colors.surface / colors.surfaceElevated
colors.text.primary / .secondary / .tertiary
colors.accent.cyan / .pink / .violet / .mint / .yellow
spacing.xs / .sm / .md / .lg / .xl
radius.sm / .md / .lg / .xl
typography.display / .heading / .body / .caption
```

### Component states

Every interactive component defines: Default, Pressed, Focused, Selected, Disabled, Loading, Error, Success. Do not design only the happy path.

### Form states

Every form accounts for: Empty, Typing, Focused, Validation error, Submitting, Success, Network failure, Offline, Unsaved changes.

### Content hierarchy

Every screen has one dominant action or purpose: Screen title → Context → Primary information → Secondary information → Action. Do not make five things visually dominant at once.

### Responsive behavior

Mobile is primary, but components should support iPhone, Android, tablet, and web where applicable. Do not simply stretch mobile screens onto desktop — desktop layouts should introduce larger content areas, side navigation where appropriate, multi-column views, and persistent context.

### Data density

PRISM has two density modes: **Personal mode** (TODAY, JOURNEY, JOURNAL, MEMORIES) — low density, large spacing, visual storytelling. **Administrative mode** (CARE, Legal, Documents, Settings) — higher density, clear hierarchy, efficient scanning. This split keeps the whole app from feeling like a database while still letting organizational screens be genuinely useful.

### Personalization architecture (visual)

The visual system must support dynamic content: a user who enables only Journal, Memories, and Milestones should see a fundamentally different TODAY from someone who enables Medications, Injections, Appointments, and Labs. **Do not render empty containers for disabled modules.**

## 28. Photography & Illustration

**Photography**, where used, should feel personal: real moments, imperfect moments, ordinary life, meaningful memories. Avoid stock photography depicting generic transgender stereotypes. PRISM should never imply that a person's body must change to make their story meaningful.

**Illustration** should be abstract and geometric: prism, light beam, refracted shape, geometric fragments, spectrum lines, soft particles. Avoid cartoon doctors, syringes, pills, hospital imagery, and stereotypical transition imagery.

## 29. Microcopy Rules

PRISM copy is concise, respectful, neutral, human, nonjudgmental, and uses contractions naturally. Prefer *"You can change this anytime"* over *"This setting may be modified at any time."* Prefer *"Nothing here yet"* over *"No records have been created."*

## 30. Signature PRISM Moments

A small number of memorable experiences carry the brand:

- **First Launch** — dark screen, a beam of light enters and refracts, the PRISM logo appears, "Your journey. Your way."
- **Building PRISM** — selected modules visually converge into the user's personalized PRISM; the interface subtly reorganizes; then "Your PRISM is ready."
- **Milestone** — saving an important milestone triggers a subtle spectrum pulse. No confetti, no gamification — just "Saved to your journey."
- **Memory** — after saving, "Saved." The image becomes part of the user's visual timeline.

## 31. The PRISM Test

Every new screen must pass these questions before shipping:

1. Does this feel like PRISM? *(If it could belong to any generic healthcare app, redesign it.)*
2. Does this assume something about the user? *(If yes, remove the assumption.)*
3. Is the information necessary? *(If not, hide it.)*
4. Is the interface calmer than the problem? *(If not, simplify it.)*
5. Is color helping? *(If not, remove it.)*
6. Does the screen respect privacy? *(If not, redesign it.)*
7. Does the screen imply a finish line? *(If yes, change the framing.)*
8. Does accessibility survive the visual design? *(If not, accessibility wins.)*

## 32. Final Design Principle

**PRISM should make someone's journey easier to manage without making their journey feel like a project they have to complete.**

The visual system exists to support that idea.

**Your journey. Your way.**
