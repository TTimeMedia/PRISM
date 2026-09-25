import {
  calendarLabel,
  calendarsOf,
  dedupeEvents,
  isAlreadyInPrism,
  matchesSearch,
} from '../importCandidates';

describe('isAlreadyInPrism', () => {
  const existing = [{ title: 'Endocrinology', starts_at: '2026-10-05T14:30:00.000Z' }];

  it('recognises the same title at the same time, ignoring case and seconds', () => {
    expect(
      isAlreadyInPrism({ title: 'endocrinology ', startsAt: '2026-10-05T14:30:45.000Z' }, existing),
    ).toBe(true);
  });

  it('treats a different time or title as new', () => {
    expect(
      isAlreadyInPrism({ title: 'Endocrinology', startsAt: '2026-10-05T15:30:00.000Z' }, existing),
    ).toBe(false);
    expect(
      isAlreadyInPrism({ title: 'Primary care', startsAt: '2026-10-05T14:30:00.000Z' }, existing),
    ).toBe(false);
  });
});

describe('matchesSearch', () => {
  const event = { title: 'Dr. Rivera check-in', location: 'Riverside Clinic', notes: null };

  it('matches everything when the search is empty', () => {
    expect(matchesSearch(event, '   ')).toBe(true);
  });

  it('matches title or place, ignoring case', () => {
    expect(matchesSearch(event, 'rivera')).toBe(true);
    expect(matchesSearch(event, 'CLINIC')).toBe(true);
    expect(matchesSearch(event, 'dentist')).toBe(false);
  });
});

describe('calendarLabel', () => {
  it('names the calendar and its account', () => {
    expect(
      calendarLabel({ calendarId: 'a', calendarName: 'Work', accountName: 'me@gmail.com' }),
    ).toBe('Work · me@gmail.com');
  });

  it('does not repeat itself when the calendar and account share a name, or there is no account', () => {
    expect(calendarLabel({ calendarId: 'a', calendarName: 'iCloud', accountName: 'iCloud' })).toBe(
      'iCloud',
    );
    expect(calendarLabel({ calendarId: 'a', calendarName: 'Home', accountName: null })).toBe(
      'Home',
    );
  });
});

describe('dedupeEvents', () => {
  it('keeps the first of events with the same title at the same time', () => {
    const events = [
      { id: '1', title: 'Endocrinology', startsAt: '2026-10-05T14:30:00.000Z' },
      { id: '2', title: 'endocrinology ', startsAt: '2026-10-05T14:30:20.000Z' },
      { id: '3', title: 'Endocrinology', startsAt: '2026-10-06T14:30:00.000Z' },
    ];
    expect(dedupeEvents(events).map((e) => e.id)).toEqual(['1', '3']);
  });
});

describe('calendarsOf', () => {
  it('lists each calendar once with a count, in a steady order', () => {
    const cal = (calendarId: string, calendarName: string, accountName: string | null) => ({
      calendarId,
      calendarName,
      accountName,
    });
    const result = calendarsOf([
      cal('b', 'Work', 'Google'),
      cal('a', 'Home', 'iCloud'),
      cal('b', 'Work', 'Google'),
    ]);
    expect(result).toEqual([
      { id: 'a', label: 'Home · iCloud', count: 1 },
      { id: 'b', label: 'Work · Google', count: 2 },
    ]);
  });
});
