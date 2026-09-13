import * as LocalAuthentication from 'expo-local-authentication';

/** Face ID, Touch ID, or Android biometrics — whichever the device actually has enrolled. */
export async function isBiometricAvailable(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) return false;
  return LocalAuthentication.isEnrolledAsync();
}

/**
 * Prompts the OS biometric UI. `disableDeviceFallback` is intentional —
 * PRISM's own PIN (Screen 60/78) is the fallback, not the device's OS
 * passcode, since App Lock is a distinct, PRISM-specific privacy
 * boundary from unlocking the phone itself.
 */
export async function authenticateWithBiometrics(): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Unlock PRISM',
    disableDeviceFallback: true,
    cancelLabel: 'Use PIN instead',
  });
  return result.success;
}
