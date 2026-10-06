import type { Appointment, Medication } from '@prism/types';
import { buildWatchContext, parseWatchAction, SIGNED_OUT_CONTEXT } from '../watchContext';

const now = new Date(2026, 9, 5, 9, 0);

function medication(overrides: Partial<Medication> = {}): Medication {
  return {
    id: 'm1',
    user_id: 'u1',
    name: 'Testosterone cypionate',
    form: 'injection',
    dosage_text: '.3cc',
    frequency_type: 'daily',
    frequency_config: { time_of_day: '10:00' },
    start_date: null,
    end_date: null,
    reminder_enabled: true,
    notes: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function appointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: 'a1',
    user_id: 'u1',
    title: 'Endocrinology',
    provider: null,
    category: null,
    starts_at: new Date(2026, 9, 7, 14, 30).toISOString(),
    ends_at: null,
    location: 'Fenway Health',
    notes: null,
    reminder_enabled: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  } as Appointment;
}

describe('buildWatchContext', () => {
  it("lists today's doses with names, and the next appointment, when notifications aren't private", () => {
    const context = buildWatchContext({
      medications: [medication()],
      logs: [],
      appointments: [appointment()],
      notificationPrivacy: false,
      now,
    });

    expect(context.signedIn).toBe(true);
    expect(context.doses).toEqual([
      {
        medicationId: 'm1',
        label: 'Testosterone cypionate',
        detail: '.3cc',
        at: new Date(2026, 9, 5, 10, 0).toISOString(),
        taken: false,
      },
    ]);
    expect(context.next).toEqual({
      label: 'Endocrinology',
      at: appointment().starts_at,
      place: 'Fenway Health',
    });
  });

  it('sends no names, doses or places to the watch while notifications are private', () => {
    const context = buildWatchContext({
      medications: [medication()],
      logs: [],
      appointments: [appointment()],
      notificationPrivacy: true,
      now,
    });

    const json = JSON.stringify(context);
    expect(json).not.toContain('Testosterone');
    expect(json).not.toContain('.3cc');
    expect(json).not.toContain('Endocrinology');
    expect(json).not.toContain('Fenway');
    expect(context.doses[0]?.label).toBe('Dose');
    expect(context.next?.label).toBe('Appointment');
  });

  it('ticks off a dose logged today, but not one logged yesterday', () => {
    const today = buildWatchContext({
      medications: [medication()],
      logs: [
        {
          medication_id: 'm1',
          scheduled_at: new Date(2026, 9, 5, 10, 0).toISOString(),
          status: 'completed',
        },
      ],
      appointments: [],
      notificationPrivacy: true,
      now,
    });
    const yesterday = buildWatchContext({
      medications: [medication()],
      logs: [
        {
          medication_id: 'm1',
          scheduled_at: new Date(2026, 9, 4, 10, 0).toISOString(),
          status: 'completed',
        },
      ],
      appointments: [],
      notificationPrivacy: true,
      now,
    });

    expect(today.doses[0]?.taken).toBe(true);
    expect(yesterday.doses[0]?.taken).toBe(false);
  });

  it('leaves out medications not due today and appointments already past', () => {
    const tomorrowOnly = medication({
      id: 'weekly',
      frequency_type: 'weekly',
      frequency_config: { time_of_day: '10:00', days_of_week: [(now.getDay() + 1) % 7] },
    });
    const context = buildWatchContext({
      medications: [tomorrowOnly],
      logs: [],
      appointments: [appointment({ starts_at: new Date(2026, 9, 4, 9, 0).toISOString() })],
      notificationPrivacy: false,
      now,
    });

    expect(context.doses).toEqual([]);
    expect(context.next).toBeNull();
  });

  it('clears the watch when signed out', () => {
    expect(SIGNED_OUT_CONTEXT(now)).toMatchObject({ signedIn: false, doses: [], next: null });
  });
});

describe('parseWatchAction', () => {
  it('reads a dose logged on the watch', () => {
    expect(
      parseWatchAction(
        JSON.stringify({
          type: 'logDose',
          id: 'x',
          medicationId: 'm1',
          at: '2026-10-05T17:00:00Z',
        }),
      ),
    ).toEqual({ type: 'logDose', id: 'x', medicationId: 'm1', at: '2026-10-05T17:00:00Z' });
  });

  it('ignores anything else', () => {
    expect(parseWatchAction('not json')).toBeNull();
    expect(parseWatchAction(JSON.stringify({ type: 'logDose', id: 'x' }))).toBeNull();
    expect(
      parseWatchAction(
        JSON.stringify({ type: 'logDose', id: 'x', medicationId: 'm1', at: 'yesterday' }),
      ),
    ).toBeNull();
  });
});
