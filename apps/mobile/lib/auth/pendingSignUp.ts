import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { signIn } from './actions';
import { isEmailNotConfirmedError } from './errors';

/**
 * Signs the person in by themselves once they confirm their email, wherever
 * they tapped the link (this phone's mail app, a browser, another device).
 *
 * The email and password from Sign Up are kept in memory only, never
 * written anywhere, and are forgotten as soon as sign-in works or the
 * "Check your email" screen closes. While that screen is open, sign-in is
 * retried when Prism comes back to the foreground and every few seconds.
 * Once it works, the session change routes on to onboarding as usual.
 */

let pending: { email: string; password: string } | null = null;

export function rememberPendingSignUp(email: string, password: string): void {
  pending = { email, password };
}

export function forgetPendingSignUp(): void {
  pending = null;
}

export function hasPendingSignUp(): boolean {
  return pending !== null;
}

/** One attempt. True once signed in; false while the email still isn't confirmed. */
export async function trySignInAfterConfirming(): Promise<boolean> {
  if (!pending) return false;
  const { email, password } = pending;
  const { data, error } = await signIn(email, password);
  if (data.session) {
    forgetPendingSignUp();
    return true;
  }
  // Anything other than "not confirmed yet" (wrong password after a change,
  // account removed) means waiting won't help: stop trying.
  if (error && !isEmailNotConfirmedError(error)) forgetPendingSignUp();
  return false;
}

const RETRY_MS = 4000;

/** Used by the "Check your email" screen. */
export function useSignInWhenConfirmed(): void {
  const busy = useRef(false);

  useEffect(() => {
    const attempt = async () => {
      if (busy.current || !hasPendingSignUp()) return;
      busy.current = true;
      try {
        await trySignInAfterConfirming();
      } catch {
        // Offline: try again on the next tick.
      } finally {
        busy.current = false;
      }
    };

    const interval = setInterval(() => void attempt(), RETRY_MS);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void attempt();
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
      forgetPendingSignUp();
    };
  }, []);
}
