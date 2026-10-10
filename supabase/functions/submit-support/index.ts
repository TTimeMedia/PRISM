// PRISM — submit-support Edge Function.
//
// The in-app Contact support, Report a problem, Privacy concern and Send
// feedback forms send here, signed in as the person writing:
//   POST /functions/v1/submit-support
//   Authorization: Bearer <their session JWT>
//   { "kind": "problem", "message": "...", "screen": "/care/medications",
//     "appVersion": "0.3.3", "platform": "ios", "osVersion": "18.6",
//     "screenshotPath": "<user id>/support/<file>.jpg" }   // optional
//
// It saves the request (support_requests, as the caller, so RLS applies),
// then emails it to support@ttimemedia.org through Resend with Reply-To set
// to the address on their account, so answering is just replying. A
// screenshot, when they chose to attach one, goes along as an attachment.
// If the email fails the request is still saved, and the reply says so.
//
// Needs the RESEND_API_KEY function secret (the same key Supabase Auth
// uses for sign-in email).
import { createClient } from 'npm:@supabase/supabase-js@2.49.4';
import { corsHeaders } from '../_shared/cors.ts';

const SUPPORT_TO = 'support@ttimemedia.org';
const FROM = 'Prism Support <no-reply@ttimemedia.org>';
const KINDS = {
  contact: 'Contact',
  problem: 'Problem report',
  privacy: 'Privacy concern',
  feedback: 'Feedback',
} as const;
type Kind = keyof typeof KINDS;
const MAX_MESSAGE = 5000;
/** Enough for a real conversation; stops a stuck button or a script from flooding the inbox. */
const MAX_PER_HOUR = 10;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Use POST.' }, 405);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'Not signed in.' }, 401);

  const url = Deno.env.get('SUPABASE_URL')!;
  const caller = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
  } = await caller.auth.getUser();
  if (!user) return json({ error: 'Not signed in.' }, 401);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Send JSON.' }, 400);
  }

  const kind = body.kind as Kind;
  if (!(kind in KINDS)) return json({ error: 'Unknown kind.' }, 400);
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message || message.length > MAX_MESSAGE) {
    return json({ error: `Write a message of up to ${MAX_MESSAGE} characters.` }, 400);
  }
  const text = (value: unknown, max = 200) =>
    typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : null;
  // Only a file in the caller's own folder can be attached.
  const screenshotPath = text(body.screenshotPath, 300);
  if (screenshotPath && !screenshotPath.startsWith(`${user.id}/support/`)) {
    return json({ error: 'That screenshot is not yours.' }, 400);
  }

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await caller
    .from('support_requests')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', since);
  if ((count ?? 0) >= MAX_PER_HOUR) {
    return json({ error: "You've sent a lot in the last hour. Please try again later." }, 429);
  }

  const { data: saved, error: insertError } = await caller
    .from('support_requests')
    .insert({
      user_id: user.id,
      kind,
      message,
      screen: text(body.screen),
      app_version: text(body.appVersion, 40),
      platform: text(body.platform, 40),
      os_version: text(body.osVersion, 40),
      screenshot_path: screenshotPath,
    })
    .select('id, created_at')
    .single();
  if (insertError || !saved) {
    console.error('submit-support: insert failed', insertError);
    return json({ error: "Couldn't send that. Please try again." }, 500);
  }

  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const emailed = await email({
    kind,
    message,
    replyTo: user.email ?? null,
    requestId: saved.id,
    details: [
      ['From', user.email ?? 'no email on the account'],
      ['Screen', text(body.screen) ?? 'not given'],
      ['App', text(body.appVersion, 40) ?? 'unknown'],
      ['Device', [text(body.platform, 40), text(body.osVersion, 40)].filter(Boolean).join(' ')],
      ['Request', saved.id],
    ],
    screenshot: screenshotPath ? await download(admin, screenshotPath) : null,
  });
  if (emailed) {
    await admin
      .from('support_requests')
      .update({ emailed_at: new Date().toISOString() })
      .eq('id', saved.id);
  }

  return json({ id: saved.id, emailed }, 200);
});

async function download(
  admin: ReturnType<typeof createClient>,
  path: string,
): Promise<{ filename: string; content: string } | null> {
  const { data, error } = await admin.storage.from('attachments').download(path);
  if (error || !data) {
    console.error('submit-support: screenshot download failed', error);
    return null;
  }
  const bytes = new Uint8Array(await data.arrayBuffer());
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return { filename: path.split('/').pop() ?? 'screenshot.jpg', content: btoa(binary) };
}

async function email(input: {
  kind: Kind;
  message: string;
  replyTo: string | null;
  requestId: string;
  details: [string, string][];
  screenshot: { filename: string; content: string } | null;
}): Promise<boolean> {
  const key = Deno.env.get('RESEND_API_KEY');
  if (!key) {
    console.error('submit-support: RESEND_API_KEY is not set');
    return false;
  }
  const textBody = [
    input.message,
    '',
    '---',
    ...input.details.map(([label, value]) => `${label}: ${value}`),
    input.screenshot ? 'Screenshot: attached' : 'Screenshot: none',
  ].join('\n');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: [SUPPORT_TO],
      ...(input.replyTo ? { reply_to: input.replyTo } : {}),
      subject: `[Prism] ${KINDS[input.kind]} · ${input.requestId.slice(0, 8)}`,
      text: textBody,
      ...(input.screenshot ? { attachments: [input.screenshot] } : {}),
    }),
  });
  if (!response.ok) {
    console.error('submit-support: Resend refused', response.status, await response.text());
  }
  return response.ok;
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
