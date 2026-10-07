import { useEffect, useRef } from 'react';
import { usePathname } from 'expo-router';
import { useAppStore } from '../store/appStore';
import { setAnalyticsEnabled } from './analytics';
import { screenName, track } from './events';

/**
 * Turns analytics on or off with the person's choice, and records which
 * screens are opened (with record IDs removed). Mounted once, in the root
 * layout. Does nothing for anyone who hasn't said yes.
 */
export function useAnalytics(): void {
  const consent = useAppStore((state) => state.analyticsConsent);
  const pathname = usePathname();
  const opened = useRef(false);

  useEffect(() => {
    void setAnalyticsEnabled(consent === 'granted').then(() => {
      if (consent === 'granted' && !opened.current) {
        opened.current = true;
        track('app_opened');
      }
    });
  }, [consent]);

  useEffect(() => {
    if (consent === 'granted') track('screen_viewed', { screen: screenName(pathname) });
  }, [pathname, consent]);
}
