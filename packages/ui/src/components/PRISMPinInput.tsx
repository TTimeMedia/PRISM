import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { spacing } from '../tokens/spacing';
import { fontWeight, type } from '../tokens/typography';

export interface PRISMPinInputProps {
  /** Always visible — never rely on placeholder text as the only label. See docs/DESIGN_SYSTEM.md §11. */
  label: string;
  /** Digits only, '' to `length` characters — the same plain string a PIN TextInput already produced. */
  value: string;
  onChangeText: (value: string) => void;
  onSubmitEditing?: () => void;
  onBlur?: () => void;
  /** Number of dot slots shown — PINs are 4-8 digits (see lib/you/pinStorage.ts); this only bounds the visual, not what's valid. */
  length?: number;
  helperText?: string;
  error?: string;
  testID?: string;
}

/**
 * A purpose-built numeric PIN entry — filled dots instead of visible
 * digits or a generic text field, the standard app-lock pattern. Still
 * just a single controlled digits-only string (value/onChangeText/
 * onSubmitEditing/accessibilityLabel), the same contract a PIN
 * `PRISMInput` already had — a drop-in swap wherever one was used
 * (`keyboardType="number-pad" secureTextEntry`). Purely presentational:
 * it never touches PIN storage, hashing, or verification (see
 * lib/you/pinStorage.ts, unchanged).
 *
 * The real `TextInput` sits transparently on top of the decorative dots
 * (rather than a separate Pressable) — one accessible, one focusable, one
 * touchable element for the whole field, not a wrapper plus a hidden
 * input competing for VoiceOver/TalkBack focus.
 */
export function PRISMPinInput({
  label,
  value,
  onChangeText,
  onSubmitEditing,
  onBlur,
  length = 8,
  helperText,
  error,
  testID,
}: PRISMPinInputProps) {
  const theme = useTheme();
  const borderColor = error ? theme.destructive : theme.colors.fieldBorder;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.text.secondary }]}>{label}</Text>
      <View style={styles.field}>
        <View
          style={[styles.dots, { backgroundColor: theme.colors.field, borderColor }]}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {Array.from({ length }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  borderColor: theme.colors.fieldBorder,
                  backgroundColor: index < value.length ? theme.accent : 'transparent',
                },
              ]}
            />
          ))}
        </View>
        <TextInput
          style={[StyleSheet.absoluteFill, styles.overlayInput]}
          value={value}
          onChangeText={(text) => onChangeText(text.replace(/\D/g, '').slice(0, length))}
          onBlur={onBlur}
          onSubmitEditing={onSubmitEditing}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={length}
          testID={testID}
          accessibilityLabel={label}
          returnKeyType={onSubmitEditing ? 'done' : undefined}
        />
      </View>
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
  field: {
    justifyContent: 'center',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
  },
  // Transparent, filling the same box as the dots — real touch/keyboard
  // target the full width of the visible field, not a separate wrapper.
  overlayInput: {
    opacity: 0,
  },
  helper: {
    fontSize: type.caption.fontSize,
    lineHeight: type.caption.lineHeight,
    marginTop: spacing.xs,
  },
});
