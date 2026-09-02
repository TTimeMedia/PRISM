import { describeFrequency, isMedicationActive } from '../medicationDisplay';

describe('describeFrequency', () => {
  it('describes daily with a time of day', () => {
    expect(describeFrequency('daily', { time_of_day: '08:00' })).toBe('Daily at 08:00');
  });

  it('describes daily without a time of day', () => {
    expect(describeFrequency('daily', null)).toBe('Daily');
  });

  it('describes weekly with named days', () => {
    expect(describeFrequency('weekly', { days_of_week: [1, 3, 5] })).toBe(
      'Weekly on Mon, Wed, Fri',
    );
  });

  it('describes every_x_days with the interval', () => {
    expect(describeFrequency('every_x_days', { interval_days: 3 })).toBe('Every 3 days');
  });

  it('describes custom without inventing a schedule', () => {
    expect(describeFrequency('custom', null)).toBe('Custom schedule');
  });

  it('never fabricates a next-dose time — falls back to a plain "no schedule" label', () => {
    expect(describeFrequency(null, null)).toBe('No schedule set');
  });
});

describe('isMedicationActive', () => {
  it('is active when end_date is null', () => {
    expect(isMedicationActive(null)).toBe(true);
  });

  it('is active when end_date is today or in the future', () => {
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    expect(isMedicationActive(future)).toBe(true);
  });

  it('is paused when end_date is in the past — this is how "Pause" is expressed (docs/DECISIONS.md § CARE)', () => {
    expect(isMedicationActive('2020-01-01')).toBe(false);
  });
});
