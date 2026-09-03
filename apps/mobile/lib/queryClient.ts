import { onlineManager, QueryClient } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';

/**
 * Server state (Supabase data) lives here — see docs/TECHNICAL_BIBLE.md
 * §12. Distinct from local UI state (component state) and persistent
 * app state (lib/store), which use different tools on purpose rather
 * than one giant global store.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Sensitive data should not be cached indefinitely — see docs/TECHNICAL_BIBLE.md §12.
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

/**
 * React Query's default `onlineManager` only listens for the browser's
 * `window` online/offline events, which don't fire on native — without
 * this, a query or mutation fired while genuinely offline would just
 * fail (or hang unretried) instead of pausing and auto-firing on
 * reconnect. Wired to the same `NetInfo` signal `OfflineBanner` already
 * uses, found and fixed during the Hardening milestone's offline-
 * behavior review — see components/OfflineBanner.tsx.
 */
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(state.isConnected != null ? state.isConnected : true);
  });
});
