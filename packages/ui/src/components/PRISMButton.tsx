import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { layout } from '../tokens/spacing';
import { componentRadius } from '../tokens/radius';
import { fontWeight, type } from '../tokens/typography';

export type PRISMButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive';

export interface PRISMButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  label: string;
  variant?: PRISMButtonVariant;
  loading?: boolean;
  disabled?: boolean;
}

/**
 * The primary PRISM button. Never use a spectrum gradient on every
 * button — the primary variant uses a single restrained accent.
 * See docs/DESIGN_SYSTEM.md §10.
 */
export function PRISMButton({
  label,
  variant = 'primary',
  loading = false,
  disabled = false,
  ...pressableProps
}: PRISMButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyle(variant, theme, pressed, isDisabled),
        isDisabled && styles.disabled,
      ]}
      {...pressableProps}
    >
      {loading ? (
        <ActivityIndicator color={textColor(variant, theme)} />
      ) : (
        <Text style={[styles.label, { color: textColor(variant, theme) }]}>{label}</Text>
      )}
    </Pressable>
  );
}

function variantStyle(
  variant: PRISMButtonVariant,
  theme: ReturnType<typeof useTheme>,
  pressed: boolean,
  disabled: boolean,
) {
  const opacity = pressed && !disabled ? 0.85 : 1;
  switch (variant) {
    case 'primary':
      return { backgroundColor: theme.spectrum.cyan, opacity, borderWidth: 0 };
    case 'secondary':
      return {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.border.default,
        opacity,
      };
    case 'tertiary':
      return { backgroundColor: 'transparent', borderWidth: 0, opacity, paddingHorizontal: 0 };
    case 'destructive':
      return { backgroundColor: theme.destructive, opacity, borderWidth: 0 };
  }
}

function textColor(variant: PRISMButtonVariant, theme: ReturnType<typeof useTheme>) {
  switch (variant) {
    case 'primary':
    case 'destructive':
      return theme.colors.text.inverse;
    case 'secondary':
    case 'tertiary':
      return theme.colors.text.primary;
  }
}

const styles = StyleSheet.create({
  base: {
    height: layout.buttonHeight,
    minWidth: layout.minTouchTarget,
    borderRadius: componentRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  label: {
    fontSize: type.bodyL.fontSize,
    lineHeight: type.bodyL.lineHeight,
    fontWeight: fontWeight.semibold as '600',
  },
  disabled: {
    opacity: 0.4,
  },
});
