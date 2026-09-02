import { QueryClient } from '@tanstack/react-query';

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
