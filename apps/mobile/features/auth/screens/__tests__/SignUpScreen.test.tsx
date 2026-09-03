import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { SignUpScreen } from '../SignUpScreen';
import { signUp } from '../../../../lib/auth/actions';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
}));

jest.mock('../../../../lib/auth/actions', () => ({
  signUp: jest.fn(),
}));

const mockedSignUp = signUp as jest.MockedFunction<typeof signUp>;

describe('SignUpScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows a validation error and never calls signUp when passwords do not match', async () => {
    renderWithProviders(<SignUpScreen />);

    fireEvent.changeText(screen.getByLabelText('Email'), 'user@example.com');
    fireEvent.changeText(screen.getByLabelText('Password'), 'longenough');
    fireEvent.changeText(screen.getByLabelText('Confirm password'), 'different');
    fireEvent.press(screen.getByText('Create account'));

    expect(await screen.findByText("Passwords don't match.")).toBeTruthy();
    expect(mockedSignUp).not.toHaveBeenCalled();
  });

  it('on success with no session (email confirmation required), routes to Email Verification', async () => {
    mockedSignUp.mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    } as never);
    renderWithProviders(<SignUpScreen />);

    fireEvent.changeText(screen.getByLabelText('Email'), 'user@example.com');
    fireEvent.changeText(screen.getByLabelText('Password'), 'longenough');
    fireEvent.changeText(screen.getByLabelText('Confirm password'), 'longenough');
    fireEvent.press(screen.getByText('Create account'));

    await waitFor(() =>
      expect(mockedSignUp).toHaveBeenCalledWith('user@example.com', 'longenough'),
    );
    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith({
        pathname: '/(auth)/verify-email',
        params: { email: 'user@example.com' },
      }),
    );
  });

  it('shows the approved error copy — never the raw backend message — on failure', async () => {
    mockedSignUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { name: 'AuthApiError', __isAuthError: true, code: 'user_already_exists' },
    } as never);
    renderWithProviders(<SignUpScreen />);

    fireEvent.changeText(screen.getByLabelText('Email'), 'user@example.com');
    fireEvent.changeText(screen.getByLabelText('Password'), 'longenough');
    fireEvent.changeText(screen.getByLabelText('Confirm password'), 'longenough');
    fireEvent.press(screen.getByText('Create account'));

    expect(
      await screen.findByText(
        'An account may already exist for this email. Try signing in instead.',
      ),
    ).toBeTruthy();
    expect(router.replace).not.toHaveBeenCalled();
  });
});
