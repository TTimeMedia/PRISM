import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { ReminderMessagesScreen } from '../ReminderMessagesScreen';
import { useModules, useSettings, useUpdateSettings } from '../../../../lib/profile/queries';
import { useAppointments, useMedications } from '../../../../lib/care/queries';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
}));

jest.mock('../../../../lib/profile/queries', () => ({
  useModules: jest.fn(),
  useSettings: jest.fn(),
  useUpdateSettings: jest.fn(),
}));

jest.mock('../../../../lib/care/queries', () => ({
  useMedications: jest.fn(),
  useAppointments: jest.fn(),
}));

const mockedUseSettings = useSettings as jest.MockedFunction<typeof useSettings>;
const mockedUseModules = useModules as jest.MockedFunction<typeof useModules>;
const mockedUseMedications = useMedications as jest.MockedFunction<typeof useMedications>;
const mockedUseAppointments = useAppointments as jest.MockedFunction<typeof useAppointments>;
const mockedUseUpdateSettings = useUpdateSettings as jest.MockedFunction<typeof useUpdateSettings>;
const mutate = jest.fn();

const settings = (overrides: Record<string, unknown> = {}) =>
  mockedUseSettings.mockReturnValue({
    data: { notification_privacy: false, reminder_messages: {}, ...overrides },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  } as never);

describe('ReminderMessagesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    settings();
    mockedUseUpdateSettings.mockReturnValue({ mutate } as never);
    mockedUseModules.mockReturnValue({
      data: ['medications', 'appointments'].map((module_key) => ({ module_key, enabled: true })),
    } as never);
    mockedUseMedications.mockReturnValue({ data: [] } as never);
    mockedUseAppointments.mockReturnValue({ data: [] } as never);
  });

  it('shows each built-in version as it will read, with the first one chosen', () => {
    renderWithProviders(<ReminderMessagesScreen />);

    expect(screen.getByLabelText("It's shot day.").props.accessibilityState.selected).toBe(true);
    expect(screen.getByLabelText('Take your Vitamin D at 9:00 AM.')).toBeTruthy();
    expect(screen.getByLabelText('Heads up: Check-up is coming up in 1 hour.')).toBeTruthy();
  });

  it('saves a different built-in version', () => {
    renderWithProviders(<ReminderMessagesScreen />);

    fireEvent.press(screen.getByLabelText('Shot day: B12 at 8:00 PM.'));

    expect(mutate).toHaveBeenCalledWith({
      reminder_messages: {
        medication: undefined,
        injection: { selected: 'shot-day-name', custom: [] },
      },
    });
  });

  it('lets people write their own, with a preview, and uses it', () => {
    renderWithProviders(<ReminderMessagesScreen />);

    fireEvent.changeText(
      screen.getAllByLabelText('Write your own')[1],
      'Shot day. Be kind to yourself.',
    );
    fireEvent.press(screen.getAllByText('Add this wording')[1]);

    const saved = mutate.mock.calls[0][0].reminder_messages.injection;
    expect(saved.custom).toHaveLength(1);
    expect(saved.custom[0].text).toBe('Shot day. Be kind to yourself.');
    expect(saved.selected).toBe(saved.custom[0].id);
  });

  it('adds a placeholder when its chip is tapped and shows what it will look like', () => {
    renderWithProviders(<ReminderMessagesScreen />);

    fireEvent.changeText(screen.getAllByLabelText('Write your own')[0], 'Meds:');
    fireEvent.press(screen.getAllByLabelText('Add Name')[0]);

    expect(screen.getByText('Looks like: Meds: Vitamin D')).toBeTruthy();
  });

  it('shows their own wording, and lets them delete it', () => {
    settings({
      reminder_messages: {
        appointment: {
          selected: 'mine',
          custom: [{ id: 'mine', text: 'See you at {time}, {name}' }],
        },
      },
    });
    renderWithProviders(<ReminderMessagesScreen />);

    expect(
      screen.getByLabelText('See you at 10:00 AM, Check-up').props.accessibilityState.selected,
    ).toBe(true);
    fireEvent.press(screen.getByLabelText('Delete "See you at 10:00 AM, Check-up"'));

    expect(mutate).toHaveBeenCalledWith({
      reminder_messages: expect.objectContaining({
        appointment: { selected: undefined, custom: [] },
      }),
    });
  });

  it('previews on the medications a person actually has, and only shows the kinds they use', () => {
    mockedUseMedications.mockReturnValue({
      data: [
        {
          id: 'm1',
          name: 'Testosterone cypionate',
          form: 'injection',
          dosage_text: '0.5 ml',
          frequency_config: { time_of_day: '20:00' },
          reminder_enabled: true,
        },
        {
          id: 'm2',
          name: 'Vitamin D',
          form: 'pill',
          frequency_config: null,
          reminder_enabled: false,
        },
      ],
    } as never);
    renderWithProviders(<ReminderMessagesScreen />);

    expect(screen.getByLabelText('Shot day: Testosterone cypionate at 8:00 PM.')).toBeTruthy();
    expect(screen.getByText('Previewed on Testosterone cypionate.')).toBeTruthy();
    // Nothing they use is a plain medication or an appointment, so those are left out.
    expect(screen.queryByText('Medications')).toBeNull();
    expect(screen.queryByText('Appointments')).toBeNull();
    expect(screen.queryByLabelText(/Vitamin D/)).toBeNull();
  });

  it('says reminders stay generic while Private notifications is on', () => {
    settings({ notification_privacy: true });
    renderWithProviders(<ReminderMessagesScreen />);

    expect(screen.getByText(/Private notifications is on, so reminders stay generic/)).toBeTruthy();
  });
});
