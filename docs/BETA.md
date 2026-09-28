# PRISM Beta (Milestone 08)

Started 2026-09-28. Phase 8 in [`MASTER_BUILD_SPEC.md`](./MASTER_BUILD_SPEC.md) §28: _internal testing, closed beta, collect feedback, fix critical issues, review retention, review trust/privacy feedback, iterate._

This document is the working plan. Tick boxes as they're done, and record anything product-visible in [`DECISIONS.md`](./DECISIONS.md) as usual. Launch work (store listing, legal review, production hardening) belongs to milestone 09 and is listed at the end only so nothing falls through.

---

## 1. Entry gates: before anyone else installs Prism

Everything here is done by the product owner on their own iPhone against the hosted project, using a **fresh test account** (not your real one).

### 1a. Ship what's already fixed

- [x] Redeploy `send-push` (2026-09-28, version 2). The deployed version predates `f4efd5e`: `npx supabase functions deploy send-push`
- [ ] New iOS build: the 2026-09-28 `app.json` changes (removed unused camera, microphone and Reminders usage strings) are native, so they only ship in a build. Bump `version` to `0.3.1` first, because the runtime version follows it and a JS update must not reach a build it wasn't made for.
- [x] `eas update --branch preview` for the JS fixes (2026-09-28, group `c04cba24`) if you test on the 0.3.0 build first (export now includes reminders; Support opens email).

### 1b. Acceptance pass

Walk [`MASTER_BUILD_SPEC.md`](./MASTER_BUILD_SPEC.md) §29 on the device. Items 21–26 matter as much as 1–20: do one full pass that skips gender, pronouns, HRT, injections, surgery and dates entirely, and check that nothing asks for them again or looks broken without them.

| #     | Flow                                                                            | Pass | Notes |
| ----- | ------------------------------------------------------------------------------- | ---- | ----- |
| 1–2   | Sign up, verification email arrives, link opens the app                         |      |       |
| 3–7   | Onboarding end to end, then close mid-way and resume                            |      |       |
| 8–10  | Add a medication with a reminder, reminder fires, **Done** logs it              |      |       |
| 11    | Injectable medication: log a dose with a site                                   |      |       |
| 12    | Appointment, including a location suggestion and calendar sync                  |      |       |
| 13–15 | Milestone with photo, journal entry with photo, Timeline shows both             |      |       |
| 16    | Turn a feature off: it disappears from TODAY, CARE and Timeline                 |      |       |
| 17    | Private notifications on: lock screen says only "Your Prism reminder is ready." |      |       |
| 18    | App Lock with PIN and Face ID; background and return; wrong PIN                 |      |       |
| 19    | Export: file opens and contains every section, including `reminders`            |      |       |
| 20    | Delete account (see 1d)                                                         |      |       |
| 21–26 | The "without" pass above                                                        |      |       |
| —     | Password reset link from email                                                  |      |       |
| —     | Airplane mode: add a record, go back online, it syncs                           |      |       |
| —     | VoiceOver: sign in, add a medication, log a dose                                |      |       |
| —     | Largest text size: TODAY, Add Medication, Timeline still usable                 |      |       |

### 1c. Server push, end to end

Needs `PUSH_ADMIN_SECRET` (rotated 2026-09-28; the value is kept in the git-ignored `supabase/.env`) and your test account's user id (Supabase dashboard → Authentication → Users).

1. On the phone: allow notifications, then in You → Notifications turn on **Prism news**.
2. Confirm a row exists for the account in `push_tokens`.
3. Send one:
   ```sh
   curl -X POST "https://<project-ref>.supabase.co/functions/v1/send-push" \
     -H "x-push-secret: $PUSH_ADMIN_SECRET" -H "Content-Type: application/json" \
     -d '{"category":"updates","title":"Prism","body":"Test from the server","userIds":["<user-id>"]}'
   ```
4. Expect `{"sent":1,...}` and the notification on the phone with the app closed.
5. If it says `sent: 1` but nothing arrives, check `eas credentials` for an iOS push key. If `sent: 0` with `recipients: 1`, the token wasn't saved.
6. Sign out, send again, and confirm nothing arrives (the token should be removed on sign-out).

- [x] Push arrives with the app closed (2026-09-28, owner's iPhone, `updates` category, `sent: 1`)
- [x] Nothing arrives after sign-out (2026-09-28: token count went to 0, `sent: 0`)

### 1d. Account deletion, end to end

With the test account holding a profile photo, a milestone photo and a journal photo:

- [ ] Delete from You → Data & Export → Delete Account
- [ ] Dashboard: the `auth.users` row is gone, and no rows remain for that id in any table
- [ ] Storage: nothing left under that id in `profile-photos` or `memories`
- [ ] Signing in again with the old email fails normally, without revealing that the account used to exist

### 1e. Before the first outside tester

- [ ] Confirm `support@ttimemedia.org` receives mail. Send one from You → Support → Report a problem.
- [ ] Privacy policy draft names Expo push (see `DECISIONS.md` "Outside services Prism uses") and is published at the URL testers will see. External TestFlight requires a privacy policy URL.
- [ ] Choose distribution (§2).

---

## 2. Distribution

**Recommended: TestFlight.** Internal EAS builds (`preview`) need each tester's device UDID registered and a rebuild whenever a tester is added, which doesn't scale past a few people. TestFlight takes an email or a public link, needs no UDIDs, and allows up to 10,000 testers.

- Build with the `production` profile (it already auto-increments the build number): `eas build -p ios --profile production`, then `eas submit -p ios`.
- Internal testers (App Store Connect users, up to 100) can install as soon as processing finishes. External testers need a one-time Beta App Review, which requires the privacy policy URL, a contact email and a short "what to test" note.
- JS fixes during the beta go out with `eas update --branch production`. Anything native needs a new build.

Keep `preview` for your own device.

---

## 3. Who to invite

[`PRODUCT_BIBLE.md`](./PRODUCT_BIBLE.md) §16 asks for a deliberately mixed group before launch. Aim for **10–20 people** in two waves:

- **Wave 1 (3–5 people you know well):** mainly to catch broken flows. Start once the §1 gates pass.
- **Wave 2 (10–15 people):** starts after wave-1 critical issues are fixed. Cover trans men, trans women and nonbinary people; HRT users and non-users; injection users and non-users; people early on and further along; people pursuing surgery and people who aren't.

Keep the list of who was invited outside this repository. It is personal information about the testers.

---

## 4. What testers get

A short welcome note (email or TestFlight "what to test"):

- What Prism is, and that it's an early version.
- **Use a real email but not real sensitive data if you'd rather not.** Made-up medications are fine.
- Reminders run on the phone; allow notifications when asked.
- How to report a problem: You → Support → Report a problem (opens an email).
- That you'll send a few questions after about a week.
- That they can delete their account at any time from You → Data & Export, and that this really deletes everything.

---

## 5. Feedback

**Channels:** the in-app email (Support screen) for problems as they happen, and one short survey per tester after about 7 days and again after about 21.

**Survey questions**, taken from [`PRODUCT_BIBLE.md`](./PRODUCT_BIBLE.md) §16. Ask about assumptions, not looks:

1. What did Prism assume about you?
2. Did you understand what to do?
3. What felt unnecessary?
4. What did you expect to find and couldn't?
5. What felt uncomfortable?
6. Would you trust Prism with this information? Why or why not?
7. Which features did you actually use in the last week?
8. Did reminders arrive when you expected? Did the lock-screen wording feel private enough?

**Numbers.** Prism has no analytics by design ([`SECURITY.md`](./SECURITY.md) §12), so there is no dashboard. The [`PRODUCT_BIBLE.md`](./PRODUCT_BIBLE.md) §15 metrics are covered this way:

| Metric                                                    | Source during beta                                                            |
| --------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Onboarding completion, module activation, record creation | Survey (and see the open decision below)                                      |
| Reminder completion, notification engagement              | Survey question 8                                                             |
| Weekly/monthly retention                                  | Survey question 7 at day 7 and day 21                                         |
| Export usage, deletion success                            | Support email plus the §1 checks                                              |
| Crash-free sessions                                       | TestFlight crash reports and screenshots testers send from the TestFlight app |
| Trust / privacy perception                                | Survey questions 1, 5 and 6                                                   |

**Open decision for the product owner:** whether to count testers' records in aggregate with SQL (e.g. `count(*) from medications group by user_id`, with no content read) to measure activation and retention. It would be more accurate than a survey, but it means looking at tester data at all. If yes, say so in the welcome note and record it in `DECISIONS.md`. If no, the survey is the only source.

---

## 6. Triage

Log each report as a GitHub issue (no tester names or health details in the issue), labelled:

- **P0, fix before anyone else uses it:** data loss, data visible to the wrong person, the lock screen revealing content, a crash on launch, being locked out, or deletion not deleting.
- **P1, fix this wave:** a core flow can't be completed, or a reminder is wrong or missing.
- **P2, fix before launch:** confusing copy or layout, or an assumption about the person that shouldn't be there.
- **Later:** ideas and requests. Check them against `DECISIONS.md` § Product Discipline before accepting any.

Any report that Prism assumed something about someone's gender, body or transition is at least **P2**, even when it's only wording.

---

## 7. Exit criteria (Beta → Launch)

- [ ] All §1 gates ticked
- [ ] Both waves have used Prism for at least 3 weeks
- [ ] No open P0 or P1 issues
- [ ] Survey answers to "What did Prism assume about you?" reviewed, and each real assumption fixed or recorded as a decision
- [ ] TestFlight shows no crash that occurs more than once
- [ ] At least one tester (or the owner) has completed export and account deletion on a real account

---

## 8. Carried into Launch (09)

Listed so it isn't lost; none of it blocks Beta.

- Legal review of the privacy policy; Terms of Service; the HIPAA/health-privacy determination ([`SECURITY.md`](./SECURITY.md) §21)
- App Store privacy "nutrition label" (the outside-services list in `DECISIONS.md` is the input)
- Android: FCM credentials, a first Android build and a device pass
- GitHub Actions CI: last known state was `startup_failure` with no jobs run ([`BUILD_STATUS.md`](./BUILD_STATUS.md) §16)
- Help center (Support's last unconnected row)
- Multi-device offline conflict resolution ([`BUILD_STATUS.md`](./BUILD_STATUS.md) §16)
