import React from 'react';
import { SafeAreaProvider, type Metrics } from 'react-native-safe-area-context';
import { render, type RenderOptions } from '@testing-library/react-native';
import { PRISMToastProvider, ThemeProvider } from '@prism/ui';

// SafeAreaProvider measures the frame natively; in the test renderer
// that measurement never resolves, so children stay unrendered unless
// we supply metrics up front — this is react-native-safe-area-context's
// own documented pattern for testing.
const TEST_SAFE_AREA_METRICS: Metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

/**
 * Wraps a component with the providers every real screen renders under
 * (theme, safe area, toasts). Auth/React Query providers are added here
 * as soon as a test needs them — see lib/auth/AuthProvider.tsx and
 * lib/queryClient.ts.
 */
export function renderWithProviders(ui: React.ReactElement, options?: RenderOptions) {
  return render(
    <ThemeProvider preference="dark">
      <PRISMToastProvider>{ui}</PRISMToastProvider>
    </ThemeProvider>,
    {
      wrapper: ({ children }) => (
        <SafeAreaProvider initialMetrics={TEST_SAFE_AREA_METRICS}>{children}</SafeAreaProvider>
      ),
      ...options,
    },
  );
}
