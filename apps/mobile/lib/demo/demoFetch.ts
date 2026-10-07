import { demoTables, DEMO_USER } from './fixtures';

/**
 * Demo mode (web only, EXPO_PUBLIC_DEMO=1): answers every Supabase request
 * from the sample data in ./fixtures, so the real app can be shown and
 * photographed for the App Store without an account or any network call.
 * Nothing here ever calls the real fetch.
 */

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  Promise.resolve(
    new Response(body === undefined ? null : JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json', ...headers },
    }),
  );

type Row = Record<string, unknown>;

function matches(row: Row, column: string, expr: string): boolean {
  const value = row[column];
  const text = value === null || value === undefined ? null : String(value);
  const not = expr.startsWith('not.');
  const raw = not ? expr.slice(4) : expr;
  const dot = raw.indexOf('.');
  const op = raw.slice(0, dot);
  const arg = raw.slice(dot + 1);
  let result = true;
  switch (op) {
    case 'eq':
      result = text === arg;
      break;
    case 'neq':
      result = text !== arg;
      break;
    case 'gt':
      result = text !== null && text > arg;
      break;
    case 'gte':
      result = text !== null && text >= arg;
      break;
    case 'lt':
      result = text !== null && text < arg;
      break;
    case 'lte':
      result = text !== null && text <= arg;
      break;
    case 'is':
      result = arg === 'null' ? text === null : String(value) === arg;
      break;
    case 'in':
      result = arg
        .replace(/^\(|\)$/g, '')
        .split(',')
        .map((item) => item.replace(/^"|"$/g, ''))
        .includes(text ?? '');
      break;
    case 'cs':
      result =
        Array.isArray(value) &&
        arg
          .replace(/^\{|\}$/g, '')
          .split(',')
          .every((item) => (value as unknown[]).includes(item));
      break;
    default:
      result = true;
  }
  return not ? !result : result;
}

function query(table: string, params: URLSearchParams): Row[] {
  let rows = [...(demoTables()[table] ?? [])];
  params.forEach((expr, key) => {
    if (['select', 'order', 'limit', 'offset', 'on_conflict', 'columns'].includes(key)) return;
    rows = rows.filter((row) => matches(row, key, expr));
  });
  const order = params.get('order');
  if (order) {
    const keys = order.split(',').map((part) => {
      const [column, direction] = part.split('.');
      return { column, desc: direction === 'desc' };
    });
    rows.sort((a, b) => {
      for (const { column, desc } of keys) {
        const x = String(a[column] ?? '');
        const y = String(b[column] ?? '');
        if (x !== y) return (x < y ? -1 : 1) * (desc ? -1 : 1);
      }
      return 0;
    });
  }
  const offset = Number(params.get('offset') ?? 0);
  const limit = params.get('limit');
  return rows.slice(offset, limit ? offset + Number(limit) : undefined);
}

export function demoFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = new URL(
    typeof input === 'string' ? input : input instanceof URL ? input.href : input.url,
  );
  const method = (init?.method ?? 'GET').toUpperCase();
  const headers = new Headers(init?.headers);
  const path = url.pathname;

  if (path.startsWith('/auth/v1/user')) return json(DEMO_USER);
  if (path.startsWith('/auth/v1/')) return json({});
  if (path.startsWith('/functions/v1/')) return json({});
  if (path.startsWith('/storage/v1/')) return json({});

  const rest = path.match(/\/rest\/v1\/([a-z_]+)/);
  if (!rest) return json({});
  const table = rest[1];

  if (method === 'GET' || method === 'HEAD') {
    const rows = query(table, url.searchParams);
    const range = { 'Content-Range': `0-${Math.max(rows.length - 1, 0)}/${rows.length}` };
    if (headers.get('Accept') === 'application/vnd.pgrst.object+json') {
      return rows[0]
        ? json(rows[0], 200, range)
        : json({ code: 'PGRST116', message: 'No rows' }, 406);
    }
    return json(method === 'HEAD' ? undefined : rows, 200, range);
  }

  // Writes are accepted and echoed back, but never stored.
  let body: unknown = {};
  try {
    body = init?.body ? JSON.parse(String(init.body)) : {};
  } catch {
    body = {};
  }
  const row = { id: `demo-${Date.now()}`, ...(Array.isArray(body) ? body[0] : (body as Row)) };
  if (headers.get('Accept') === 'application/vnd.pgrst.object+json') return json(row, 201);
  return json([row], 201);
}

/** Auth storage that always holds a signed-in demo session. */
export const demoAuthStorage = {
  getItem: (key: string) =>
    Promise.resolve(key.endsWith('-auth-token') ? JSON.stringify(demoSession()) : null),
  setItem: () => Promise.resolve(),
  removeItem: () => Promise.resolve(),
};

function demoSession() {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365;
  const b64 = (value: object) =>
    btoa(JSON.stringify(value)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  const token = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: DEMO_USER.id, exp, role: 'authenticated' })}.demo`;
  return {
    access_token: token,
    refresh_token: 'demo',
    token_type: 'bearer',
    expires_in: 60 * 60 * 24 * 365,
    expires_at: exp,
    user: DEMO_USER,
  };
}
