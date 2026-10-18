// PRISM — watch Edge Function.
//
// What the Apple Watch app calls, so it works without Prism open on the
// iPhone. The watch can't sign in; it holds a watch-only key the phone made
// with create_watch_token() (supabase/migrations/20261018120000_watch_tokens.sql)
// and sends it as `x-watch-token`. The key can do exactly two things:
//
//   POST /functions/v1/watch
//   x-watch-token: <key>
//   { "action": "taken", "from": "<ISO>", "to": "<ISO>" }
//     → { "taken": [{ "medicationId": "...", "at": "<ISO>" }] }
//       the person's completed dose logs scheduled in [from, to)
//   { "action": "logDose", "medicationId": "...", "at": "<ISO>" }
//     → { "logged": true } (or { "logged": false } if that dose was already logged)
//
// The watch already has the names and times (the phone sends them, worded the
// way Private notifications allows), so nothing here returns a name.
import { createClient } from 'npm:@supabase/supabase-js@2.49.4';
import { corsHeaders } from '../_shared/cors.ts';

/** The watch only ever asks about one day; a little slack for time zones. */
const MAX_RANGE_MS = 2 * 24 * 60 * 60 * 1000;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Use POST.' }, 405);
  }

  const token = req.headers.get('x-watch-token');
  if (!token || token.length < 32 || token.length > 128) {
    return jsonResponse({ error: 'Missing watch key.' }, 401);
  }

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: key, error: keyError } = await admin
    .from('watch_tokens')
    .select('id, user_id')
    .eq('token_hash', await sha256Hex(token))
    .maybeSingle();
  if (keyError) {
    console.error('watch: key lookup failed', keyError);
    return jsonResponse({ error: 'Try again.' }, 500);
  }
  if (!key) {
    // Signed out on the phone, account deleted, or replaced by a newer key.
    return jsonResponse({ error: 'Watch key not valid.' }, 401);
  }
  const userId = key.user_id as string;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse({ error: 'Send JSON.' }, 400);
  }

  await admin
    .from('watch_tokens')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', key.id);

  if (body.action === 'taken') {
    const from = parseDate(body.from);
    const to = parseDate(body.to);
    if (!from || !to || to <= from || to.getTime() - from.getTime() > MAX_RANGE_MS) {
      return jsonResponse({ error: 'Send from and to, at most two days apart.' }, 400);
    }
    const { data, error } = await admin
      .from('medication_logs')
      .select('medication_id, scheduled_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('scheduled_at', from.toISOString())
      .lt('scheduled_at', to.toISOString());
    if (error) {
      console.error('watch: reading logs failed', error);
      return jsonResponse({ error: 'Try again.' }, 500);
    }
    return jsonResponse(
      {
        taken: (data ?? []).map((log) => ({
          medicationId: log.medication_id as string,
          at: log.scheduled_at as string,
        })),
      },
      200,
    );
  }

  if (body.action === 'logDose') {
    const medicationId = typeof body.medicationId === 'string' ? body.medicationId : null;
    const at = parseDate(body.at);
    if (!medicationId || !at) {
      return jsonResponse({ error: 'Send medicationId and at.' }, 400);
    }

    // Only the person's own medications. The service role skips RLS, so check here.
    const { data: medication, error: medicationError } = await admin
      .from('medications')
      .select('id')
      .eq('id', medicationId)
      .eq('user_id', userId)
      .maybeSingle();
    if (medicationError) {
      console.error('watch: medication lookup failed', medicationError);
      return jsonResponse({ error: 'Try again.' }, 500);
    }
    if (!medication) {
      return jsonResponse({ error: 'No such medication.' }, 404);
    }

    // The watch retries until it hears back, so the same dose can arrive twice.
    const { data: existing, error: existingError } = await admin
      .from('medication_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('medication_id', medicationId)
      .eq('status', 'completed')
      .eq('scheduled_at', at.toISOString())
      .limit(1);
    if (existingError) {
      console.error('watch: duplicate check failed', existingError);
      return jsonResponse({ error: 'Try again.' }, 500);
    }
    if (existing && existing.length > 0) {
      return jsonResponse({ logged: false }, 200);
    }

    const { error: insertError } = await admin.from('medication_logs').insert({
      user_id: userId,
      medication_id: medicationId,
      scheduled_at: at.toISOString(),
      completed_at: new Date().toISOString(),
      status: 'completed',
    });
    if (insertError) {
      console.error('watch: logging the dose failed', insertError);
      return jsonResponse({ error: 'Try again.' }, 500);
    }
    return jsonResponse({ logged: true }, 200);
  }

  return jsonResponse({ error: 'Unknown action.' }, 400);
});

function parseDate(value: unknown): Date | null {
  if (typeof value !== 'string') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Same as the migration's encode(sha256(convert_to(token, 'UTF8')), 'hex'). */
async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
