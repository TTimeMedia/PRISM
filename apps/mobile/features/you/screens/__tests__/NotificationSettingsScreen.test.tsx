import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { NotificationSettingsScreen } from '../NotificationSettingsScreen';
import { useSettings, useUpdateSettings } from '../../../../lib/profile/queries';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
}));

jest.mock('../../../../lib/profile/queries', () => ({
  useModules: jest.fn(() => ({ data: [] })),
  useSettings: jest.fn(),
  useUpdateSettings: jest.fn(),
}));

jest.mock('../../../../lib/care/queries', () => ({
  useMedications: jest.fn(() => ({ data: [] })),
  useAppointments: jest.fn(() => ({ data: [] })),
}));

jest.mock('../../../../lib/reminders/notificationScheduler', () => ({
  getNotificationPermissionStatus: jest.fn().mockResolvedValue('granted'),
  requestNotificationPermissions: jest.fn().mockResolvedValue(true),
  scheduleTestReminder: jest.fn(),
}));

jest.mock('expo-constants', () => ({ __esModule: true, default: { expoConfig: {} } }));
jest.mock('expo-notifications', () => ({}));

jest.mock('../../../../lib/supabase/client', () => ({ supabase: {} }));

const mockedUseSettings = useSettings as jest.MockedFunction<typeof useSettings>;
const mockedUseUpdateSettings = useUpdateSettings as jest.MockedFunction<typeof useUpdateSettings>;
const mutate = jest.fn();

describe('NotificationSettingsScreen server push', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseSettings.mockReturnValue({
      data: {
        notification_privacy: true,
        push_preferences: { security: true, updates: false, nudges: false, reminders: false },
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as never);
    mockedUseUpdateSettings.mockReturnValue({ mutate } as never);
  });

  it('shows what is on by default: security only', async () => {
    renderWithProviders(<NotificationSettingsScreen />);
    await waitFor(() => expect(screen.getByText('Messages from Prism')).toBeTruthy());

    expect(screen.getByText('Messages from Prism')).toBeTruthy();
    expect(screen.getByLabelText('Account and security').props.value).toBe(true);
    expect(screen.getByLabelText('Prism news').props.value).toBe(false);
    expect(screen.getByLabelText('Gentle check-ins').props.value).toBe(false);
  });

  it('saves a change and keeps the other choices', async () => {
    renderWithProviders(<NotificationSettingsScreen />);
    await waitFor(() => expect(screen.getByText('Messages from Prism')).toBeTruthy());

    fireEvent(screen.getByLabelText('Prism news'), 'valueChange', true);

    expect(mutate).toHaveBeenCalledWith({
      push_preferences: { security: true, updates: true, nudges: false, reminders: false },
    });
  });

  it('fills in defaults when nothing has been saved yet', async () => {
    mockedUseSettings.mockReturnValue({
      data: { notification_privacy: true, push_preferences: null },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as never);

    renderWithProviders(<NotificationSettingsScreen />);
    await waitFor(() => expect(screen.getByText('Messages from Prism')).toBeTruthy());

    expect(screen.getByLabelText('Account and security').props.value).toBe(true);
    expect(screen.getByLabelText('Prism news').props.value).toBe(false);
  });
});
