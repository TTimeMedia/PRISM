import React, { createContext, useContext } from 'react';

const ReducedMotionPreferenceContext = createContext(false);

export interface ReducedMotionProviderProps {
  /**
   * settings.reduced_motion — an explicit, PRISM-specific preference,
   * independent of (and OR'd with) the OS "Reduce Motion" setting that
   * useReducedMotion() already detects. See docs/SCREEN_BIBLE.md Screen
   * 61 and docs/DECISIONS.md § YOU.
   */
  preference: boolean;
  children: React.ReactNode;
}

export function ReducedMotionProvider({ preference, children }: ReducedMotionProviderProps) {
  return (
    <ReducedMotionPreferenceContext.Provider value={preference}>
      {children}
    </ReducedMotionPreferenceContext.Provider>
  );
}

/** Defaults to `false` outside a ReducedMotionProvider — OS detection alone still applies. */
export function useReducedMotionPreference(): boolean {
  return useContext(ReducedMotionPreferenceContext);
}
