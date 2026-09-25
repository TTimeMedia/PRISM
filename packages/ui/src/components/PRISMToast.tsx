import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { AccessibilityInfo, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { componentRadius } from '../tokens/radius';
import { spacing } from '../tokens/spacing';
import { type } from '../tokens/typography';

export type PRISMToastTone = 'default' | 'success' | 'error';

interface ToastState {
  id: number;
  message: string;
  tone: PRISMToastTone;
}

interface ToastContextValue {
  showToast: (message: string, tone?: PRISMToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** Wrap the app once, near the root, so any screen can call useToast(). */
export function PRISMToastProvider({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState | null>(null);
  const idRef = useRef(0);

  const showToast = useCallback((message: string, tone: PRISMToastTone = 'default') => {
    idRef.current += 1;
    const id = idRef.current;
    setToast({ id, message, tone });
    // Announce to screen readers — a visual-only toast is inaccessible otherwise.
    AccessibilityInfo.announceForAccessibility(message);
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 3000);
  }, []);

  const toneColor = (tone: PRISMToastTone) => {
    if (tone === 'success') return theme.spectrum.mint;
    if (tone === 'error') return theme.destructive;
    return theme.colors.text.primary;
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast ? (
        <View
          pointerEvents="none"
          accessibilityLiveRegion="polite"
          style={[styles.container, { bottom: insets.bottom + spacing.lg }]}
        >
          <View style={[styles.toast, { backgroundColor: theme.colors.surfaceElevated }]}>
            <View style={[styles.dot, { backgroundColor: toneColor(toast.tone) }]} />
            <Text style={[styles.message, { color: theme.colors.text.primary }]}>
              {toast.message}
            </Text>
          </View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <PRISMToastProvider>.');
  }
  return ctx;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: componentRadius.card,
    paddingVertical: spacing.smd,
    paddingHorizontal: spacing.md,
    maxWidth: 480,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  message: {
    fontSize: type.bodyM.fontSize,
    lineHeight: type.bodyM.lineHeight,
    flexShrink: 1,
  },
});
