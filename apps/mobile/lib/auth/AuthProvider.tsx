import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../supabase/client';

/**
 * Authentication foundation for Milestone 01. This establishes session
 * persistence and a typed session context so later milestones (02 —
 * Authentication & Identity) can build sign-up/sign-in/verification/
 * recovery screens against a working session layer, rather than also
 * inventing session plumbing at that point.
 *
 * Deliberately does NOT implement:
 *  - sign-in/sign-up UI (Milestone 02)
 *  - a redirect-to-auth route guard (Milestone 02 — there is no auth
 *    screen to redirect to yet, and app/(tabs) is the only route group)
 *  - password recovery flows (Milestone 02)
 *
 * See docs/MASTER_BUILD_SPEC.md §17 and docs/SECURITY.md §1.
 */
interface AuthContextValue {
  session: Session | null;
  /** True until the initial session check completes. */
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ session: null, isLoading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  return <AuthContext.Provider value={{ session, isLoading }}>{children}</AuthContext.Provider>;
}

export function useSession(): AuthContextValue {
  return useContext(AuthContext);
}
