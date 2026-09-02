import { toISODateTime, splitISODateTime } from '../dateTime';

describe('toISODateTime', () => {
  it('combines a date and time into a valid ISO datetime', () => {
    const iso = toISODateTime('2026-06-01', '09:30');
    expect(new Date(iso).getTime()).not.toBeNaN();
  });

  it('falls back to a default time when none is given', () => {
    const withTime = toISODateTime('2026-06-01', '09:00');
    const withoutTime = toISODateTime('2026-06-01', null);
    expect(withoutTime).toBe(withTime);
  });

  it('falls back to a default time when given a malformed one', () => {
    const withTime = toISODateTime('2026-06-01', '09:00');
    const malformed = toISODateTime('2026-06-01', 'not-a-time');
    expect(malformed).toBe(withTime);
  });
});

describe('splitISODateTime — inverse of toISODateTime', () => {
  it('round-trips a date/time pair through combine-then-split', () => {
    const iso = toISODateTime('2026-06-01', '14:45');
    const { date, time } = splitISODateTime(iso);
    expect(date).toBe('2026-06-01');
    expect(time).toBe('14:45');
  });
});
