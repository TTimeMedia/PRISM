# Prism backups

> This folder is a copy of the files in the private `TTimeMedia/prism-backups`
> repository, kept here so they are not lost. The job only runs from that private
> repository; nothing here runs, and no secrets are in these files.

Every night, a GitHub job here copies Prism's whole Supabase project and keeps
the copy for 7 days:

- **The database**: accounts, every record, and the structure and access
  rules (`roles.sql`, `schema.sql`, `data.sql`).
- **Photos and files** from storage.

Before saving, it checks the copy row by row against the live database and
fails if anything is missing. Then it locks the copy with your **age** key.
GitHub only ever stores the locked file; only your private key can open it.
The job also uses the database every day, which keeps a Free-plan project
from pausing for inactivity.

**Keep this repository private.** Its logs list table names and row counts.

## Setting it up (once)

1. **Make your key.** In PowerShell on your laptop:
   ```
   winget install FiloSottile.age
   ```
   Close PowerShell, open a new one, then:
   ```
   age-keygen -o "$HOME\Documents\prism-backup-key.txt"
   ```
   It prints `Public key: age1…`. Copy that line's key; it goes in step 3.
   Open the file it made, copy everything in it into your password manager
   (a secure note called "Prism backup key"), then **delete the file**.
   Without this private key the backups can't be opened, by you or anyone.

2. **Find two values in Supabase** (Project PRISM):
   - Connect (top of the dashboard) → **Session pooler** → copy the URI and
     put your database password in place of `[YOUR-PASSWORD]`. Use the Session
     pooler one: GitHub's machines can't reach the direct connection.
   - Project Settings → API Keys → the **service_role** (or Secret) key.

3. **Add three secrets here**: Settings → Secrets and variables → Actions →
   New repository secret:
   - `SUPABASE_DB_URL`: the Session pooler URI from step 2
   - `SUPABASE_SERVICE_ROLE_KEY`: the key from step 2
   - `AGE_RECIPIENT`: the `age1…` public key from step 1

4. **Run it once**: Actions → Nightly backup → Run workflow. It takes a few
   minutes. A green tick and a `prism-backup-<date>` file under Artifacts
   means it worked. From then on it runs by itself every night.

## Restoring

Only needed if data is lost. Restoring into a **new** Supabase project is
safest, so nothing in the live one is overwritten.

1. On the run you want (Actions), download the `prism-backup-<date>` artifact
   and unzip it to get `prism-backup-<date>.tar.gz.age`.
2. Save your private key from the password manager to a file, `key.txt`, then:
   ```
   age -d -i key.txt -o backup.tar.gz prism-backup-<date>.tar.gz.age
   tar -xzf backup.tar.gz
   ```
   Delete `key.txt` afterwards.
3. Put the database back (needs `psql`, from the PostgreSQL installer):
   ```
   psql --single-transaction --variable ON_ERROR_STOP=1 --file db/roles.sql --file db/schema.sql --command "SET session_replication_role = replica" --file db/data.sql --dbname "<the new project's Session pooler URI>"
   ```
4. Put the files back:
   ```
   $env:SUPABASE_URL="https://<new-project>.supabase.co"; $env:SUPABASE_SERVICE_ROLE_KEY="<its key>"; node scripts/upload-storage.mjs storage
   ```
5. Point the app at the new project (its URL and anon key in EAS), deploy the
   Edge Functions there, and publish an update.

The backup files contain people's health information. Delete the decrypted
copies from your laptop as soon as the restore is done.
