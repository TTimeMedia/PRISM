import type { Appointment, Medication } from '@prism/types';
import { reminderSampleFor } from '../sampleVars';

const med = (o: Partial<Medication>): Medication =>
  ({
    id: 'm',
    name: 'Something',
    form: 'pill',
    dosage_text: null,
    frequency_config: null,
    reminder_enabled: true,
    ...o,
  }) as Medication;

const appt = (o: Partial<Appointment>): Appointment =>
  ({
    id: 'a',
    title: 'Visit',
    starts_at: '2030-01-01T15:00:00.000Z',
    reminder_enabled: true,
    ...o,
  }) as Appointment;

const NOW = new Date('2026-09-24T12:00:00Z');

describe('reminderSampleFor', () => {
  it("uses the person's own medication, with its time and dose", () => {
    const sample = reminderSampleFor(
      'injection',
      [
        med({
          name: 'Testosterone cypionate',
          form: 'injection',
          dosage_text: '0.5 ml',
          frequency_config: { time_of_day: '20:00' },
        }),
      ],
      [],
      NOW,
    );
    expect(sample.own).toBe(true);
    expect(sample.vars.name).toBe('Testosterone cypionate');
    expect(sample.vars.dose).toBe('0.5 ml');
    expect(sample.vars.time).toMatch(/8:00/);
  });

  it('keeps injections and other medications apart', () => {
    const meds = [med({ name: 'Shot', form: 'injection' }), med({ name: 'Pill', form: 'pill' })];
    expect(reminderSampleFor('medication', meds, [], NOW).vars.name).toBe('Pill');
    expect(reminderSampleFor('injection', meds, [], NOW).vars.name).toBe('Shot');
  });

  it('counts only medications with reminders on', () => {
    const meds = [
      med({ name: 'A' }),
      med({ name: 'B', reminder_enabled: false }),
      med({ name: 'C' }),
    ];
    const sample = reminderSampleFor('medication', meds, [], NOW);
    expect(sample.count).toBe(2);
    expect(sample.vars.name).toBe('A');
  });

  it('uses the next upcoming appointment that has a reminder', () => {
    const sample = reminderSampleFor(
      'appointment',
      [],
      [
        appt({ title: 'Past', starts_at: '2020-01-01T10:00:00.000Z' }),
        appt({ title: 'No reminder', reminder_enabled: false }),
        appt({ title: 'Later', starts_at: '2030-06-01T10:00:00.000Z' }),
        appt({ title: 'Next', starts_at: '2030-01-01T10:00:00.000Z' }),
      ],
      NOW,
    );
    expect(sample.vars.name).toBe('Next');
    expect(sample.count).toBe(2);
  });

  it('falls back to a neutral example that assumes no medication', () => {
    const sample = reminderSampleFor('medication', [med({ reminder_enabled: false })], [], NOW);
    expect(sample.own).toBe(false);
    expect(sample.count).toBe(0);
    expect(sample.vars.name).toBe('Vitamin D');
  });
});
