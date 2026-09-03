# Supabase Edge Functions

Reach for an Edge Function only when logic genuinely cannot live in
RLS/database constraints or the client (e.g. deleting a user, or a future
server-side integration), per `docs/TECHNICAL_BIBLE.md` §7 ("Edge
Functions where appropriate"). Every other P0 read/write is covered by
RLS-scoped PostgREST access from the client directly.

## `delete-account`

Backs Screen 64 (Delete Account,
`apps/mobile/features/you/screens/DeleteAccountScreen.tsx`), which calls
`supabase.functions.invoke('delete-account')`. Deleting an `auth.users`
row requires the service-role key, which must never ship in the mobile
app (`docs/SECURITY.md` §14-15) — so this genuinely needs a server-side
function, not a client mutation.

Identifies the caller from their own JWT (never a client-supplied user
id), empties their `{user_id}/...` prefix in every private storage
bucket (storage objects aren't covered by the `on delete cascade` every
`public` table's `user_id` column has — see the function's own header),
then deletes the `auth.users` row, which cascades to every row the user
owns.

**Not deployed and not executable in this sandbox** — Deno isn't
installed here and Docker's daemon isn't running, so `deno test` /
`supabase functions serve` genuinely can't be run to verify this. The
code was written against Deno/`@supabase/supabase-js`'s documented APIs
and reviewed carefully, but hasn't been executed. Before shipping:
`supabase functions deploy delete-account` against a real project (needs
a Supabase CLI login + linked project — see docs/BUILD_STATUS.md's
Launch-readiness section), then a real end-to-end test: create a test
account, add a profile photo, delete the account, verify the
`auth.users` row, every `public` table row, and the storage object are
all actually gone.
