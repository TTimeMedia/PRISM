/**
 * A small, forgiving reader for iCalendar (.ics) files — the calendar
 * attachments clinics and patient portals send. It reads what Prism needs
 * to make an appointment (title, start, end, place, notes) and ignores the
 * rest, including repeat rules: an imported appointment is the first date
 * in the file. Runs entirely on the phone.
 */

export interface IcsEvent {
  title: string;
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  notes: string | null;
  allDay: boolean;
}

interface Property {
  name: string;
  params: Record<string, string>;
  value: string;
}

/** Joins lines folded with a leading space or tab, and splits into lines. */
function unfold(text: string): string[] {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n[ \t]/g, '')
    .split('\n')
    .filter((line) => line.length > 0);
}

function unescapeText(value: string): string {
  return value
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
}

function parseProperty(line: string): Property | null {
  const colon = line.indexOf(':');
  if (colon < 1) return null;
  const [name, ...rawParams] = line.slice(0, colon).split(';');
  const params: Record<string, string> = {};
  for (const raw of rawParams) {
    const eq = raw.indexOf('=');
    if (eq > 0) params[raw.slice(0, eq).toUpperCase()] = raw.slice(eq + 1).replace(/^"|"$/g, '');
  }
  return { name: (name ?? '').toUpperCase(), params, value: line.slice(colon + 1) };
}

/** The offset of `timeZone` from UTC, in ms, at the given instant. */
function zoneOffsetMs(instant: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(instant));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
    get('second'),
  );
  return asUtc - instant;
}

/** Wall-clock time in a named zone to a real instant. */
function zonedToInstant(
  y: number,
  mo: number,
  d: number,
  h: number,
  mi: number,
  s: number,
  timeZone: string,
): number {
  const guess = Date.UTC(y, mo - 1, d, h, mi, s);
  return guess - zoneOffsetMs(guess, timeZone);
}

/** Reads DTSTART/DTEND values in the three shapes calendars use. Null when unreadable. */
function parseDate(property: Property): { iso: string; allDay: boolean } | null {
  const match = property.value
    .trim()
    .match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/);
  if (!match) return null;
  const [, ys, mos, ds, hs, mis, ss, utc] = match;
  const y = Number(ys);
  const mo = Number(mos);
  const d = Number(ds);
  if (hs === undefined) {
    // A date with no time: an all-day event, kept at local midnight.
    return { iso: new Date(y, mo - 1, d).toISOString(), allDay: true };
  }
  const h = Number(hs);
  const mi = Number(mis);
  const s = Number(ss ?? 0);
  let instant: number;
  if (utc) {
    instant = Date.UTC(y, mo - 1, d, h, mi, s);
  } else if (property.params.TZID) {
    try {
      instant = zonedToInstant(y, mo, d, h, mi, s, property.params.TZID);
    } catch {
      // An unfamiliar zone name (some calendars use their own): read it as local time.
      instant = new Date(y, mo - 1, d, h, mi, s).getTime();
    }
  } else {
    instant = new Date(y, mo - 1, d, h, mi, s).getTime();
  }
  return { iso: new Date(instant).toISOString(), allDay: false };
}

/** Reads a duration like PT1H30M into milliseconds. */
function parseDurationMs(value: string): number | null {
  const match = value
    .trim()
    .match(/^P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/);
  if (!match) return null;
  const [, w, d, h, m, s] = match.map((part) => Number(part ?? 0));
  return (
    (((w ?? 0) * 7 + (d ?? 0)) * 24 * 3600 + (h ?? 0) * 3600 + (m ?? 0) * 60 + (s ?? 0)) * 1000
  );
}

/** Every event in an .ics file that has a title and a readable start. */
export function parseIcs(text: string): IcsEvent[] {
  const lines = unfold(text);
  const events: IcsEvent[] = [];
  let current: Property[] | null = null;

  for (const line of lines) {
    const upper = line.toUpperCase();
    if (upper === 'BEGIN:VEVENT') {
      current = [];
      continue;
    }
    if (upper === 'END:VEVENT') {
      if (current) {
        const event = buildEvent(current);
        if (event) events.push(event);
      }
      current = null;
      continue;
    }
    if (current) {
      const property = parseProperty(line);
      if (property) current.push(property);
    }
  }
  return events;
}

function buildEvent(properties: Property[]): IcsEvent | null {
  const find = (name: string) => properties.find((p) => p.name === name);
  const summary = find('SUMMARY');
  const startProp = find('DTSTART');
  if (!summary || !startProp) return null;
  const start = parseDate(startProp);
  if (!start) return null;

  let endsAt: string | null = null;
  const endProp = find('DTEND');
  const durationProp = find('DURATION');
  if (endProp) {
    endsAt = parseDate(endProp)?.iso ?? null;
  } else if (durationProp) {
    const ms = parseDurationMs(durationProp.value);
    if (ms) endsAt = new Date(new Date(start.iso).getTime() + ms).toISOString();
  }

  const title = unescapeText(summary.value).trim();
  if (!title) return null;
  const location = find('LOCATION');
  const description = find('DESCRIPTION');
  return {
    title,
    startsAt: start.iso,
    endsAt,
    location: location ? unescapeText(location.value).trim() || null : null,
    notes: description ? unescapeText(description.value).trim() || null : null,
    allDay: start.allDay,
  };
}
