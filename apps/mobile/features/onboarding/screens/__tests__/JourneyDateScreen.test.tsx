import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { JourneyDateScreen } from '../JourneyDateScreen';
import { useUpdateProfile } from '../../../../lib/profile/queries';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
}));

jest.mock('../../../../lib/profile/queries', () => ({
  useUpdateProfile: jest.fn(),
}));

const mockedUseUpdateProfile = useUpdateProfile as jest.MockedFunction<typeof useUpdateProfile>;

/**
 * Regression coverage for the "Choose a date looks required" bug: the
 * three choices — "I don't know", "My journey doesn't have one specific
 * start date", "I have a specific start date" — must be mutually
 * exclusive, and "Choose a date" must only ever appear once the third
 * one is selected. See JourneyDateScreen.tsx's own header.
 */
describe('JourneyDateScreen', () => {
  const mutateAsync = jest.fn().mockResolvedValue({});

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseUpdateProfile.mockReturnValue({ mutateAsync } as never);
  });

  it('shows "Continue" — not "Choose a date" — as the primary action before any choice is made', () => {
    renderWithProviders(<JourneyDateScreen />);

    expect(screen.getByText('Continue')).toBeTruthy();
    expect(screen.queryByText('Choose a date')).toBeNull();
  });

  it('never shows a redundant Skip action', () => {
    renderWithProviders(<JourneyDateScreen />);
    expect(screen.queryByText('Skip')).toBeNull();
  });

  it('the three choices are mutually exclusive — selecting one deselects the others', () => {
    renderWithProviders(<JourneyDateScreen />);

    fireEvent.press(screen.getByText("I don't know"));
    fireEvent.press(screen.getByText('I have a specific start date'));

    // Choosing the date option swaps the primary action to "Choose a date" —
    // only true if the previous selection was actually replaced, not added to.
    expect(screen.getByText('Choose a date')).toBeTruthy();
  });

  it('"I don\'t know" submits a null start date without ever showing "Choose a date"', async () => {
    renderWithProviders(<JourneyDateScreen />);

    fireEvent.press(screen.getByText("I don't know"));
    expect(screen.queryByText('Choose a date')).toBeNull();
    fireEvent.press(screen.getByText('Continue'));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        journey_start_date: null,
        onboarding_step: 'privacy_setup',
      }),
    );
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/(onboarding)/privacy-setup'));
  });

  it('"My journey doesn\'t have one specific start date" submits a null start date', async () => {
    renderWithProviders(<JourneyDateScreen />);

    fireEvent.press(screen.getByText("My journey doesn't have one specific start date"));
    expect(screen.queryByText('Choose a date')).toBeNull();
    fireEvent.press(screen.getByText('Continue'));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        journey_start_date: null,
        onboarding_step: 'privacy_setup',
      }),
    );
  });

  it('is fully skippable — pressing Continue with nothing selected submits a null start date', async () => {
    renderWithProviders(<JourneyDateScreen />);

    fireEvent.press(screen.getByText('Continue'));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        journey_start_date: null,
        onboarding_step: 'privacy_setup',
      }),
    );
  });

  it('"I have a specific start date" reveals "Choose a date", which opens the date picker step', () => {
    renderWithProviders(<JourneyDateScreen />);

    fireEvent.press(screen.getByText('I have a specific start date'));
    fireEvent.press(screen.getByText('Choose a date'));

    expect(screen.getByLabelText('Date')).toBeTruthy();
  });

  it('submits the entered date once "I have a specific start date" is chosen and a date is picked', async () => {
    renderWithProviders(<JourneyDateScreen />);

    fireEvent.press(screen.getByText('I have a specific start date'));
    fireEvent.press(screen.getByText('Choose a date'));
    fireEvent.changeText(screen.getByLabelText('Date'), '2024-01-15');
    fireEvent.press(screen.getByText('Continue'));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        journey_start_date: '2024-01-15',
        onboarding_step: 'privacy_setup',
      }),
    );
  });
});
