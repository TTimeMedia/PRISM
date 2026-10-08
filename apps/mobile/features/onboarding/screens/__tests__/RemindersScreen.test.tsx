import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { RemindersScreen } from '../RemindersScreen';
import { useUpdateProfile } from '../../../../lib/profile/queries';
import { requestNotificationPermissions } from '../../../../lib/reminders/notificationScheduler';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
}));

jest.mock('../../../../lib/profile/queries', () => ({
  useUpdateProfile: jest.fn(),
}));

jest.mock('../../../../lib/reminders/notificationScheduler', () => ({
  requestNotificationPermissions: jest.fn(),
}));

const mockedUseUpdateProfile = useUpdateProfile as jest.MockedFunction<typeof useUpdateProfile>;
const mockedRequest = requestNotificationPermissions as jest.MockedFunction<
  typeof requestNotificationPermissions
>;

describe('RemindersScreen', () => {
  const updateProfileMutateAsync = jest.fn().mockResolvedValue({});

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseUpdateProfile.mockReturnValue({ mutateAsync: updateProfileMutateAsync } as never);
  });

  it('is where notifications get turned on, and says what Prism uses them for', () => {
    renderWithProviders(<RemindersScreen />);

    expect(screen.getByText('Turn on notifications.')).toBeTruthy();
    expect(screen.getByText(/Dose and shot reminders/)).toBeTruthy();
    expect(screen.getByText(/before each appointment/)).toBeTruthy();
    expect(screen.getByText(/supply runs out/)).toBeTruthy();
  });

  it('asks the phone for permission and moves on once it is granted', async () => {
    mockedRequest.mockResolvedValue(true);
    renderWithProviders(<RemindersScreen />);

    fireEvent.press(screen.getByText('Turn on notifications'));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/(onboarding)/building'));
    expect(mockedRequest).toHaveBeenCalled();
  });

  it('explains how to turn them on later when permission is declined, without blocking setup', async () => {
    mockedRequest.mockResolvedValue(false);
    renderWithProviders(<RemindersScreen />);

    fireEvent.press(screen.getByText('Turn on notifications'));

    await waitFor(() => expect(screen.getByText(/Notifications are off for now/)).toBeTruthy());
    expect(router.replace).not.toHaveBeenCalled();
    fireEvent.press(screen.getByText('Continue'));
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/(onboarding)/building'));
  });
});
