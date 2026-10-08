import { AuthApiError } from '@supabase/supabase-js';
import { signIn } from '../actions';
import {
  forgetPendingSignUp,
  hasPendingSignUp,
  rememberPendingSignUp,
  trySignInAfterConfirming,
} from '../pendingSignUp';

jest.mock('../actions', () => ({ signIn: jest.fn() }));
const mockedSignIn = signIn as jest.MockedFunction<typeof signIn>;

const notConfirmed = new AuthApiError('Email not confirmed', 400, 'email_not_confirmed');

beforeEach(() => {
  mockedSignIn.mockReset();
  forgetPendingSignUp();
});

describe('signing in after the email is confirmed', () => {
  it('does nothing without a pending sign-up', async () => {
    expect(await trySignInAfterConfirming()).toBe(false);
    expect(mockedSignIn).not.toHaveBeenCalled();
  });

  it('keeps waiting while the email is not confirmed yet', async () => {
    rememberPendingSignUp('eli@example.com', 'correct horse');
    mockedSignIn.mockResolvedValue({
      data: { session: null, user: null },
      error: notConfirmed,
    } as never);
    expect(await trySignInAfterConfirming()).toBe(false);
    expect(mockedSignIn).toHaveBeenCalledWith('eli@example.com', 'correct horse');
    expect(hasPendingSignUp()).toBe(true);
  });

  it('signs in once confirmed, then forgets the password', async () => {
    rememberPendingSignUp('eli@example.com', 'correct horse');
    mockedSignIn.mockResolvedValue({
      data: { session: { access_token: 'x' }, user: {} },
      error: null,
    } as never);
    expect(await trySignInAfterConfirming()).toBe(true);
    expect(hasPendingSignUp()).toBe(false);
  });

  it('stops trying on any other error', async () => {
    rememberPendingSignUp('eli@example.com', 'correct horse');
    const wrong = new AuthApiError('Invalid login credentials', 400, 'invalid_credentials');
    mockedSignIn.mockResolvedValue({ data: { session: null, user: null }, error: wrong } as never);
    expect(await trySignInAfterConfirming()).toBe(false);
    expect(hasPendingSignUp()).toBe(false);
  });
});
