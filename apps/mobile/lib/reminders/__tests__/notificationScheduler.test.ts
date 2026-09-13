import type { Appointment, Medication } from '@prism/types';
import {
  cancelRemindersFor,
  cancelScheduledNotifications,
  configureNotificationHandler,
  requestNotificationPermissions,
  scheduleAppointmentReminder,
  scheduleMedicationReminders,
} from '../notificationScheduler';
import { resolveMedicationOccurrences } from '../scheduleResolution';

const SchedulableTriggerInputTypes = {
  CALENDAR: 'calendar',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  DATE: 'date',
  TIME_INTERVAL: 'timeInterval',
};

const mockSetNotificationHandler = jest.fn();
const mockGetPermissionsAsync = jest.fn();
const mockRequestPermissionsAsync = jest.fn();
const mockScheduleNotificationAsync = jest.fn();
const mockCancelScheduledNotificationAsync = jest.fn();
const mockGetAllScheduledNotificationsAsync = jest.fn();

jest.mock('expo-notifications', () => ({
  SchedulableTriggerInputTypes,
  setNotificationHandler: (...args: unknown[]) => mockSetNotificationHandler(...args),
  getPermissionsAsync: (...args: unknown[]) => mockGetPermissionsAsync(...args),
  requestPermissionsAsync: (...args: unknown[]) => mockRequestPermissionsAsync(...args),
  scheduleNotificationAsync: (...args: unknown[]) => mockScheduleNotificationAsync(...args),
  cancelScheduledNotificationAsync: (...args: unknown[]) =>
    mockCancelScheduledNotificationAsync(...args),
  getAllScheduledNotificationsAsync: (...args: unknown[]) =>
    mockGetAllScheduledNotificationsAsync(...args),
}));

function medication(overrides: Partial<Medication> = {}): Medication {
  return {
    id: 'm1',
    user_id: 'u1',
    name: 'Testosterone',
    form: 'injection',
    dosage_text: '50mg',
    frequency_type: null,
    frequency_config: null,
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
    title: 'Endocrinology follow-up',
    provider: 'Dr. Rivera',
    category: null,
    starts_at: '2099-06-20T14:00:00Z',
    ends_at: null,
    location: null,
    notes: null,
    reminder_enabled: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockScheduleNotificationAsync.mockImplementation(() => Promise.resolve('generated-id'));
});

describe('configureNotificationHandler', () => {
  it('registers a handler that shows the notification and plays sound, without a badge', async () => {
    configureNotificationHandler();
    expect(mockSetNotificationHandler).toHaveBeenCalledTimes(1);
    const { handleNotification } = mockSetNotificationHandler.mock.calls[0][0];
    await expect(handleNotification()).resolves.toEqual({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    });
  });
});

describe('requestNotificationPermissions', () => {
  it('returns true without prompting when already granted', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ granted: true });
    expect(await requestNotificationPermissions()).toBe(true);
    expect(mockRequestPermissionsAsync).not.toHaveBeenCalled();
  });

  it('prompts and returns the result when not yet granted', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ granted: false });
    mockRequestPermissionsAsync.mockResolvedValue({ granted: true });
    expect(await requestNotificationPermissions()).toBe(true);
    expect(mockRequestPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it('returns false when the user declines', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ granted: false });
    mockRequestPermissionsAsync.mockResolvedValue({ granted: false });
    expect(await requestNotificationPermissions()).toBe(false);
  });
});

describe('cancelScheduledNotifications', () => {
  it('cancels every identifier given', async () => {
    await cancelScheduledNotifications(['id-1', 'id-2']);
    expect(mockCancelScheduledNotificationAsync).toHaveBeenCalledWith('id-1');
    expect(mockCancelScheduledNotificationAsync).toHaveBeenCalledWith('id-2');
    expect(mockCancelScheduledNotificationAsync).toHaveBeenCalledTimes(2);
  });
});

describe('cancelRemindersFor', () => {
  it('cancels only the notifications matching the given type and reference id', async () => {
    mockGetAllScheduledNotificationsAsync.mockResolvedValue([
      { identifier: 'keep', content: { data: { type: 'medication', referenceId: 'other' } } },
      { identifier: 'drop-1', content: { data: { type: 'medication', referenceId: 'm1' } } },
      { identifier: 'drop-2', content: { data: { type: 'medication', referenceId: 'm1' } } },
      { identifier: 'keep-2', content: { data: { type: 'appointment', referenceId: 'm1' } } },
    ]);

    await cancelRemindersFor('medication', 'm1');

    expect(mockCancelScheduledNotificationAsync).toHaveBeenCalledWith('drop-1');
    expect(mockCancelScheduledNotificationAsync).toHaveBeenCalledWith('drop-2');
    expect(mockCancelScheduledNotificationAsync).toHaveBeenCalledTimes(2);
  });
});

describe('scheduleMedicationReminders', () => {
  it('schedules nothing when reminders are disabled', async () => {
    const result = await scheduleMedicationReminders(
      medication({ reminder_enabled: false, frequency_type: 'daily' }),
      false,
    );
    expect(result).toEqual([]);
    expect(mockScheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('schedules a single repeating DAILY trigger for a daily medication', async () => {
    const med = medication({
      frequency_type: 'daily',
      frequency_config: { time_of_day: '09:30' },
    });
    const result = await scheduleMedicationReminders(med, false);

    expect(result).toEqual(['generated-id']);
    expect(mockScheduleNotificationAsync).toHaveBeenCalledTimes(1);
    const call = mockScheduleNotificationAsync.mock.calls[0][0];
    expect(call.trigger).toEqual({ type: 'daily', hour: 9, minute: 30 });
    expect(call.content.data).toEqual({ type: 'medication', referenceId: 'm1' });
  });

  it('schedules a repeating WEEKLY trigger per selected day', async () => {
    const med = medication({
      frequency_type: 'weekly',
      frequency_config: { days_of_week: [1, 3], time_of_day: '08:00' },
    });
    const result = await scheduleMedicationReminders(med, false);

    expect(result).toEqual(['generated-id', 'generated-id']);
    expect(mockScheduleNotificationAsync).toHaveBeenCalledTimes(2);
    const triggers = mockScheduleNotificationAsync.mock.calls.map((call) => call[0].trigger);
    // PRISM's days_of_week is 0=Sunday; expo-notifications' WEEKLY trigger is 1=Sunday.
    expect(triggers).toEqual(
      expect.arrayContaining([
        { type: 'weekly', weekday: 2, hour: 8, minute: 0 },
        { type: 'weekly', weekday: 4, hour: 8, minute: 0 },
      ]),
    );
  });

  it('falls back to one DATE trigger per resolved occurrence for every_x_days', async () => {
    const med = medication({
      frequency_type: 'every_x_days',
      frequency_config: { interval_days: 5, time_of_day: '09:00' },
      start_date: '2026-01-01',
    });
    const expectedCount = resolveMedicationOccurrences(med).length;

    const result = await scheduleMedicationReminders(med, false);

    expect(result).toHaveLength(expectedCount);
    expect(mockScheduleNotificationAsync).toHaveBeenCalledTimes(expectedCount);
    for (const call of mockScheduleNotificationAsync.mock.calls) {
      expect(call[0].trigger.type).toBe('date');
    }
  });

  it('uses generic private content when notification privacy is on', async () => {
    const med = medication({
      name: 'Testosterone',
      dosage_text: '50mg',
      frequency_type: 'daily',
      frequency_config: { time_of_day: '09:00' },
    });
    await scheduleMedicationReminders(med, true);
    const content = mockScheduleNotificationAsync.mock.calls[0][0].content;
    expect(content.title).toBe('PRISM');
    expect(content.body).toBe('Your PRISM reminder is ready.');
  });

  it('uses the medication name and dosage as content when notification privacy is off', async () => {
    const med = medication({
      name: 'Testosterone',
      dosage_text: '50mg',
      frequency_type: 'daily',
      frequency_config: { time_of_day: '09:00' },
    });
    await scheduleMedicationReminders(med, false);
    const content = mockScheduleNotificationAsync.mock.calls[0][0].content;
    expect(content.title).toBe('Testosterone');
    expect(content.body).toBe('50mg');
  });
});

describe('scheduleAppointmentReminder', () => {
  it('schedules nothing when reminders are disabled', async () => {
    const result = await scheduleAppointmentReminder(
      appointment({ reminder_enabled: false }),
      false,
    );
    expect(result).toEqual([]);
    expect(mockScheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('schedules nothing once the appointment has passed', async () => {
    const result = await scheduleAppointmentReminder(
      appointment({ starts_at: '2020-01-01T00:00:00Z' }),
      false,
    );
    expect(result).toEqual([]);
    expect(mockScheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('schedules a single DATE trigger for a future appointment', async () => {
    const appt = appointment({ starts_at: '2099-06-20T14:00:00Z' });
    const result = await scheduleAppointmentReminder(appt, false);

    expect(result).toEqual(['generated-id']);
    const call = mockScheduleNotificationAsync.mock.calls[0][0];
    expect(call.trigger).toEqual({ type: 'date', date: new Date('2099-06-20T14:00:00Z') });
    expect(call.content.data).toEqual({ type: 'appointment', referenceId: 'a1' });
  });
});
