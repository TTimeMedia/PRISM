import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { componentRadius } from '../tokens/radius';
import { spacing } from '../tokens/spacing';
import { fontWeight, type } from '../tokens/typography';

export type PRISMToastTone = 'default' | 'success' | 'error';

/** One button on a toast, such as Undo. A toast with an action stays up longer. */
export interface PRISMToastAction {
  label: string;
  onPress: () => void;
}

interface ToastState {
  id: number;
  message: string;
  tone: PRISMToastTone;
  action?: PRISMToastAction;
}

interface ToastContextValue {
  showToast: (message: string, tone?: PRISMToastTone, action?: PRISMToastAction) => void;
}

const TOAST_MS = 3000;
/** Long enough to read the message and reach the button. */
const TOAST_WITH_ACTION_MS = 6000;

const ToastContext = createContext<ToastContextValue | null>(null);

/** Wrap the app once, near the root, so any screen can call useToast(). */
export function PRISMToastProvider({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState | null>(null);
  const idRef = useRef(0);

  const showToast = useCallback(
    (message: string, tone: PRISMToastTone = 'default', action?: PRISMToastAction) => {
      idRef.current += 1;
      const id = idRef.current;
      setToast({ id, message, tone, action });
      // Announce to screen readers — a visual-only toast is inaccessible otherwise.
      AccessibilityInfo.announceForAccessibility(message);
      setTimeout(
        () => {
          setToast((current) => (current?.id === id ? null : current));
        },
        action ? TOAST_WITH_ACTION_MS : TOAST_MS,
      );
    },
    [],
  );

  const toneColor = (tone: PRISMToastTone) => {
    if (tone === 'success') return theme.success;
    if (tone === 'error') return theme.destructive;
    return theme.colors.text.primary;
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast ? (
        <View
          pointerEvents="box-none"
          accessibilityLiveRegion="polite"
          style={[styles.container, { bottom: insets.bottom + spacing.lg }]}
        >
          <View style={[styles.toast, { backgroundColor: theme.colors.surfaceElevated }]}>
            <View style={[styles.dot, { backgroundColor: toneColor(toast.tone) }]} />
            <Text style={[styles.message, { color: theme.colors.text.primary }]}>
              {toast.message}
            </Text>
            {toast.action ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={toast.action.label}
                hitSlop={10}
                onPress={() => {
                  const action = toast.action;
                  setToast(null);
                  action?.onPress();
                }}
                style={styles.action}
              >
                <Text style={[styles.actionText, { color: theme.accentText }]}>
                  {toast.action.label}
                </Text>
              </Pressable>
            ) : null}
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
  action: {
    marginLeft: spacing.md,
  },
  actionText: {
    fontSize: type.bodyM.fontSize,
    lineHeight: type.bodyM.lineHeight,
    fontWeight: fontWeight.semibold as '600',
  },
  message: {
    fontSize: type.bodyM.fontSize,
    lineHeight: type.bodyM.lineHeight,
    flexShrink: 1,
  },
});
