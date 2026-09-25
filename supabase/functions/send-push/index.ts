// PRISM — send-push Edge Function.
//
// The one place server push notifications leave from. Called by Prism
// itself (an admin action, a scheduled job, or another function), never by
// the mobile app, so it needs a shared secret rather than a user JWT:
//   POST /functions/v1/send-push
//   x-push-secret: <PUSH_ADMIN_SECRET>
//   { "category": "updates", "title": "...", "body": "...",
//     "userIds": ["..."]  // or "all": true
//     "data": { "route": "/care" } }
//   For reminders, send what each reminder is about and let the server word it
//   the way each person chose (see ../_shared/reminderMessages.ts):
//   { "category": "reminders",
//     "reminders": [{ "userId": "...", "kind": "injection",
//                     "vars": { "name": "Testosterone", "time": "8:00 PM" } }] }
//
// Rules (see ../_shared/push.ts):
//  - Only people who have that category turned on receive it. Security
//    alerts default on, everything else is opt-in.
//  - Reminders are generic ("Your Prism reminder is ready.") while the
//    person's "Private notifications" setting is on; with it off they use
//    the wording the person chose ("It's shot day.", their own, ...).
//  - Tokens Expo reports as no longer valid are deleted.
// Tokens are sent to Expo's push service, which hands them to Apple/Google;
// that is the third-party data flow this feature adds (docs/SECURITY.md §7).
import { createClient } from 'npm:@supabase/supabase-js@2.49.4';
import { corsHeaders } from '../_shared/cors.ts';
import {
  REMINDER_KINDS,
  renderReminder,
  type ReminderKind,
  type ReminderMessages,
  type ReminderVars,
  resolveReminderMessages,
} from '../_shared/reminderMessages.ts';
import {
  chunk,
  contentFor,
  isPushCategory,
  resolvePreferences,
  type PushCategory,
} from '../_shared/push.ts';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
/** Expo accepts at most 100 messages per request. */
const EXPO_BATCH = 100;
/** How many settings rows to read per page when sending to everyone. */
const PAGE = 1000;

interface SendRequest {
  category?: unknown;
  title?: unknown;
  body?: unknown;
  userIds?: unknown;
  all?: unknown;
  data?: unknown;
  reminders?: unknown;
}

interface ReminderItem {
  userId: string;
  kind: ReminderKind;
  vars: ReminderVars;
}

/** What we need to know about a person to decide what to send them. */
interface Recipient {
  privacy: boolean;
  messages: ReminderMessages;
}

interface ExpoMessage {
  to: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  sound: 'default';
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Use POST.' }, 405);

  const secret = Deno.env.get('PUSH_ADMIN_SECRET');
  if (!secret || req.headers.get('x-push-secret') !== secret) {
    return json({ error: 'Not allowed.' }, 401);
  }

  let payload: SendRequest;
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'Send JSON.' }, 400);
  }

  const { category, title, body } = payload;
  if (!isPushCategory(category)) return json({ error: 'Unknown category.' }, 400);
  const reminders = category === 'reminders' ? parseReminders(payload.reminders) : null;
  if (category === 'reminders' && payload.reminders !== undefined && !reminders) {
    return json({ error: 'reminders must be a list of { userId, kind, vars }.' }, 400);
  }
  if (!reminders && (typeof title !== 'string' || typeof body !== 'string' || !title || !body)) {
    return json({ error: 'title and body are required.' }, 400);
  }
  const userIds = reminders
    ? [...new Set(reminders.map((item) => item.userId))]
    : Array.isArray(payload.userIds) && payload.userIds.every((id) => typeof id === 'string')
      ? (payload.userIds as string[])
      : null;
  if (!userIds && payload.all !== true) {
    return json({ error: 'Send userIds, or all: true.' }, 400);
  }
  const data =
    payload.data && typeof payload.data === 'object'
      ? (payload.data as Record<string, unknown>)
      : {};

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    const recipients = await eligibleRecipients(admin, category, userIds);
    if (recipients.size === 0) return json({ sent: 0, recipients: 0 }, 200);

    const messages = await buildMessages(
      admin,
      recipients,
      category,
      { title: String(title ?? ''), body: String(body ?? '') },
      data,
      reminders,
    );
    const dead: string[] = [];
    let sent = 0;
    for (const batch of chunk(messages, EXPO_BATCH)) {
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(batch),
      });
      if (!response.ok) {
        console.error('send-push: Expo returned', response.status);
        continue;
      }
      const { data: tickets } = (await response.json()) as {
        data: { status: string; details?: { error?: string } }[];
      };
      tickets.forEach((ticket, index) => {
        if (ticket.status === 'ok') sent += 1;
        else if (ticket.details?.error === 'DeviceNotRegistered') {
          const token = batch[index]?.to;
          if (token) dead.push(token);
        }
      });
    }
    if (dead.length > 0) await admin.from('push_tokens').delete().in('token', dead);
    return json({ sent, removedTokens: dead.length, recipients: recipients.size }, 200);
  } catch (error) {
    console.error('send-push failed', error);
    return json({ error: 'Could not send.' }, 500);
  }
});

type Admin = ReturnType<typeof createClient>;

/** user id -> what we need to word their push, for everyone who wants this category. */
async function eligibleRecipients(
  admin: Admin,
  category: PushCategory,
  userIds: string[] | null,
): Promise<Map<string, Recipient>> {
  const recipients = new Map<string, Recipient>();
  for (let from = 0; ; from += PAGE) {
    let query = admin
      .from('settings')
      .select('user_id, push_preferences, notification_privacy, reminder_messages')
      .order('user_id')
      .range(from, from + PAGE - 1);
    if (userIds) query = query.in('user_id', userIds);
    const { data, error } = await query;
    if (error) throw error;
    const rows = data ?? [];
    for (const row of rows) {
      if (resolvePreferences(row.push_preferences)[category]) {
        recipients.set(row.user_id as string, {
          privacy: row.notification_privacy !== false,
          messages: resolveReminderMessages(row.reminder_messages),
        });
      }
    }
    if (rows.length < PAGE) break;
  }
  return recipients;
}

async function buildMessages(
  admin: Admin,
  recipients: Map<string, Recipient>,
  category: PushCategory,
  content: { title: string; body: string },
  data: Record<string, unknown>,
  reminders: ReminderItem[] | null,
): Promise<ExpoMessage[]> {
  const messages: ExpoMessage[] = [];
  const tokensByUser = new Map<string, string[]>();
  for (const ids of chunk([...recipients.keys()], 200)) {
    const { data: tokens, error } = await admin
      .from('push_tokens')
      .select('token, user_id')
      .in('user_id', ids);
    if (error) throw error;
    for (const row of tokens ?? []) {
      const list = tokensByUser.get(row.user_id as string) ?? [];
      list.push(row.token as string);
      tokensByUser.set(row.user_id as string, list);
    }
  }

  // One push per reminder for reminders; otherwise one per person.
  const jobs: { userId: string; shown: { title: string; body: string } }[] = [];
  if (reminders) {
    for (const item of reminders) {
      const person = recipients.get(item.userId);
      if (!person) continue;
      jobs.push({
        userId: item.userId,
        shown: contentFor(
          'reminders',
          renderReminder(item.kind, item.vars, person.messages),
          person.privacy,
        ),
      });
    }
  } else {
    for (const [userId, person] of recipients) {
      jobs.push({ userId, shown: contentFor(category, content, person.privacy) });
    }
  }
  for (const { userId, shown } of jobs) {
    for (const token of tokensByUser.get(userId) ?? []) {
      messages.push({ to: token, ...shown, data: { category, ...data }, sound: 'default' });
    }
  }
  return messages;
}

/** A list of { userId, kind, vars }, or null when it isn't one. */
function parseReminders(value: unknown): ReminderItem[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const items: ReminderItem[] = [];
  for (const entry of value) {
    const item = entry as { userId?: unknown; kind?: unknown; vars?: unknown } | null;
    if (
      !item ||
      typeof item.userId !== 'string' ||
      !(REMINDER_KINDS as readonly unknown[]).includes(item.kind) ||
      (item.vars !== undefined && (typeof item.vars !== 'object' || item.vars === null))
    ) {
      return null;
    }
    items.push({
      userId: item.userId,
      kind: item.kind as ReminderKind,
      vars: (item.vars ?? {}) as ReminderVars,
    });
  }
  return items;
}

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
