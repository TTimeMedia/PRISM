# PRISM Security

This document defines PRISM's security and privacy posture. It complements [`TECHNICAL_BIBLE.md`](./TECHNICAL_BIBLE.md) (architecture) and [`MASTER_BUILD_SPEC.md`](./MASTER_BUILD_SPEC.md) (build requirements), and should be read before implementing any feature that touches authentication, storage, notifications, logging, or analytics.

PRISM handles some of the most sensitive information a person can generate: gender identity, medical and medication data, legal status, and private journal reflections. Every design decision here is evaluated against one question, carried over from [`PRODUCT_BIBLE.md`](./PRODUCT_BIBLE.md) §Trust: **would I trust this app with the most private parts of my life?**

---

## 1. Authentication Security

- Use Supabase Auth. MVP methods: email + password, email verification, password recovery/reset, sign out.
- **Forgot-password behavior must never reveal whether an email address exists** — always respond with the same message ("If an account exists for this email, we'll send instructions to reset your password.") regardless of whether the account is real.
- Social login is not required for MVP and can be added later without weakening these guarantees.
- Session handling and authentication boundaries are explicitly in the security test plan (§12).

## 2. Supabase Row Level Security (RLS)

- **Every user-owned table must have RLS enabled**, with policies for SELECT, INSERT, UPDATE, and DELETE as appropriate.
- The core policy for every such table: an authenticated user may access only records where `user_id = auth.uid()`.
- **Never rely on frontend filtering as a security boundary.** The frontend can hide functionality; only the database enforces permissions.
- A user must never be able to query, guess into, or modify another user's records — this must be verified by automated tests (§12), not just manual review.

## 3. User Ownership

The user owns their information. Every user-owned table carries a `user_id` column and is scoped by it end-to-end — in RLS policies, in application queries, and in storage paths. Client-provided ownership fields are never trusted; the server (RLS / auth context) is always the source of truth for whose data is being read or written.

## 4. Database Security

- UUID primary keys throughout; sequential/guessable IDs are not used for user-facing records.
- Validation exists on both client and server; the server (schema constraints + RLS) is the actual security boundary, not client-side form validation.
- See [`MASTER_BUILD_SPEC.md`](./MASTER_BUILD_SPEC.md) §18 for the canonical table-by-table schema.

## 5. Storage Security

- Sensitive files (profile photos, memories, documents, attachments) live in **private storage buckets** — never public buckets.
- Storage policies verify ownership the same way database RLS does.
- Storage paths must never be publicly resolvable. Where a temporary public link is genuinely necessary, use short-lived signed URLs, not permanent public URLs.
- Documents are treated as a **high-security feature**: names may be listed, but contents are not rendered until explicitly opened by the user, and sharing a document out of PRISM requires an explicit user action — it is never automatic or implied.

## 6. Sensitive Data Handling

Sensitive categories include: gender identity, pronouns, medication names and dosages, injection sites, appointment details, lab results, legal document status, journal content, and photos/memories.

Rules that apply everywhere this data could flow:

- Never expose it in URLs.
- Never expose it in crash reports.
- Never expose it in debugging screenshots.
- Never expose it unnecessarily in notification previews or lock-screen content (§7).
- Never send it to third-party services casually — every third-party integration is evaluated for data collection, retention, processing, security, privacy policy, international transfer, and whether sensitive information would actually be transmitted, before it is adopted (see [`PRODUCT_BIBLE.md`](./PRODUCT_BIBLE.md) §72 in the source material).
- PRISM should minimize third-party dependencies generally, precisely because every dependency is a place this data could leak.

**Security red flags** — stop and review any feature involving health data, gender identity, legal documents, medical records, photos, journal entries, provider information, insurance, AI processing, third-party analytics, or external integrations, before shipping it.

## 7. Private Notifications

- **Private notifications are the default, not an opt-in.**
- Default content is generic and reveals nothing: _"Your PRISM reminder is ready."_
- Never default to sensitive content such as _"Your testosterone injection is due"_ or _"Your surgery appointment is tomorrow."_
- Users may explicitly opt into more detailed notification content — the point is that the safer default is the one nobody has to think about.

## 8. App Lock & Biometrics

- Support Face ID, Touch ID, Android biometrics, with PIN as a fallback when biometrics are unavailable.
- The lock screen must expose **nothing**: no medication names, appointments, gender, pronouns, journal content, or transition information — only the PRISM mark and an unlock prompt.
- App lock is tested as part of every release's security check (§12).

## 9. Data Export

- Users can export their data in structured formats — JSON and CSV for MVP; a human-readable PDF is a later enhancement.
- Export should be comprehensive enough to be genuinely useful, not a token gesture, and it must be tested (not just implemented) before each release.

## 10. Account Deletion

Account deletion must:

1. Confirm the user's intention.
2. Explain what will be deleted, in plain language.
3. Delete application records.
4. Delete associated storage files.
5. Delete the authentication account.
6. Ensure no orphaned sensitive data is left behind anywhere in the system.

**No dark patterns** — the path to deletion must be as clear as the path to any other setting, and deletion must be covered by automated tests, not just a manual walkthrough.

## 11. Logging Restrictions

**Never log:** journal contents, medication names unnecessarily, dosages, gender identity, pronouns, legal information, medical records, document contents, or private photos. Production logs should contain identifiers necessary for debugging (e.g. a record ID or user ID for correlation), not sensitive user content. This is an architectural principle (see [`TECHNICAL_BIBLE.md`](./TECHNICAL_BIBLE.md) §3, Principle 7), enforced through code review and, ideally, log-scrubbing checks — not left to individual engineer discretion at write time.

## 12. Analytics Restrictions

Analytics must be privacy-conscious and collect only what's necessary.

**Never send to analytics:** journal text, medication names, dosage, injection sites, medical records, legal document contents, sensitive document filenames, or private memory content.

**Prefer aggregate, contentless product events**, e.g.: `onboarding_completed`, `module_enabled`, `record_created`, `reminder_completed`, `export_requested`, `account_deleted`. Even these should be reviewed periodically for privacy implications — an event name itself should never leak what was tracked (e.g. `medication_logged: true` is fine; `medication_name: testosterone` is not).

## 13. Encryption Considerations

- Use encrypted connections for all client-server traffic (TLS).
- Use Supabase's storage and database encryption at rest as the baseline; do not build custom encryption schemes without a specific, reviewed reason.
- Encryption is necessary but not sufficient — it does not substitute for RLS, storage-policy ownership checks, or the logging/analytics restrictions above, all of which govern what data exists to be encrypted in the first place.

## 14. Secrets Management

- Sensitive credentials must **never** be committed to Git.
- Use environment variables for the Supabase URL, Supabase keys, API credentials, notification configuration, and analytics configuration.
- **Never expose Supabase service-role keys, administrative secrets, private API keys, or other privileged credentials to the mobile client.** The mobile app only ever holds the anon/public key plus the authenticated user's own session.

## 15. Environment Variables

Maintain separate **development**, **staging**, and **production** environments. Never test destructive migrations directly against production. Document every required environment variable so a new engineer (or Claude Code, on a fresh session) can stand up the app without guessing.

## 16. Backup Considerations

Supabase-managed PostgreSQL backups are the MVP baseline. As the product matures, define and document explicit backup frequency, retention, and restore-testing procedures — an untested backup is not a backup. Advanced/cloud backup for user-facing data (as a feature) is a V2 consideration (see [`MASTER_BUILD_SPEC.md`](./MASTER_BUILD_SPEC.md) §26), distinct from operational database backups, which are needed from day one.

## 17. Data Retention

- PRISM must have a documented data retention policy before public launch (see §19).
- Deleted records and deleted accounts should not linger in backups or logs indefinitely outside of what's operationally necessary for disaster recovery — define a concrete retention window as part of legal/privacy review, rather than leaving it unspecified.

## 18. Privacy Requirements

- Minimize collected information; identity fields are optional, not required.
- Avoid unnecessary and sensitive analytics (§12).
- Support data export (§9) and account deletion (§10).
- Protect sensitive notifications (§7) and lock-screen content (§8).
- **Never sell transition data, health data, journal content, medication information, or identity information.**
- **Never use sensitive data for invasive advertising, and never target advertising based on transition or health status.**
- Never share personal information without an appropriate legal basis and clear user disclosure.

Privacy is a core brand differentiator for PRISM, not a compliance checkbox — see [`PRODUCT_BIBLE.md`](./PRODUCT_BIBLE.md) §8.3.

## 19. Security Testing

Before every release, verify (see also [`TECHNICAL_BIBLE.md`](./TECHNICAL_BIBLE.md) §18 and [`SCREEN_BIBLE.md`](./SCREEN_BIBLE.md) §12):

- Authentication tested
- RLS tested — including explicit attempts to access another user's record, guess another user's UUID, modify another user's record, access another user's file, access deleted records, and bypass client-side permissions. **Every attempt must fail.**
- Storage policies tested
- Account deletion tested
- Export tested
- Notification privacy tested
- App lock tested
- Sensitive logging reviewed
- Third-party data flows reviewed

## 20. Incident Considerations

PRISM must have documented security incident procedures before public launch, covering at minimum: how a suspected breach or unauthorized access is detected, who is notified internally, how affected users are notified (and on what timeline, consistent with applicable law), and how the incident is remediated and reviewed afterward. This procedure should exist in writing _before_ it's needed — treat "we'll figure it out if it happens" as a gap to close before launch, not an acceptable interim state.

## 21. Legal / Privacy Review Requirements

PRISM must have, before public launch:

- Privacy Policy
- Terms of Service
- Data retention policy (§17)
- Account deletion process (§10)
- Data export functionality (§9)
- Consent/disclosure language
- Security incident procedures (§20)
- Appropriate app-store privacy disclosures

**Do not casually claim "HIPAA compliant."** Whether HIPAA (or any other health-privacy regulation) applies to PRISM depends on its actual business relationships, data flows, and role in the healthcare ecosystem — none of which are settled by this document. **Legal and privacy review by qualified counsel is required before launch**, and any compliance claim made in-product, in marketing, or in app-store listings must be verified against that review, not asserted from engineering assumptions.

---

## Summary: the non-negotiables

1. RLS on every user-owned table, enforced server-side, verified by adversarial tests.
2. Private notifications and a content-free lock screen by default.
3. No sensitive content in logs, analytics, crash reports, URLs, or debugging artifacts.
4. No service-role or privileged credentials on the client, ever.
5. Comprehensive, tested account deletion and data export.
6. No sale of transition/health/identity data, and no compliance claims without legal review.
