import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { radius } from '../tokens/radius';
import { layout, spacing } from '../tokens/spacing';
import { type } from '../tokens/typography';

export interface PRISMChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

/** Use for tags and short filters — not for everything. See docs/DESIGN_SYSTEM.md §21. */
export function PRISMChip({ label, selected = false, onPress, disabled = false }: PRISMChipProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: selected ? theme.spectrum.cyan : theme.colors.surfaceElevated,
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: selected ? theme.colors.text.inverse : theme.colors.text.primary },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    // Minimum touch target per docs/DESIGN_SYSTEM.md §23 (44x44px) —
    // padding + text alone (~36px) fell short; found during the
    // Hardening milestone's accessibility audit.
    minHeight: layout.minTouchTarget,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
  },
});
