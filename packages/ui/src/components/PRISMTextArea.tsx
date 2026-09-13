import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { componentRadius } from '../tokens/radius';
import { spacing } from '../tokens/spacing';
import { fontWeight, type } from '../tokens/typography';

export interface PRISMTextAreaProps extends Omit<TextInputProps, 'style' | 'multiline'> {
  label: string;
  helperText?: string;
  error?: string;
  minLines?: number;
}

/** Used for Journal entries, notes, and other long-form free text. */
export function PRISMTextArea({
  label,
  helperText,
  error,
  minLines = 6,
  ...inputProps
}: PRISMTextAreaProps) {
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
        multiline
        textAlignVertical="top"
        placeholderTextColor={theme.colors.text.tertiary}
        style={[
          styles.input,
          {
            minHeight: minLines * (type.bodyL.lineHeight ?? 24),
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
        <Text style={[styles.helper, { color: theme.destructive }]}>{error}</Text>
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
    borderRadius: componentRadius.input,
    borderWidth: 1,
    padding: spacing.md,
    fontSize: type.bodyL.fontSize,
  },
  helper: {
    fontSize: type.caption.fontSize,
    lineHeight: type.caption.lineHeight,
    marginTop: spacing.xs,
  },
});
