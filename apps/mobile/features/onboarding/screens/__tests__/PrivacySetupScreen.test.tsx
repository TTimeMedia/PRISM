import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { PrivacySetupScreen } from '../PrivacySetupScreen';
import { useUpdateProfile, useUpdateSettings } from '../../../../lib/profile/queries';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
}));

jest.mock('../../../../lib/profile/queries', () => ({
  useUpdateSettings: jest.fn(),
  useUpdateProfile: jest.fn(),
}));

const mockedUseUpdateSettings = useUpdateSettings as jest.MockedFunction<typeof useUpdateSettings>;
const mockedUseUpdateProfile = useUpdateProfile as jest.MockedFunction<typeof useUpdateProfile>;

/**
 * Regression coverage for the App Lock lockout bug: an earlier version
 * of this screen let onboarding submit `app_lock_enabled: true` with no
 * PIN ever collected, which permanently locked users out on next launch
 * (AppLockScreen has no recovery path — see AppLockScreen.tsx). App Lock
 * must only ever be enabled from YOU → App Lock, where PIN creation is
 * enforced first (see AppLockSettingsScreen.test — none exists yet, but
 * its own `toggleAppLock` already guards this). This suite locks in that
 * onboarding can never again touch `app_lock_enabled`/`biometric_lock` at all.
 */
describe('PrivacySetupScreen', () => {
  const updateSettingsMutateAsync = jest.fn().mockResolvedValue({});
  const updateProfileMutateAsync = jest.fn().mockResolvedValue({});

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseUpdateSettings.mockReturnValue({
      mutateAsync: updateSettingsMutateAsync,
    } as never);
    mockedUseUpdateProfile.mockReturnValue({
      mutateAsync: updateProfileMutateAsync,
    } as never);
  });

  it('never offers an App Lock or Biometrics toggle — enabling App Lock without a PIN is what caused the lockout', () => {
    renderWithProviders(<PrivacySetupScreen />);

    expect(screen.queryByText('App Lock')).toBeNull();
    expect(screen.queryByText('Biometrics')).toBeNull();
  });

  it('submits settings without app_lock_enabled or biometric_lock — onboarding can never set either field', async () => {
    renderWithProviders(<PrivacySetupScreen />);

    fireEvent.press(screen.getByText('Continue'));

    await waitFor(() =>
      expect(updateSettingsMutateAsync).toHaveBeenCalledWith({ notification_privacy: true }),
    );
    const [settingsPayload] = updateSettingsMutateAsync.mock.calls[0];
    expect(settingsPayload).not.toHaveProperty('app_lock_enabled');
    expect(settingsPayload).not.toHaveProperty('biometric_lock');
  });

  it('advances to the next onboarding step after submitting', async () => {
    renderWithProviders(<PrivacySetupScreen />);

    fireEvent.press(screen.getByText('Continue'));

    await waitFor(() =>
      expect(updateProfileMutateAsync).toHaveBeenCalledWith({ onboarding_step: 'building' }),
    );
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/(onboarding)/building'));
  });

  it('toggling private notifications off is reflected in the submitted settings', async () => {
    renderWithProviders(<PrivacySetupScreen />);

    fireEvent(screen.getByLabelText('Private notifications'), 'valueChange', false);
    fireEvent.press(screen.getByText('Continue'));

    await waitFor(() =>
      expect(updateSettingsMutateAsync).toHaveBeenCalledWith({ notification_privacy: false }),
    );
  });
});
