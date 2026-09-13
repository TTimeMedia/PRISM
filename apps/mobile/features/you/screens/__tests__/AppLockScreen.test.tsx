import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { AppLockScreen } from '../AppLockScreen';
import { isBiometricAvailable } from '../../../../lib/you/biometrics';
import { verifyPin } from '../../../../lib/you/pinStorage';

jest.mock('../../../../lib/you/biometrics', () => ({
  isBiometricAvailable: jest.fn(),
  authenticateWithBiometrics: jest.fn(),
}));

jest.mock('../../../../lib/you/pinStorage', () => ({
  verifyPin: jest.fn(),
}));

const mockedIsBiometricAvailable = isBiometricAvailable as jest.MockedFunction<
  typeof isBiometricAvailable
>;
const mockedVerifyPin = verifyPin as jest.MockedFunction<typeof verifyPin>;

/**
 * Regression coverage for the keyboard-obstruction fix on the App Lock
 * Screen — the one screen where getting stuck behind the keyboard would
 * be a full lockout, not just an inconvenience (see this screen's own
 * header and docs/BUILD_STATUS.md). `keyboardType="number-pad"` has no
 * built-in return/dismiss key on iOS, so `onSubmitEditing` must still
 * work wherever a platform IME does surface one (e.g. Android).
 */
describe('AppLockScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedIsBiometricAvailable.mockResolvedValue(false);
  });

  it('unlocks when the correct PIN is submitted via the keyboard submit action', async () => {
    mockedVerifyPin.mockResolvedValue(true);
    const onUnlock = jest.fn();
    renderWithProviders(<AppLockScreen biometricEnabled={false} onUnlock={onUnlock} />);

    fireEvent.changeText(screen.getByLabelText('PIN'), '1234');
    fireEvent(screen.getByLabelText('PIN'), 'submitEditing');

    await waitFor(() => expect(mockedVerifyPin).toHaveBeenCalledWith('1234'));
    await waitFor(() => expect(onUnlock).toHaveBeenCalledTimes(1));
  });

  it('shows an error and never unlocks for an incorrect PIN', async () => {
    mockedVerifyPin.mockResolvedValue(false);
    const onUnlock = jest.fn();
    renderWithProviders(<AppLockScreen biometricEnabled={false} onUnlock={onUnlock} />);

    fireEvent.changeText(screen.getByLabelText('PIN'), '0000');
    fireEvent.press(screen.getByText('Unlock'));

    expect(await screen.findByText('Incorrect PIN.')).toBeTruthy();
    expect(onUnlock).not.toHaveBeenCalled();
  });

  it('the Unlock button stays reachable — pressing it submits the entered PIN', async () => {
    mockedVerifyPin.mockResolvedValue(true);
    const onUnlock = jest.fn();
    renderWithProviders(<AppLockScreen biometricEnabled={false} onUnlock={onUnlock} />);

    fireEvent.changeText(screen.getByLabelText('PIN'), '1234');
    fireEvent.press(screen.getByText('Unlock'));

    await waitFor(() => expect(onUnlock).toHaveBeenCalledTimes(1));
  });
});
