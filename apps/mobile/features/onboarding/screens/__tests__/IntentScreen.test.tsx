import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { IntentScreen } from '../IntentScreen';
import { useUpdateProfile } from '../../../../lib/profile/queries';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
}));

jest.mock('../../../../lib/profile/queries', () => ({
  useUpdateProfile: jest.fn(),
}));

const mockedUseUpdateProfile = useUpdateProfile as jest.MockedFunction<typeof useUpdateProfile>;

describe('IntentScreen', () => {
  const mutateAsync = jest.fn().mockResolvedValue({});

  beforeEach(() => {
    jest.clearAllMocks();
    mutateAsync.mockClear();
    mockedUseUpdateProfile.mockReturnValue({ mutateAsync } as never);
  });

  it('persists selected intent options and advances to Journey Stage', async () => {
    renderWithProviders(<IntentScreen />);

    fireEvent.press(screen.getByText('Journaling'));
    fireEvent.press(screen.getByText('Keeping up with appointments'));
    fireEvent.press(screen.getByText('Continue'));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        intent: ['journaling', 'appointments'],
        onboarding_step: 'journey_stage',
      }),
    );
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/(onboarding)/journey-stage'));
  });

  it('is fully skippable — every onboarding step is optional', async () => {
    renderWithProviders(<IntentScreen />);

    fireEvent.press(screen.getByText('Skip'));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({ intent: [], onboarding_step: 'journey_stage' }),
    );
  });

  it('toggling the same option twice deselects it', async () => {
    renderWithProviders(<IntentScreen />);

    fireEvent.press(screen.getByText('Journaling'));
    fireEvent.press(screen.getByText('Journaling'));
    fireEvent.press(screen.getByText('Continue'));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({ intent: [], onboarding_step: 'journey_stage' }),
    );
  });
});
