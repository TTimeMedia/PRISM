// PRISM — delete-account Edge Function.
//
// Deleting an `auth.users` row requires the service-role key, which must
// never ship in the mobile app (docs/SECURITY.md §14-15) — so this is
// the server-side boundary apps/mobile/features/you/screens/
// DeleteAccountScreen.tsx calls via `supabase.functions.invoke('delete-account')`.
//
// Every `public` table's `user_id` column is `references auth.users (id)
// on delete cascade` (see supabase/migrations), so deleting the
// `auth.users` row alone removes every row this user owns. Storage
// objects are the one exception — `storage.objects` has no such FK
// (objects are scoped by a `{user_id}/...` path prefix instead, per
// supabase/migrations/20260901235523_storage_buckets_and_policies.sql),
// so this explicitly empties every private bucket's `{user_id}/` prefix
// first. Otherwise a deleted user's files would silently survive,
// orphaned and unreachable but not actually gone — the opposite of what
// "delete my account" promises.
import { createClient } from 'npm:@supabase/supabase-js@2.49.4';
import { corsHeaders } from '../_shared/cors.ts';

/** Every private bucket a user can own objects in — see the storage migration's own header. */
const USER_OWNED_BUCKETS = ['profile-photos', 'memories', 'documents', 'attachments'] as const;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return jsonResponse({ error: 'Missing Authorization header.' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // Identifies the caller from *their own* JWT — never trust a
  // client-supplied user id for a destructive, irreversible operation
  // like this one.
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: getUserError,
  } = await callerClient.auth.getUser();
  if (getUserError || !user) {
    return jsonResponse({ error: 'Not authenticated.' }, 401);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  try {
    await deleteUserStorageObjects(adminClient, user.id);
  } catch (error) {
    console.error('delete-account: failed clearing storage objects', error);
    return jsonResponse({ error: "Couldn't delete your files. Please try again." }, 500);
  }

  // Cascades to every public-schema row this user owns (see this file's own header).
  const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(user.id);
  if (deleteUserError) {
    console.error('delete-account: failed deleting the user', deleteUserError);
    return jsonResponse({ error: "Couldn't delete your account. Please try again." }, 500);
  }

  return jsonResponse({ deleted: true }, 200);
});

/**
 * Empties a user's `{userId}/...` prefix in every private bucket. Not
 * transactional with the `auth.users` deletion below — storage has no
 * such primitive — so this runs first: a storage failure aborts before
 * any account state is destroyed, and a user left with a purged
 * account are minus their files, but this is far preferable to leaving
 * an unrecoverable half-deleted account.
 */
async function deleteUserStorageObjects(
  adminClient: ReturnType<typeof createClient>,
  userId: string,
): Promise<void> {
  for (const bucket of USER_OWNED_BUCKETS) {
    // 1000 is Supabase Storage's own max page size; P0 buckets hold at
    // most a handful of objects per user (a single profile photo today),
    // so one page is enough.
    const { data: objects, error: listError } = await adminClient.storage
      .from(bucket)
      .list(userId, { limit: 1000 });
    if (listError) throw listError;
    if (!objects || objects.length === 0) continue;

    const paths = objects.map((object) => `${userId}/${object.name}`);
    const { error: removeError } = await adminClient.storage.from(bucket).remove(paths);
    if (removeError) throw removeError;
  }
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
