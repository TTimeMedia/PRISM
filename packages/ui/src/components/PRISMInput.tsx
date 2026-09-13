import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { componentRadius } from '../tokens/radius';
import { layout, spacing } from '../tokens/spacing';
import { fontWeight, type } from '../tokens/typography';

export interface PRISMInputProps extends Omit<TextInputProps, 'style'> {
  /** Always visible — never rely on placeholder text as the only label. See docs/DESIGN_SYSTEM.md §11. */
  label: string;
  /** Supporting text shown below the field, or a validation error when `error` is set. */
  helperText?: string;
  error?: string;
}

export function PRISMInput({ label, helperText, error, ...inputProps }: PRISMInputProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? theme.destructive
    : focused
      ? theme.spectrum.cyan
      : theme.colors.border.default;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.text.secondary }]}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        accessibilityState={{ disabled: inputProps.editable === false }}
        placeholderTextColor={theme.colors.text.tertiary}
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.surfaceElevated,
            borderColor,
            color: theme.colors.text.primary,
          },
        ]}
        onFocus={(e) => {
          setFocused(true);
          inputProps.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          inputProps.onBlur?.(e);
        }}
        {...inputProps}
      />
      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[styles.helper, { color: theme.destructive }]}
        >
          {error}
        </Text>
      ) : helperText ? (
        <Text style={[styles.helper, { color: theme.colors.text.tertiary }]}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
    fontWeight: fontWeight.medium as '500',
    marginBottom: spacing.xs,
  },
  input: {
    height: layout.inputHeight,
    borderRadius: componentRadius.input,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: type.bodyL.fontSize,
  },
  helper: {
    fontSize: type.caption.fontSize,
    lineHeight: type.caption.lineHeight,
    marginTop: spacing.xs,
  },
});
