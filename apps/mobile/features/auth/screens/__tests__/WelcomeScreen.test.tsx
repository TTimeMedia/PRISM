import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { WelcomeScreen } from '../WelcomeScreen';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
}));

describe('WelcomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the approved welcome copy', () => {
    renderWithProviders(<WelcomeScreen />);
    expect(screen.getByText("A private place that's just yours.")).toBeTruthy();
    expect(
      screen.getByText(
        'Keep your care, your milestones, and your journal together in one private place. Your information stays yours.',
      ),
    ).toBeTruthy();
  });

  it('"Get started" navigates to Sign Up', () => {
    renderWithProviders(<WelcomeScreen />);
    fireEvent.press(screen.getByText('Get started'));
    expect(router.push).toHaveBeenCalledWith('/(auth)/sign-up');
  });

  it('"I already have an account" navigates to Sign In', () => {
    renderWithProviders(<WelcomeScreen />);
    fireEvent.press(screen.getByText('I already have an account'));
    expect(router.push).toHaveBeenCalledWith('/(auth)/sign-in');
  });
});
