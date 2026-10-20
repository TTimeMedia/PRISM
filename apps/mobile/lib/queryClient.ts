import { AppState } from 'react-native';
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

/**
 * Coming back to Prism refreshes what's on screen. Things change while it's
 * in the background (a dose logged on the Apple Watch, a new day), and React
 * Query's own refetch-on-focus listens for browser events that don't fire on
 * native. Signed photo links are left alone; they don't change.
 */
AppState.addEventListener('change', (state) => {
  if (state !== 'active') return;
  void queryClient.invalidateQueries({
    predicate: (query) => !String(query.queryKey[0]).endsWith('signed-url'),
  });
});
