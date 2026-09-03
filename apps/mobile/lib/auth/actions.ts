import * as Linking from 'expo-linking';
import { supabase } from '../supabase/client';

/**
 * Thin wrappers around `supabase.auth.*` — see docs/MASTER_BUILD_SPEC.md
 * §17. Kept separate from the screens so the screens stay focused on
 * form/validation/UI state, and so this logic is unit-testable without
 * rendering React Native components.
 */

const RESET_PASSWORD_REDIRECT = Linking.createURL('reset-password');

export async function signUp(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

/**
 * Always resolves the same way regardless of whether the email exists —
 * see docs/SECURITY.md §1 (enumeration protection). Callers should show
 * the same message on both success and (non-fatal) failure.
 */
export async function sendPasswordResetEmail(email: string) {
  return supabase.auth.resetPasswordForEmail(email, { redirectTo: RESET_PASSWORD_REDIRECT });
}

/** Requires an active recovery session, established via the emailed deep link. */
export async function updatePassword(password: string) {
  return supabase.auth.updateUser({ password });
}

export async function resendVerificationEmail(email: string) {
  return supabase.auth.resend({ type: 'signup', email });
}

export async function signOut() {
  return supabase.auth.signOut();
}
