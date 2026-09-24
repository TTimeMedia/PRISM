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
