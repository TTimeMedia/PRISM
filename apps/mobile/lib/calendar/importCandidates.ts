import type { Appointment } from '@prism/types';

export interface ImportCandidate {
  title: string;
  startsAt: string;
}

function minuteKey(iso: string): string {
  return new Date(iso).toISOString().slice(0, 16);
}

/** The same title at the same minute — how an appointment already in Prism is recognised. */
function identity(candidate: ImportCandidate): string {
  return `${candidate.title.trim().toLowerCase()}|${minuteKey(candidate.startsAt)}`;
}

/** True when Prism already has an appointment with this title at this time. */
export function isAlreadyInPrism(
  candidate: ImportCandidate,
  existing: readonly Pick<Appointment, 'title' | 'starts_at'>[],
): boolean {
  const key = identity(candidate);
  return existing.some((a) => identity({ title: a.title, startsAt: a.starts_at }) === key);
}

/** Case-insensitive match against the title, place, and notes. An empty search matches everything. */
export function matchesSearch(
  event: { title: string; location: string | null; notes: string | null },
  query: string,
): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return [event.title, event.location, event.notes].some((field) =>
    field?.toLowerCase().includes(needle),
  );
}

export interface CalendarLabelled {
  calendarId: string;
  calendarName: string;
  accountName: string | null;
}

/** "Work · Google" style label for a calendar and the account it belongs to. */
export function calendarLabel(event: CalendarLabelled): string {
  return event.accountName && event.accountName !== event.calendarName
    ? `${event.calendarName} · ${event.accountName}`
    : event.calendarName;
}

/**
 * The same appointment often sits on two calendars (an invite copied to both
 * a work and a personal account). Keep the first of any events with the same
 * title at the same time, so it is only listed once.
 */
export function dedupeEvents<T extends { title: string; startsAt: string }>(
  events: readonly T[],
): T[] {
  const seen = new Set<string>();
  const kept: T[] = [];
  for (const event of events) {
    const key = identity(event);
    if (seen.has(key)) continue;
    seen.add(key);
    kept.push(event);
  }
  return kept;
}

/** Each calendar that has events in the list, with how many, in a steady order. */
export function calendarsOf<T extends CalendarLabelled>(
  events: readonly T[],
): { id: string; label: string; count: number }[] {
  const byId = new Map<string, { id: string; label: string; count: number }>();
  for (const event of events) {
    const existing = byId.get(event.calendarId);
    if (existing) existing.count += 1;
    else
      byId.set(event.calendarId, { id: event.calendarId, label: calendarLabel(event), count: 1 });
  }
  return [...byId.values()].sort((a, b) => a.label.localeCompare(b.label));
}
