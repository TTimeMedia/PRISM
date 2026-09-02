# Supabase Edge Functions

None exist yet. Foundation does not require any — RLS-scoped
PostgREST access covers every P0 read/write. Reach for an Edge Function
only when logic genuinely cannot live in RLS/database constraints or the
client (e.g. a future server-side integration), per
`docs/TECHNICAL_BIBLE.md` §7 ("Edge Functions where appropriate").
