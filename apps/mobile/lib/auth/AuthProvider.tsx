import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useLinkingURL } from 'expo-linking';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../supabase/client';
import { isPasswordRecoveryLink, parseAuthDeepLink } from './deepLinks';

/**
 * Session + password-recovery state for the whole app. See
 * docs/MASTER_BUILD_SPEC.md §17 and docs/SECURITY.md §1.
 *
 * `isPasswordRecovery` is tracked manually rather than read off
 * `onAuthStateChange`'s event name: Supabase's `setSession()` (which is
 * what establishes the session from a hand-parsed deep link on native —
 * see lib/auth/deepLinks.ts) always fires `SIGNED_IN`, never
 * `PASSWORD_RECOVERY` — that event is only emitted by the browser-only
 * URL-detection code path this app doesn't use. The recovery link's own
 * `type=recovery` parameter is the source of truth instead.
 */
interface AuthContextValue {
  session: Session | null;
  /** True until the initial session check completes. */
  isLoading: boolean;
  /** True while the current session exists only to let the user set a new password. */
  isPasswordRecovery: boolean;
  /** Call once the user has successfully set a new password. */
  clearPasswordRecovery: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  isLoading: true,
  isPasswordRecovery: false,
  clearPasswordRecovery: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const linkingUrl = useLinkingURL();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!linkingUrl) return;
    const params = parseAuthDeepLink(linkingUrl);
    if (!params.accessToken || !params.refreshToken) return;

    if (isPasswordRecoveryLink(params)) {
      setIsPasswordRecovery(true);
    }
    supabase.auth.setSession({
      access_token: params.accessToken,
      refresh_token: params.refreshToken,
    });
  }, [linkingUrl]);

  const clearPasswordRecovery = useCallback(() => setIsPasswordRecovery(false), []);

  return (
    <AuthContext.Provider value={{ session, isLoading, isPasswordRecovery, clearPasswordRecovery }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useSession(): AuthContextValue {
  return useContext(AuthContext);
}
