import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { PhilosophyScreen } from '../PhilosophyScreen';
import { useUpdateProfile } from '../../../../lib/profile/queries';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
}));

jest.mock('../../../../lib/profile/queries', () => ({
  useUpdateProfile: jest.fn(),
}));

const mockedUseUpdateProfile = useUpdateProfile as jest.MockedFunction<typeof useUpdateProfile>;

describe('PhilosophyScreen', () => {
  const mutateAsync = jest.fn().mockResolvedValue({});

  beforeEach(() => {
    jest.clearAllMocks();
    mutateAsync.mockClear();
    mockedUseUpdateProfile.mockReturnValue({ mutateAsync } as never);
  });

  it('renders the intro copy', () => {
    renderWithProviders(<PhilosophyScreen />);
    expect(screen.getByText("Set it up your way.")).toBeTruthy();
    expect(screen.getByText('Prism fits around you.')).toBeTruthy();
  });

  it('persists onboarding_step and advances to Intent on Continue', async () => {
    renderWithProviders(<PhilosophyScreen />);
    fireEvent.press(screen.getByText('Continue'));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({ onboarding_step: 'intent' }));
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/(onboarding)/intent'));
  });
});
