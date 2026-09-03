/**
 * Supabase's default (implicit-flow) auth emails link to
 * `<redirectTo>#access_token=...&refresh_token=...&type=recovery|signup|...`.
 * On native there is no `window.location` for the client to auto-detect —
 * our Supabase client is created with `detectSessionInUrl: false` — so the
 * incoming deep link URL is parsed by hand and the session is established
 * explicitly. See docs/SECURITY.md §1 and docs/MASTER_BUILD_SPEC.md §17.
 */
export interface AuthDeepLinkParams {
  accessToken: string | null;
  refreshToken: string | null;
  /** e.g. 'recovery', 'signup', 'magiclink', 'email_change'. */
  type: string | null;
  error: string | null;
  errorDescription: string | null;
}

export function parseAuthDeepLink(url: string): AuthDeepLinkParams {
  const hashIndex = url.indexOf('#');
  const queryIndex = url.indexOf('?');
  const paramsString =
    hashIndex >= 0 ? url.slice(hashIndex + 1) : queryIndex >= 0 ? url.slice(queryIndex + 1) : '';
  const params = new URLSearchParams(paramsString);

  return {
    accessToken: params.get('access_token'),
    refreshToken: params.get('refresh_token'),
    type: params.get('type'),
    error: params.get('error'),
    errorDescription: params.get('error_description'),
  };
}

export function isPasswordRecoveryLink(params: AuthDeepLinkParams): boolean {
  return Boolean(params.accessToken && params.refreshToken && params.type === 'recovery');
}
