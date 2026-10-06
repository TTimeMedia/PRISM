import type { Appointment } from '@prism/types';
import { isAlreadyInPrism } from './importCandidates';
import type { CalendarEventSummary } from './types';

/**
 * Calendar suggestions: when the person has turned them on, Today offers
 * upcoming events from the phone's calendar that look like appointments,
 * so a booking added to the calendar (for example with Gmail's "Add to
 * Calendar") is one tap from Prism. Read on the phone only; nothing is kept
 * unless the person adds it.
 */

/** How far ahead to look. */
export const SUGGESTION_WINDOW_DAYS = 60;
/** At most this many on Today at once. */
export const MAX_SUGGESTIONS = 3;
/** Remember this many "Not this one" choices; older ones are long past. */
export const MAX_DISMISSED = 200;

const APPOINTMENT_WORDS =
  /\b(appointment|appt|session|consult(ation)?|clinic|doctor|dr\.?|dentist|dental|therap(y|ist)|counsel(l)?ing|psychiatr\w*|lab(s)?|blood ?(work|test)|booking|booked|reservation|confirmed|visit|check-?up|exam|screening|treatment|follow-?up|surgery|surgeon|procedure|endo(crinolog\w*)?|gyn\w*|urolog\w*|dermatolog\w*|pharmacy|prescription|vaccin\w*|injection|shot|physio\w*|chiro\w*|massage|acupunct\w*|salon|spa|studio|stylist|haircut|barber|nails?|laser|electrolysis|tattoo|piercing|voice (lesson|coach))\b/i;

/** A street address: a number followed by a word, as most booking locations are. */
const STREET_ADDRESS = /\b\d{1,6}\s+[A-Za-z]/;

/** A stable key for an event, so a dismissal survives the calendar being re-read. */
export function suggestionKey(event: Pick<CalendarEventSummary, 'title' | 'startsAt'>): string {
  return `${event.title.trim().toLowerCase()}|${new Date(event.startsAt).toISOString().slice(0, 16)}`;
}

/** True for a timed event whose words or place look like an appointment. */
export function looksLikeAppointment(event: CalendarEventSummary): boolean {
  if (event.allDay) return false;
  const words = [event.title, event.notes].filter(Boolean).join(' ');
  return APPOINTMENT_WORDS.test(words) || STREET_ADDRESS.test(event.location ?? '');
}

export function pickSuggestions(
  events: readonly CalendarEventSummary[],
  existing: readonly Pick<Appointment, 'title' | 'starts_at'>[],
  dismissed: readonly string[],
  now: Date = new Date(),
): CalendarEventSummary[] {
  const until = now.getTime() + SUGGESTION_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const skip = new Set(dismissed);
  const seen = new Set<string>();
  return events
    .filter((event) => {
      const at = new Date(event.startsAt).getTime();
      const key = suggestionKey(event);
      if (at < now.getTime() || at > until || skip.has(key) || seen.has(key)) return false;
      seen.add(key);
      return looksLikeAppointment(event) && !isAlreadyInPrism(event, existing);
    })
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .slice(0, MAX_SUGGESTIONS);
}
