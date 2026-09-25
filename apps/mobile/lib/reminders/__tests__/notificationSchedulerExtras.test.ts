import type { Appointment, Medication } from '@prism/types';
import {
  ACTION_DONE,
  ACTION_SNOOZE,
  APPOINTMENT_CATEGORY,
  MEDICATION_CATEGORY,
  cancelDueNudges,
  cancelRemindersFor,
  registerNotificationCategories,
  scheduleAppointmentReminder,
  scheduleMedicationReminders,
  scheduleSnooze,
  trimToBudget,
} from '../notificationScheduler';

const SchedulableTriggerInputTypes = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  DATE: 'date',
  TIME_INTERVAL: 'timeInterval',
};

const mockSchedule = jest.fn();
const mockCancel = jest.fn();
const mockGetAll = jest.fn();
const mockSetCategory = jest.fn();

jest.mock('expo-notifications', () => ({
  SchedulableTriggerInputTypes,
  scheduleNotificationAsync: (...args: unknown[]) => mockSchedule(...args),
  cancelScheduledNotificationAsync: (...args: unknown[]) => mockCancel(...args),
  getAllScheduledNotificationsAsync: (...args: unknown[]) => mockGetAll(...args),
  setNotificationCategoryAsync: (...args: unknown[]) => mockSetCategory(...args),
}));

function medication(overrides: Partial<Medication> = {}): Medication {
  return {
    id: 'm1',
    user_id: 'u1',
    name: 'Estradiol',
    form: 'pill',
    dosage_text: '2mg',
    frequency_type: 'daily',
    frequency_config: { time_of_day: '09:00' },
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
    provider: 'Dr. Rivera',
    category: null,
    starts_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    ends_at: null,
    location: null,
    notes: null,
    reminder_enabled: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  } as Appointment;
}

const triggerTypes = () => mockSchedule.mock.calls.map((call) => call[0].trigger.type);

beforeEach(() => {
  jest.clearAllMocks();
  mockSchedule.mockResolvedValue('id');
  mockCancel.mockResolvedValue(undefined);
  mockGetAll.mockResolvedValue([]);
});

describe('registerNotificationCategories', () => {
  it('gives medication reminders Done and Snooze, and appointments Snooze', async () => {
    await registerNotificationCategories();

    const byCategory = Object.fromEntries(
      mockSetCategory.mock.calls.map(([id, actions]) => [
        id,
        (actions as { identifier: string }[]).map((a) => a.identifier),
      ]),
    );
    expect(byCategory[MEDICATION_CATEGORY]).toEqual([ACTION_DONE, ACTION_SNOOZE]);
    expect(byCategory[APPOINTMENT_CATEGORY]).toEqual([ACTION_SNOOZE]);
  });
});

describe('scheduleMedicationReminders — paused and future medications', () => {
  it('stops repeating reminders for a paused medication', async () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const paused = medication({ end_date: yesterday.toISOString().slice(0, 10) });

    await scheduleMedicationReminders(paused, true);

    // Paused: nothing left to remind about, and never a repeating daily trigger.
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it('uses dated reminders, not a repeating one, while a medication has an end date ahead', async () => {
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await scheduleMedicationReminders(
      medication({ end_date: nextMonth.toISOString().slice(0, 10) }),
      true,
    );

    expect(mockSchedule).toHaveBeenCalled();
    expect(triggerTypes().every((type) => type === 'date')).toBe(true);
  });

  it('attaches the Done / Snooze buttons to medication reminders', async () => {
    await scheduleMedicationReminders(medication(), true);

    expect(mockSchedule.mock.calls[0]?.[0].content.categoryIdentifier).toBe(MEDICATION_CATEGORY);
  });
});

describe('scheduleMedicationReminders — follow-up', () => {
  it('adds no follow-up unless asked', async () => {
    await scheduleMedicationReminders(medication(), true);

    expect(mockSchedule).toHaveBeenCalledTimes(1);
  });

  it('adds a dated follow-up for each of the next doses, tagged so it can be cancelled', async () => {
    await scheduleMedicationReminders(medication(), false, { nudgeDelayMinutes: 30 });

    const nudges = mockSchedule.mock.calls
      .map((call) => call[0])
      .filter((arg) => arg.content.data.type === 'medication_nudge');
    expect(nudges.length).toBeGreaterThan(0);
    expect(nudges.length).toBeLessThanOrEqual(3);
    expect(nudges[0].content.data.referenceId).toBe('m1');
    expect(typeof nudges[0].content.data.doseAt).toBe('string');
    expect(nudges[0].trigger.type).toBe('date');
  });

  it('keeps follow-ups generic when notifications are private', async () => {
    await scheduleMedicationReminders(medication(), true, { nudgeDelayMinutes: 30 });

    const nudge = mockSchedule.mock.calls
      .map((call) => call[0])
      .find((arg) => arg.content.data.type === 'medication_nudge');
    expect(nudge.content.title).toBe('Prism');
    expect(nudge.content.body).toBe('Your Prism reminder is still waiting.');
  });
});

describe('scheduleAppointmentReminder — lead times', () => {
  it('schedules one reminder per chosen lead', async () => {
    await scheduleAppointmentReminder(appointment(), false, [0, 60, 1440]);

    expect(mockSchedule).toHaveBeenCalledTimes(3);
  });

  it('says how far off it is in the detailed wording', async () => {
    await scheduleAppointmentReminder(appointment(), false, [1440]);

    const { content } = mockSchedule.mock.calls[0]?.[0];
    expect(content.title).toBe('Prism');
    expect(content.body).toBe('Endocrinology tomorrow.');
    expect(content.categoryIdentifier).toBe(APPOINTMENT_CATEGORY);
  });

  it('skips a lead that has already gone by', async () => {
    const soon = appointment({ starts_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() });

    await scheduleAppointmentReminder(soon, true, [0, 60]);

    expect(mockSchedule).toHaveBeenCalledTimes(1);
  });
});

describe('cancelRemindersFor and cancelDueNudges', () => {
  const pending = (id: string, data: Record<string, unknown>) => ({
    identifier: id,
    content: { data },
  });

  it('cancels a medication together with its follow-ups', async () => {
    mockGetAll.mockResolvedValue([
      pending('dose', { type: 'medication', referenceId: 'm1' }),
      pending('nudge', { type: 'medication_nudge', referenceId: 'm1' }),
      pending('other', { type: 'medication', referenceId: 'm2' }),
    ]);

    await cancelRemindersFor('medication', 'm1');

    expect(mockCancel.mock.calls.map((c) => c[0]).sort()).toEqual(['dose', 'nudge']);
  });

  it('cancels only the follow-up of a dose that has already come due', async () => {
    const past = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    mockGetAll.mockResolvedValue([
      pending('due', { type: 'medication_nudge', referenceId: 'm1', doseAt: past }),
      pending('tomorrow', { type: 'medication_nudge', referenceId: 'm1', doseAt: future }),
      pending('elsewhere', { type: 'medication_nudge', referenceId: 'm2', doseAt: past }),
    ]);

    await cancelDueNudges('m1');

    expect(mockCancel.mock.calls.map((c) => c[0])).toEqual(['due']);
  });
});

describe('scheduleSnooze', () => {
  it('sends the same reminder again in ten minutes, marked so a re-sync leaves it alone', async () => {
    await scheduleSnooze({
      title: 'Prism',
      body: 'Your Prism reminder is ready.',
      data: { type: 'medication', referenceId: 'm1' },
      categoryIdentifier: MEDICATION_CATEGORY,
    });

    const arg = mockSchedule.mock.calls[0]?.[0];
    expect(arg.trigger).toEqual({ type: 'timeInterval', seconds: 600 });
    expect(arg.content.data).toEqual({
      type: 'snooze',
      originType: 'medication',
      referenceId: 'm1',
    });
    expect(arg.content.categoryIdentifier).toBe(MEDICATION_CATEGORY);
  });
});

describe('trimToBudget', () => {
  const dated = (id: string, at: number, type = 'medication') => ({
    identifier: id,
    content: { data: { type } },
    trigger: { type: 'date', value: at },
  });

  it('does nothing while under the limit', async () => {
    mockGetAll.mockResolvedValue([dated('a', 1), dated('b', 2)]);

    await trimToBudget();

    expect(mockCancel).not.toHaveBeenCalled();
  });

  it('drops the follow-ups furthest ahead first when over the limit', async () => {
    const many = Array.from({ length: 60 }, (_, i) => dated(`d${i}`, 1000 + i));
    mockGetAll.mockResolvedValue([
      ...many,
      dated('nudge-far', 9000, 'medication_nudge'),
      dated('nudge-near', 2000, 'medication_nudge'),
    ]);

    await trimToBudget();

    expect(mockCancel.mock.calls.map((c) => c[0]).sort()).toEqual(['nudge-far', 'nudge-near']);
  });
});
