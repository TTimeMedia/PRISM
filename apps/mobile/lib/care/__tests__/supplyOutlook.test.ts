import type { Medication, Supply } from '@prism/types';
import {
  daysBetweenDoses,
  outlookLabel,
  supplyOutlook,
  supplyReminderTimes,
} from '../supplyOutlook';

const now = new Date(2026, 9, 7, 9, 0); // Wed Oct 7 2026, 9:00

function supply(overrides: Partial<Supply> = {}): Supply {
  return {
    id: 's1',
    user_id: 'u',
    name: 'Testosterone vial',
    medication_id: 'm1',
    quantity: 2,
    unit: 'mL',
    per_dose: 0.25,
    refill_on: null,
    pharmacy: null,
    notes: null,
    created_at: '',
    updated_at: '',
    ...overrides,
  };
}

function medication(overrides: Partial<Medication> = {}): Medication {
  return {
    id: 'm1',
    user_id: 'u',
    name: 'Testosterone cypionate',
    form: 'injection',
    dosage_text: null,
    frequency_type: 'weekly',
    frequency_config: { days_of_week: [3], time_of_day: '08:00' },
    start_date: null,
    end_date: null,
    reminder_enabled: true,
    notes: null,
    created_at: '',
    updated_at: '',
    ...overrides,
  };
}

describe('daysBetweenDoses', () => {
  it('reads each kind of schedule', () => {
    expect(daysBetweenDoses(medication({ frequency_type: 'daily', frequency_config: {} }))).toBe(1);
    expect(daysBetweenDoses(medication())).toBe(7);
    expect(daysBetweenDoses(medication({ frequency_config: { days_of_week: [1, 4] } }))).toBe(3.5);
    expect(
      daysBetweenDoses(
        medication({ frequency_type: 'every_x_days', frequency_config: { interval_days: 10 } }),
      ),
    ).toBe(10);
    expect(daysBetweenDoses(null)).toBeNull();
  });
});

describe('supplyOutlook', () => {
  it('counts doses left and when it runs out', () => {
    const outlook = supplyOutlook(supply(), medication(), now);
    expect(outlook.dosesLeft).toBe(8);
    expect(outlook.runsOutOn?.toDateString()).toBe(new Date(2026, 11, 2).toDateString());
    expect(outlook.low).toBe(false);
  });

  it('is low within a week of running out, or when empty', () => {
    expect(supplyOutlook(supply({ quantity: 0.25 }), medication(), now).low).toBe(true);
    expect(supplyOutlook(supply({ quantity: 0 }), medication(), now).low).toBe(true);
    expect(supplyOutlook(supply({ per_dose: null, quantity: 0 }), null, now).low).toBe(true);
  });

  it('flags a refill date within a week', () => {
    expect(supplyOutlook(supply({ refill_on: '2026-10-12' }), medication(), now).refillSoon).toBe(
      true,
    );
    expect(supplyOutlook(supply({ refill_on: '2026-11-30' }), medication(), now).refillSoon).toBe(
      false,
    );
  });

  it('cannot estimate without an amount per dose', () => {
    const outlook = supplyOutlook(supply({ per_dose: null }), medication(), now);
    expect(outlook.dosesLeft).toBeNull();
    expect(outlook.runsOutOn).toBeNull();
  });
});

describe('outlookLabel', () => {
  it('reads naturally', () => {
    const s = supply();
    expect(outlookLabel(s, supplyOutlook(s, medication(), now), now)).toBe(
      '2 mL left · 8 doses · about 8 weeks',
    );
  });
});

describe('supplyReminderTimes', () => {
  it('reminds a week before running out and a week before the refill date, at 10:00', () => {
    const times = supplyReminderTimes(supply({ refill_on: '2026-11-01' }), medication(), now);
    expect(times.map((t) => [t.kind, t.date.toDateString(), t.date.getHours()])).toEqual([
      ['running-low', new Date(2026, 10, 25).toDateString(), 10],
      ['refill', new Date(2026, 9, 25).toDateString(), 10],
    ]);
  });

  it('skips reminders whose time has passed', () => {
    expect(
      supplyReminderTimes(supply({ quantity: 0, refill_on: '2026-10-09' }), medication(), now),
    ).toEqual([]);
  });
});
