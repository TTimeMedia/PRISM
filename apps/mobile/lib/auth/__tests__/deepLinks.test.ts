import { isPasswordRecoveryLink, parseAuthDeepLink } from '../deepLinks';

describe('parseAuthDeepLink', () => {
  it('parses tokens and type from the URL fragment (implicit-flow recovery link)', () => {
    const url =
      'prism://reset-password#access_token=abc123&refresh_token=def456&type=recovery&expires_in=3600';
    const params = parseAuthDeepLink(url);
    expect(params).toEqual({
      accessToken: 'abc123',
      refreshToken: 'def456',
      type: 'recovery',
      error: null,
      errorDescription: null,
    });
  });

  it('parses tokens from a query string when there is no fragment', () => {
    const url = 'prism://reset-password?access_token=abc123&refresh_token=def456&type=signup';
    const params = parseAuthDeepLink(url);
    expect(params.accessToken).toBe('abc123');
    expect(params.type).toBe('signup');
  });

  it('parses an error response (e.g. an expired recovery link)', () => {
    const url =
      'prism://reset-password#error=access_denied&error_description=Email+link+is+invalid+or+has+expired';
    const params = parseAuthDeepLink(url);
    expect(params.accessToken).toBeNull();
    expect(params.error).toBe('access_denied');
    expect(params.errorDescription).toBe('Email link is invalid or has expired');
  });

  it('returns all-null fields for a URL with no auth params', () => {
    const params = parseAuthDeepLink('prism://welcome');
    expect(params.accessToken).toBeNull();
    expect(params.refreshToken).toBeNull();
    expect(params.type).toBeNull();
  });
});

describe('isPasswordRecoveryLink', () => {
  it('is true only when both tokens are present and type is recovery', () => {
    expect(
      isPasswordRecoveryLink({
        accessToken: 'a',
        refreshToken: 'b',
        type: 'recovery',
        error: null,
        errorDescription: null,
      }),
    ).toBe(true);
  });

  it('is false for a signup confirmation link (same token shape, different type)', () => {
    expect(
      isPasswordRecoveryLink({
        accessToken: 'a',
        refreshToken: 'b',
        type: 'signup',
        error: null,
        errorDescription: null,
      }),
    ).toBe(false);
  });

  it('is false when tokens are missing even if type is recovery', () => {
    expect(
      isPasswordRecoveryLink({
        accessToken: null,
        refreshToken: null,
        type: 'recovery',
        error: null,
        errorDescription: null,
      }),
    ).toBe(false);
  });
});
