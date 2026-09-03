import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { useReducedMotionPreference } from '../theme/ReducedMotionContext';

/**
 * Tracks the OS "Reduce Motion" setting, OR'd with the explicit
 * in-app preference (settings.reduced_motion, Screen 61) provided via
 * ReducedMotionProvider. PRISM must remain fully understandable without
 * motion — see docs/DESIGN_SYSTEM.md §23. Components should use this to
 * skip refraction/parallax/floating effects and fall back to fades or
 * instant state changes.
 */
export function useReducedMotion(): boolean {
  const preference = useReducedMotionPreference();
  const [osReduced, setOsReduced] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) setOsReduced(value);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setOsReduced);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return osReduced || preference;
}
