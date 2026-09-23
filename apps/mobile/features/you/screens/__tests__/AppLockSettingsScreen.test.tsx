import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import type { Settings } from '@prism/types';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { AppLockSettingsScreen } from '../AppLockSettingsScreen';
import { useSettings, useUpdateSettings } from '../../../../lib/profile/queries';
import { hasPin, setPin } from '../../../../lib/you/pinStorage';
import { isBiometricAvailable } from '../../../../lib/you/biometrics';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
}));

jest.mock('../../../../lib/profile/queries', () => ({
  useSettings: jest.fn(),
  useUpdateSettings: jest.fn(),
}));

jest.mock('../../../../lib/you/pinStorage', () => ({
  hasPin: jest.fn(),
  setPin: jest.fn(),
}));

jest.mock('../../../../lib/you/biometrics', () => ({
  isBiometricAvailable: jest.fn(),
}));

const mockedUseSettings = useSettings as jest.MockedFunction<typeof useSettings>;
const mockedUseUpdateSettings = useUpdateSettings as jest.MockedFunction<typeof useUpdateSettings>;
const mockedHasPin = hasPin as jest.MockedFunction<typeof hasPin>;
const mockedSetPin = setPin as jest.MockedFunction<typeof setPin>;
const mockedIsBiometricAvailable = isBiometricAvailable as jest.MockedFunction<
  typeof isBiometricAvailable
>;

function settings(overrides: Partial<Settings> = {}): Settings {
  return {
    user_id: 'u1',
    theme: 'system',
    app_lock_enabled: false,
    biometric_lock: false,
    notification_privacy: true,
    reduced_motion: false,
    calendar_sync_enabled: false,
    accessibility_preferences: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

/**
 * Regression coverage for the PRISMPinInput swap (dots, not a visible
 * digit field) on the one screen that creates the PIN App Lock later
 * enforces — see AppLockScreen.test.tsx for the enforcement side.
 */
describe('AppLockSettingsScreen', () => {
  const mutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseUpdateSettings.mockReturnValue({ mutate } as never);
    mockedIsBiometricAvailable.mockResolvedValue(false);
  });

  it('opens the "Set a PIN" sheet when enabling App Lock with no PIN yet', async () => {
    mockedUseSettings.mockReturnValue({
      data: settings(),
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as never);
    mockedHasPin.mockResolvedValue(false);

    renderWithProviders(<AppLockSettingsScreen />);
    fireEvent(screen.getByLabelText('Enable App Lock'), 'valueChange', true);

    expect(await screen.findByText('Set a PIN')).toBeTruthy();
    // The PIN fields are dots, not visible digit inputs.
    expect(screen.getByLabelText('New PIN')).toBeTruthy();
    expect(screen.getByLabelText('Confirm PIN')).toBeTruthy();
  });

  it('saves a matching PIN and enables App Lock', async () => {
    mockedUseSettings.mockReturnValue({
      data: settings(),
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as never);
    mockedHasPin.mockResolvedValue(false);
    mockedSetPin.mockResolvedValue(undefined);

    renderWithProviders(<AppLockSettingsScreen />);
    fireEvent(screen.getByLabelText('Enable App Lock'), 'valueChange', true);
    await screen.findByText('Set a PIN');

    fireEvent.changeText(screen.getByLabelText('New PIN'), '1234');
    fireEvent.changeText(screen.getByLabelText('Confirm PIN'), '1234');
    fireEvent.press(screen.getByText('Save'));

    await waitFor(() => expect(mockedSetPin).toHaveBeenCalledWith('1234'));
    await waitFor(() => expect(mutate).toHaveBeenCalledWith({ app_lock_enabled: true }));
  });

  it("shows an error and never saves when the PINs don't match", async () => {
    mockedUseSettings.mockReturnValue({
      data: settings(),
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as never);
    mockedHasPin.mockResolvedValue(false);

    renderWithProviders(<AppLockSettingsScreen />);
    fireEvent(screen.getByLabelText('Enable App Lock'), 'valueChange', true);
    await screen.findByText('Set a PIN');

    fireEvent.changeText(screen.getByLabelText('New PIN'), '1234');
    fireEvent.changeText(screen.getByLabelText('Confirm PIN'), '4321');
    fireEvent.press(screen.getByText('Save'));

    expect(await screen.findByText("PINs don't match.")).toBeTruthy();
    expect(mockedSetPin).not.toHaveBeenCalled();
  });

  it('only accepts digits, silently — the PIN field strips anything else', async () => {
    mockedUseSettings.mockReturnValue({
      data: settings(),
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as never);
    mockedHasPin.mockResolvedValue(false);
    mockedSetPin.mockResolvedValue(undefined);

    renderWithProviders(<AppLockSettingsScreen />);
    fireEvent(screen.getByLabelText('Enable App Lock'), 'valueChange', true);
    await screen.findByText('Set a PIN');

    fireEvent.changeText(screen.getByLabelText('New PIN'), '12a3b4');
    fireEvent.changeText(screen.getByLabelText('Confirm PIN'), '1234');
    fireEvent.press(screen.getByText('Save'));

    await waitFor(() => expect(mockedSetPin).toHaveBeenCalledWith('1234'));
  });
});
