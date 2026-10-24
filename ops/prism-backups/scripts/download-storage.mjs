// Copies every file in every Supabase storage bucket into a folder:
// <dir>/<bucket>/<path>. The database dump only has the list of files, not
// the files themselves, so the backup needs both.
//
// Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/download-storage.mjs <dir>
// No packages needed: Node 20's own fetch.
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const out = process.argv[2];
if (!url || !key || !out) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, and pass an output folder.');
  process.exit(1);
}

// Older service-role keys are JWTs and go in Authorization too; newer
// "secret" keys go only in the apikey header.
const headers = { apikey: key, ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {}) };
const PAGE = 1000;

async function api(path, init = {}) {
  const response = await fetch(`${url}/storage/v1/${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers ?? {}) },
  });
  if (!response.ok) {
    throw new Error(`${init.method ?? 'GET'} ${path}: ${response.status} ${await response.text()}`);
  }
  return response;
}

/** Every file path under a prefix, walking into folders (entries with no id). */
async function listFiles(bucket, prefix) {
  const files = [];
  for (let offset = 0; ; offset += PAGE) {
    const response = await api(`object/list/${encodeURIComponent(bucket)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix, limit: PAGE, offset, sortBy: { column: 'name', order: 'asc' } }),
    });
    const entries = await response.json();
    for (const entry of entries) {
      const path = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.id === null) files.push(...(await listFiles(bucket, path)));
      else files.push(path);
    }
    if (entries.length < PAGE) break;
  }
  return files;
}

const buckets = await (await api('bucket')).json();
let count = 0;
let bytes = 0;
for (const bucket of buckets) {
  const files = await listFiles(bucket.id, '');
  for (const path of files) {
    const encoded = path.split('/').map(encodeURIComponent).join('/');
    const response = await api(`object/${encodeURIComponent(bucket.id)}/${encoded}`);
    const body = Buffer.from(await response.arrayBuffer());
    const target = join(out, bucket.id, ...path.split('/'));
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, body);
    count += 1;
    bytes += body.length;
  }
  console.log(`${bucket.id}: ${files.length} files`);
}
console.log(`Copied ${count} files, ${(bytes / 1024 / 1024).toFixed(1)} MB in total.`);
