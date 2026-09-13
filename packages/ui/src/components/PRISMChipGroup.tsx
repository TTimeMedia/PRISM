import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { spacing } from '../tokens/spacing';
import { type } from '../tokens/typography';
import { PRISMChip } from './PRISMChip';

export interface PRISMChipGroupOption {
  value: string;
  label: string;
}

export interface PRISMChipGroupProps {
  /** Omit when the field's label is already rendered elsewhere by the caller. */
  label?: string;
  options: readonly PRISMChipGroupOption[];
  /** Currently selected values — always an array, even for single-select (0 or 1 entries). */
  value: readonly string[];
  /** Receives the full next selection, already computed (toggle for multi-select, radio-swap for single). */
  onChange: (next: string[]) => void;
  /** Single-select behaves like a radio group instead of independent toggles. */
  multiple?: boolean;
}

/**
 * The one real implementation behind PRISM's chip-based single/multi-select
 * fields. `features/care/components/ChipField.tsx` and
 * `features/onboarding/components/ChipSelect.tsx` wrap this — each keeping
 * its own pre-existing call-site contract (a single nullable value vs. a
 * full array) so no screen needed to change — rather than every feature
 * reimplementing the same chip-wrap-and-toggle rendering.
 */
export function PRISMChipGroup({
  label,
  options,
  value,
  onChange,
  multiple = false,
}: PRISMChipGroupProps) {
  const theme = useTheme();

  const toggle = (optionValue: string) => {
    if (multiple) {
      onChange(
        value.includes(optionValue)
          ? value.filter((v) => v !== optionValue)
          : [...value, optionValue],
      );
    } else {
      onChange(value.includes(optionValue) ? [] : [optionValue]);
    }
  };

  const chips = (
    <View style={styles.wrap}>
      {options.map((option) => (
        <PRISMChip
          key={option.value}
          label={option.label}
          selected={value.includes(option.value)}
          onPress={() => toggle(option.value)}
        />
      ))}
    </View>
  );

  // No outer wrapper/margin when there's no label — matches
  // ChipSelect's original bare layout exactly (onboarding renders its
  // own screen-level heading, not a per-field label).
  if (!label) return chips;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.text.secondary }]}>{label}</Text>
      {chips}
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
    marginBottom: spacing.sm,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
