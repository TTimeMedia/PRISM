import type { CalendarEventSummary } from '../types';
import {
  MAX_SUGGESTIONS,
  looksLikeAppointment,
  pickSuggestions,
  suggestionKey,
} from '../suggestions';

const now = new Date('2026-10-06T12:00:00Z');
const inDays = (days: number) => new Date(now.getTime() + days * 86400000).toISOString();

function event(overrides: Partial<CalendarEventSummary> = {}): CalendarEventSummary {
  return {
    id: overrides.title ?? 'e1',
    title: '2nd session- Micro at Studio Sashiko Los Angeles',
    location: 'Studio Sashiko Los Angeles, 690 Imperial Street, Ste 101, Los Angeles, CA',
    notes: null,
    startsAt: inDays(3),
    endsAt: inDays(3),
    allDay: false,
    calendarId: 'c1',
    calendarName: 'Calendar',
    accountName: 'Google',
    ...overrides,
  };
}

describe('looksLikeAppointment', () => {
  it('spots bookings by their words or their street address', () => {
    expect(looksLikeAppointment(event())).toBe(true);
    expect(looksLikeAppointment(event({ title: 'Dr. Patel', location: null }))).toBe(true);
    expect(looksLikeAppointment(event({ title: 'Lunch', location: '12 Main St' }))).toBe(true);
  });

  it('leaves out everyday events and all-day ones', () => {
    expect(
      looksLikeAppointment(event({ title: 'Afternoon: neighborhood walk', location: null })),
    ).toBe(false);
    expect(looksLikeAppointment(event({ title: 'Clinic', allDay: true }))).toBe(false);
  });
});

describe('pickSuggestions', () => {
  it('suggests upcoming appointment-like events, soonest first', () => {
    const later = event({ id: 'later', title: 'Therapy session', startsAt: inDays(10) });
    const sooner = event({ id: 'sooner', startsAt: inDays(2) });
    expect(pickSuggestions([later, sooner], [], [], now).map((e) => e.id)).toEqual([
      'sooner',
      'later',
    ]);
  });

  it("skips what's already in Prism, dismissed, past, or too far ahead", () => {
    const inPrism = event({ id: 'in', title: 'Endo appointment' });
    const dismissed = event({ id: 'no', title: 'Lab work', startsAt: inDays(4) });
    const past = event({ id: 'past', title: 'Dentist', startsAt: inDays(-1) });
    const far = event({ id: 'far', title: 'Surgery', startsAt: inDays(90) });

    const picked = pickSuggestions(
      [inPrism, dismissed, past, far],
      [{ title: 'Endo appointment', starts_at: inPrism.startsAt }],
      [suggestionKey(dismissed)],
      now,
    );

    expect(picked).toEqual([]);
  });

  it('shows at most a few, and an event on two calendars once', () => {
    const many = Array.from({ length: 6 }, (_, i) =>
      event({ id: `s${i}`, title: `Session ${i}`, startsAt: inDays(i + 1) }),
    );
    const twin = event({ id: 'twin', title: 'Session 0', startsAt: inDays(1) });
    const picked = pickSuggestions([...many, twin], [], [], now);
    expect(picked).toHaveLength(MAX_SUGGESTIONS);
    expect(picked.filter((e) => e.title === 'Session 0')).toHaveLength(1);
  });
});
