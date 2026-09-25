import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';
import { TopBar } from '../TopBar';
import { useModules, useProfile } from '../../../lib/profile/queries';
import { useReminderAttention } from '../../../lib/reminders/useReminderAttention';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
}));

jest.mock('../../../lib/profile/queries', () => ({
  useModules: jest.fn(),
  useProfile: jest.fn(),
}));

jest.mock('../../../lib/reminders/useReminderAttention', () => ({
  useReminderAttention: jest.fn(),
}));

const mockedUseModules = useModules as jest.MockedFunction<typeof useModules>;
const mockedUseProfile = useProfile as jest.MockedFunction<typeof useProfile>;
const mockedAttention = useReminderAttention as jest.MockedFunction<typeof useReminderAttention>;

const modules = (off: string[] = []) =>
  ['medications', 'injections', 'appointments', 'milestones', 'journal'].map((module_key) => ({
    module_key,
    enabled: !off.includes(module_key),
  }));

describe('TopBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseModules.mockReturnValue({ data: modules(['injections']) } as never);
    mockedUseProfile.mockReturnValue({ data: { display_name: 'Dominic Perignon' } } as never);
    mockedAttention.mockReturnValue(false);
  });

  it('names the screen and offers the menu, reminders, and what shows', () => {
    renderWithProviders(<TopBar title="Care" />);

    expect(screen.getByText('Care')).toBeTruthy();
    expect(screen.getByLabelText('Open menu')).toBeTruthy();
    expect(screen.getByLabelText('Reminders')).toBeTruthy();
    expect(screen.getByLabelText('Choose what shows')).toBeTruthy();
  });

  it('opens reminders and the switches from the bar', () => {
    renderWithProviders(<TopBar title="Care" />);

    fireEvent.press(screen.getByLabelText('Reminders'));
    expect(router.push).toHaveBeenCalledWith('/you/notifications');
    fireEvent.press(screen.getByLabelText('Choose what shows'));
    expect(router.push).toHaveBeenCalledWith('/you/customize');
  });

  it('shows no dot on the bell when reminders are fine', () => {
    renderWithProviders(<TopBar title="Today" />);

    expect(screen.queryByTestId('reminder-dot')).toBeNull();
  });

  it('shows a dot on the bell when reminders need a look', () => {
    mockedAttention.mockReturnValue(true);

    renderWithProviders(<TopBar title="Today" />);

    expect(screen.getByTestId('reminder-dot')).toBeTruthy();
    expect(screen.getByLabelText('Reminders, needs attention')).toBeTruthy();
  });

  it('opens a menu with the features that are on, setup, help, and the profile', () => {
    renderWithProviders(<TopBar title="Today" />);

    fireEvent.press(screen.getByLabelText('Open menu'));

    expect(screen.getByText('Your Prism')).toBeTruthy();
    expect(screen.getByLabelText('Medications')).toBeTruthy();
    expect(screen.getByLabelText('Journal')).toBeTruthy();
    // Injections is off, so it is not listed.
    expect(screen.queryByLabelText('Injections')).toBeNull();
    // The bell and the menu entry both lead to Reminders.
    expect(screen.getAllByLabelText('Reminders')).toHaveLength(2);
    expect(screen.getByLabelText('How Prism works')).toBeTruthy();
    expect(screen.getByLabelText('Your profile, Dominic Perignon')).toBeTruthy();
    expect(screen.getByText('DP')).toBeTruthy();
  });

  it('goes to a menu item and closes the menu', () => {
    renderWithProviders(<TopBar title="Today" />);

    fireEvent.press(screen.getByLabelText('Open menu'));
    fireEvent.press(screen.getByLabelText('Privacy'));

    expect(router.push).toHaveBeenCalledWith('/you/privacy');
    expect(screen.queryByText('Your Prism')).toBeNull();
  });
});
