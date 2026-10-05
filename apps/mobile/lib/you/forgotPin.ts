import { signOut } from '../auth/actions';
import { supabase } from '../supabase/client';
import { clearPin } from './pinStorage';

/**
 * "Forgot your PIN?" on the lock screen. Turns App Lock off for the account
 * (while still signed in, so the change is allowed), forgets this phone's
 * PIN, and signs out. Getting back in needs the account's email and
 * password, so this never lets someone past the lock without them. Nothing
 * in the account is lost; App Lock can be set up again with a new PIN.
 *
 * App Lock is turned off first because signing back in with it still on and
 * no PIN on the phone would lock the person out for good.
 */
export async function resetPinAndSignOut(userId: string): Promise<void> {
  const { error } = await supabase
    .from('settings')
    .update({ app_lock_enabled: false, biometric_lock: false })
    .eq('user_id', userId);
  if (error) throw error;
  await clearPin();
  await signOut();
}
