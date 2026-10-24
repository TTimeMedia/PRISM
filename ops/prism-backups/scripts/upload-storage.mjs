// Puts files from a backup back into Supabase storage: the reverse of
// download-storage.mjs. Reads <dir>/<bucket>/<path> and uploads each file to
// that bucket and path, replacing a file already there. Buckets must exist
// (restoring schema.sql and data.sql recreates them).
//
// Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/upload-storage.mjs <dir>
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const dir = process.argv[2];
if (!url || !key || !dir) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, and pass the backup\'s storage folder.');
  process.exit(1);
}
const headers = { apikey: key, ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {}) };

const TYPES = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', heic: 'image/heic', webp: 'image/webp', pdf: 'application/pdf' };

let count = 0;
for (const bucket of await readdir(dir, { withFileTypes: true })) {
  if (!bucket.isDirectory()) continue;
  const root = join(dir, bucket.name);
  for (const entry of await readdir(root, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const full = join(entry.parentPath ?? entry.path, entry.name);
    const path = relative(root, full).split(sep);
    const ext = entry.name.split('.').pop()?.toLowerCase() ?? '';
    const response = await fetch(
      `${url}/storage/v1/object/${encodeURIComponent(bucket.name)}/${path.map(encodeURIComponent).join('/')}`,
      {
        method: 'POST',
        headers: { ...headers, 'x-upsert': 'true', 'Content-Type': TYPES[ext] ?? 'application/octet-stream' },
        body: await readFile(full),
      },
    );
    if (!response.ok) {
      throw new Error(`${bucket.name}/${path.join('/')}: ${response.status} ${await response.text()}`);
    }
    count += 1;
  }
  console.log(`${bucket.name}: done`);
}
console.log(`Put back ${count} files.`);
