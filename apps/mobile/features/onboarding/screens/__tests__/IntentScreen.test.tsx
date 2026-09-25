import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { IntentScreen } from '../IntentScreen';
import { useSetModuleEnabled, useUpdateProfile } from '../../../../lib/profile/queries';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
}));

jest.mock('../../../../lib/profile/queries', () => ({
  useUpdateProfile: jest.fn(),
  useSetModuleEnabled: jest.fn(),
}));

const mockedUseUpdateProfile = useUpdateProfile as jest.MockedFunction<typeof useUpdateProfile>;
const mockedUseSetModuleEnabled = useSetModuleEnabled as jest.MockedFunction<
  typeof useSetModuleEnabled
>;
const setModuleEnabled = jest.fn().mockResolvedValue({});

describe('IntentScreen', () => {
  const mutateAsync = jest.fn().mockResolvedValue({});

  beforeEach(() => {
    jest.clearAllMocks();
    mutateAsync.mockClear();
    mockedUseUpdateProfile.mockReturnValue({ mutateAsync } as never);
    setModuleEnabled.mockClear();
    mockedUseSetModuleEnabled.mockReturnValue({ mutateAsync: setModuleEnabled } as never);
  });

  it('persists selected intent options and advances to Journey Stage', async () => {
    renderWithProviders(<IntentScreen />);

    fireEvent.press(screen.getByText('Journaling'));
    fireEvent.press(screen.getByText('Appointments'));
    fireEvent.press(screen.getByText('Continue'));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        intent: ['journaling', 'appointments'],
        onboarding_step: 'identity',
      }),
    );
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/(onboarding)/identity'));
  });

  it('is fully skippable — every onboarding step is optional', async () => {
    renderWithProviders(<IntentScreen />);

    fireEvent.press(screen.getByText('Skip'));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({ intent: [], onboarding_step: 'identity' }),
    );
  });

  it('toggling the same option twice deselects it', async () => {
    renderWithProviders(<IntentScreen />);

    fireEvent.press(screen.getByText('Journaling'));
    fireEvent.press(screen.getByText('Journaling'));
    fireEvent.press(screen.getByText('Continue'));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({ intent: [], onboarding_step: 'identity' }),
    );
  });

  it('turns on the features that were picked, and only those', async () => {
    renderWithProviders(<IntentScreen />);

    fireEvent.press(screen.getByText('Journaling'));
    fireEvent.press(screen.getByText('Appointments'));
    fireEvent.press(screen.getByText('Continue'));

    await waitFor(() => expect(setModuleEnabled).toHaveBeenCalledTimes(2));
    expect(setModuleEnabled).toHaveBeenCalledWith({ moduleKey: 'appointments', enabled: true });
    expect(setModuleEnabled).toHaveBeenCalledWith({ moduleKey: 'journal', enabled: true });
  });

  it('turns the broadly useful features on when nothing specific was chosen, never Injections', async () => {
    renderWithProviders(<IntentScreen />);

    fireEvent.press(screen.getByText('Skip'));

    await waitFor(() => expect(setModuleEnabled).toHaveBeenCalledTimes(4));
    expect(setModuleEnabled).not.toHaveBeenCalledWith(
      expect.objectContaining({ moduleKey: 'injections' }),
    );
  });
});
