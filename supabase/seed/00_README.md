# Seed data

No development fixtures exist yet. Foundation establishes the schema and
RLS; it deliberately does not invent fake user records ahead of a real
auth flow.

When the Authentication milestone (02) lands, add `.sql` files here (they
load in filename order — see `supabase/config.toml` `[db.seed]`). A
useful seed script for local development would:

1. Insert one or more rows into `auth.users` (local dev only — the
   `on_auth_user_created` trigger in `20260901235509_core_tables.sql`
   will automatically create matching `profiles`/`settings` rows).
2. Enable a few P0 modules for that test user.
3. Insert a handful of medications/appointments/milestones so CARE and
   JOURNEY screens have something to render during development.

Never commit real user data here — this file (and any seed script) is
for local development only, per `supabase/config.toml`'s local `[db.seed]`
configuration; it is not applied to staging or production.
