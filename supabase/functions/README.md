# Supabase Edge Functions

None exist yet. Foundation does not require any — RLS-scoped
PostgREST access covers every P0 read/write. Reach for an Edge Function
only when logic genuinely cannot live in RLS/database constraints or the
client (e.g. a future server-side integration), per
`docs/TECHNICAL_BIBLE.md` §7 ("Edge Functions where appropriate").

**Known future exception — `delete-account`:** Screen 64 (Delete
Account, `apps/mobile/features/you/screens/DeleteAccountScreen.tsx`)
calls `supabase.functions.invoke('delete-account')`, which does not
exist yet. Deleting an `auth.users` row requires the service-role key,
which must never ship in the mobile app (`docs/SECURITY.md` §14-15) —
so this genuinely needs a server-side Edge Function, not a client
mutation. The mobile UI is real and complete up to that boundary; it
surfaces a clear error until this function is deployed. See
`docs/DECISIONS.md` § YOU.
