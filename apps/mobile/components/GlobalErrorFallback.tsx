import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { PRISMErrorState, useTheme } from '@prism/ui';

export interface GlobalErrorFallbackProps {
  error: Error;
  retry: () => void;
}

/**
 * Rendered when an error escapes a route segment's render tree. Wired
 * up via expo-router's `export { ErrorBoundary }` convention in
 * app/_layout.tsx. Never expose the raw error message to the user —
 * see docs/SECURITY.md and docs/DESIGN_SYSTEM.md §26 — but do log it
 * for debugging (console only for now; a crash-reporting integration
 * is a Hardening-milestone decision, not Foundation's).
 */
export function GlobalErrorFallback({ error, retry }: GlobalErrorFallbackProps) {
  const theme = useTheme();

  if (__DEV__) {
    console.error('PRISM caught an unhandled error:', error);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRISMErrorState onRetry={retry} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});
