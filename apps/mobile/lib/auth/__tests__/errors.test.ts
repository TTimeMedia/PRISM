import { AuthApiError, AuthRetryableFetchError } from '@supabase/supabase-js';
import { getAuthErrorMessage, isEmailNotConfirmedError } from '../errors';

describe('getAuthErrorMessage', () => {
  it('never returns a raw backend message — even for a mapped code', () => {
    const error = new AuthApiError('Invalid login credentials', 400, 'invalid_credentials');
    const message = getAuthErrorMessage(error);
    expect(message).not.toContain('Invalid login credentials');
    expect(message).toBe("That email or password doesn't look right. Please try again.");
  });

  it('maps email_not_confirmed to an actionable, calm message', () => {
    const error = new AuthApiError('Email not confirmed', 400, 'email_not_confirmed');
    expect(getAuthErrorMessage(error)).toBe('Please verify your email before signing in.');
  });

  it('maps rate-limit codes to a retry message', () => {
    const error = new AuthApiError('rate limited', 429, 'over_email_send_rate_limit');
    expect(getAuthErrorMessage(error)).toBe(
      'Too many attempts. Please wait a moment and try again.',
    );
  });

  it('falls back to the approved generic error copy for an unmapped code', () => {
    const error = new AuthApiError('boom', 500, 'unexpected_failure');
    expect(getAuthErrorMessage(error)).toBe(
      "Something went wrong. Your information wasn't changed.",
    );
  });

  it('falls back to the generic copy for a non-auth error', () => {
    expect(getAuthErrorMessage(new TypeError('Unexpected'))).toBe(
      "Something went wrong. Your information wasn't changed.",
    );
  });

  /**
   * Regression coverage: when the request never reaches Supabase at all
   * (wrong EXPO_PUBLIC_SUPABASE_URL, no backend running, DNS/TLS/connection
   * failure — e.g. a physical device using `127.0.0.1`, which only ever
   * resolves to the device itself, not the developer's machine), auth-js
   * throws `AuthRetryableFetchError`, NOT `AuthApiError`. Login, sign-up,
   * and password reset all go through this same `getAuthErrorMessage`, so
   * this one case previously produced the exact same unhelpful generic
   * message as an actual invalid password — indistinguishable to the user,
   * and to whoever's debugging it, from every other failure. This must
   * surface a distinct, actionable message instead.
   */
  it('gives a distinct, actionable message when the request never reached the server', () => {
    const error = new AuthRetryableFetchError('Failed to fetch', 0);
    expect(getAuthErrorMessage(error)).toBe(
      "Can't reach Prism's servers. Check your connection and try again.",
    );
  });
});

describe('isEmailNotConfirmedError', () => {
  it('is true only for the email_not_confirmed code', () => {
    expect(isEmailNotConfirmedError(new AuthApiError('x', 400, 'email_not_confirmed'))).toBe(true);
    expect(isEmailNotConfirmedError(new AuthApiError('x', 400, 'invalid_credentials'))).toBe(false);
    expect(isEmailNotConfirmedError(new Error('unrelated'))).toBe(false);
  });
});
