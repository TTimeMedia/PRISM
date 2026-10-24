#!/usr/bin/env bash
# Compares the rows in a data-only dump (COPY format) with the live database,
# table by table, so a backup that silently missed something fails loudly.
#
# Checks every table in the public schema, plus auth.users (the accounts) and
# storage.objects (the list of files). The dump and the live count are taken a
# few seconds apart, so a tester logging something in between can move a
# count by a little; only a difference above TOLERANCE fails.
#
# Usage: SUPABASE_DB_URL=... bash scripts/check-counts.sh backup/db/data.sql
set -euo pipefail

dump="$1"
TOLERANCE=5

# Rows per table in the dump: lines between "COPY schema.table ... FROM stdin;"
# and the "\." that ends it. COPY text format escapes newlines inside values,
# so each row is exactly one line.
declare -A dumped
while read -r table rows; do
  dumped["$table"]=$rows
done < <(awk '
  /^COPY / { t = $2; gsub(/"/, "", t); n = 0; inside = 1; next }
  inside && /^\\\.$/ { print t, n; inside = 0; next }
  inside { n++ }
' "$dump")

# Live rows per table, counted exactly.
query=$(psql "$SUPABASE_DB_URL" -At -c "
  select string_agg(
    format('select %L, count(*) from %I.%I', schemaname || '.' || tablename, schemaname, tablename),
    ' union all ' order by schemaname, tablename)
  from pg_tables
  where schemaname = 'public'
     or (schemaname = 'auth' and tablename = 'users')
     or (schemaname = 'storage' and tablename = 'objects')")

failed=0
printf '%-40s %10s %10s\n' table backup live
while IFS='|' read -r table live; do
  got=${dumped[$table]:-}
  if [ -z "$got" ]; then
    if [ "$live" -gt 0 ]; then
      printf '%-40s %10s %10s  MISSING\n' "$table" '-' "$live"
      failed=1
    fi
    continue
  fi
  diff=$((got > live ? got - live : live - got))
  flag=''
  if [ "$diff" -gt "$TOLERANCE" ]; then
    flag='  DIFFERENT'
    failed=1
  fi
  printf '%-40s %10s %10s%s\n' "$table" "$got" "$live" "$flag"
done < <(psql "$SUPABASE_DB_URL" -At -c "$query")

if [ "$failed" -ne 0 ]; then
  echo "::error::The backup doesn't match the live database. See the table above."
  exit 1
fi
echo "The backup matches the live database."
