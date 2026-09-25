import { isAuthApiError, isAuthRetryableFetchError } from '@supabase/supabase-js';

/**
 * Maps Supabase auth errors to PRISM's approved, non-technical error
 * language — see docs/SCREEN_BIBLE.md §3 (Global Screen Contract, Error
 * state) and docs/PRODUCT_BIBLE.md §Error Philosophy: raw backend errors
 * are never exposed to the user. A handful of codes get a more specific,
 * still-calm message because the user needs to know what to do next
 * (e.g. verify their email); everything else falls back to the generic
 * copy. Never expose the raw error to the *user* — but do log it in dev
 * (console only, same pattern as GlobalErrorFallback.tsx), since
 * `AuthApiError` (a real response from the API, e.g. wrong password) and
 * `AuthRetryableFetchError` (the request never reached the API at all —
 * wrong Supabase URL, no backend running, DNS/TLS/connection failure)
 * look identical to the user without it.
 */
export function getAuthErrorMessage(error: unknown): string {
  if (__DEV__) {
    console.error('[auth] Supabase auth call failed:', {
      name: (error as { name?: unknown })?.name,
      status: (error as { status?: unknown })?.status,
      code: (error as { code?: unknown })?.code,
      message: (error as { message?: unknown })?.message,
    });
  }

  if (isAuthRetryableFetchError(error)) {
    return "Can't reach Prism's servers. Check your connection and try again.";
  }

  if (isAuthApiError(error)) {
    switch (error.code) {
      case 'invalid_credentials':
        return "That email or password doesn't look right. Please try again.";
      case 'email_not_confirmed':
        return 'Please verify your email before signing in.';
      case 'user_already_exists':
      case 'email_exists':
        return 'An account may already exist for this email. Try signing in instead.';
      case 'weak_password':
        return 'Choose a stronger password.';
      case 'over_email_send_rate_limit':
      case 'over_request_rate_limit':
        return 'Too many attempts. Please wait a moment and try again.';
      case 'same_password':
        return 'Choose a password different from your current one.';
      default:
        return "Something went wrong. Your information wasn't changed.";
    }
  }
  return "Something went wrong. Your information wasn't changed.";
}

/** True for the specific "you need to verify your email first" sign-in failure. */
export function isEmailNotConfirmedError(error: unknown): boolean {
  return isAuthApiError(error) && error.code === 'email_not_confirmed';
}
