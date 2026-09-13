import React from 'react';
import { Pressable, StyleSheet, type PressableProps } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { layout } from '../tokens/spacing';
import { radius } from '../tokens/radius';

export interface PRISMIconButtonProps extends Omit<PressableProps, 'style'> {
  /** Required — icon-only controls must always have an accessible label. */
  accessibilityLabel: string;
  children: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
}

/** A touch-target-safe wrapper for a single icon (e.g. from lucide-react-native). */
export function PRISMIconButton({
  accessibilityLabel,
  children,
  selected = false,
  disabled = false,
  ...pressableProps
}: PRISMIconButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        selected && { backgroundColor: theme.colors.surfaceSelected },
        pressed && !disabled && { opacity: 0.7 },
        disabled && styles.disabled,
      ]}
      {...pressableProps}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: layout.preferredTouchTarget,
    height: layout.preferredTouchTarget,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
});
