import { parseIcs } from '../ics';

const wrap = (body: string) =>
  `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\n${body}\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n`;

describe('parseIcs', () => {
  it('reads a UTC appointment with a place and notes', () => {
    const [event] = parseIcs(
      wrap(
        [
          'SUMMARY:Endocrinology visit',
          'DTSTART:20261005T143000Z',
          'DTEND:20261005T150000Z',
          'LOCATION:Riverside Clinic\\, Suite 4',
          'DESCRIPTION:Bring labs.\\nArrive 10 minutes early.',
        ].join('\r\n'),
      ),
    );
    expect(event).toEqual({
      title: 'Endocrinology visit',
      startsAt: '2026-10-05T14:30:00.000Z',
      endsAt: '2026-10-05T15:00:00.000Z',
      location: 'Riverside Clinic, Suite 4',
      notes: 'Bring labs.\nArrive 10 minutes early.',
      allDay: false,
    });
  });

  it('reads a time in a named time zone as that zone, not the phone', () => {
    const [event] = parseIcs(
      wrap('SUMMARY:Check-in\r\nDTSTART;TZID=America/New_York:20261005T100000'),
    );
    // 10:00 in New York on 5 Oct 2026 is EDT (UTC-4).
    expect(event?.startsAt).toBe('2026-10-05T14:00:00.000Z');
  });

  it('handles standard time in a named zone', () => {
    const [event] = parseIcs(
      wrap('SUMMARY:Check-in\r\nDTSTART;TZID=America/New_York:20261210T100000'),
    );
    expect(event?.startsAt).toBe('2026-12-10T15:00:00.000Z');
  });

  it('reads a date with no time as an all-day event', () => {
    const [event] = parseIcs(wrap('SUMMARY:Surgery\r\nDTSTART;VALUE=DATE:20261101'));
    expect(event?.allDay).toBe(true);
    expect(event?.title).toBe('Surgery');
  });

  it('works out the end from a duration', () => {
    const [event] = parseIcs(
      wrap('SUMMARY:Therapy\r\nDTSTART:20261005T140000Z\r\nDURATION:PT1H30M'),
    );
    expect(event?.endsAt).toBe('2026-10-05T15:30:00.000Z');
  });

  it('unfolds long lines that were wrapped', () => {
    const [event] = parseIcs(
      wrap('SUMMARY:A very long appointment\r\n  title that wraps\r\nDTSTART:20261005T140000Z'),
    );
    expect(event?.title).toBe('A very long appointment title that wraps');
  });

  it('reads every event in a file', () => {
    const text = `${wrap('SUMMARY:One\r\nDTSTART:20261005T140000Z')}${wrap('SUMMARY:Two\r\nDTSTART:20261006T140000Z')}`;
    expect(parseIcs(text).map((e) => e.title)).toEqual(['One', 'Two']);
  });

  it('skips events it cannot use, and text that is not a calendar', () => {
    expect(parseIcs(wrap('DTSTART:20261005T140000Z'))).toEqual([]);
    expect(parseIcs(wrap('SUMMARY:No time'))).toEqual([]);
    expect(parseIcs('hello world')).toEqual([]);
  });
});
