import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PRISMChip, spacing } from '@prism/ui';

export interface ChipSelectOption {
  value: string;
  label: string;
}

export interface ChipSelectProps {
  options: readonly ChipSelectOption[];
  selected: readonly string[];
  onChange: (next: string[]) => void;
  /** Single-select behaves like a radio group instead of independent toggles. */
  multiple?: boolean;
}

/** Wrapping chip group for onboarding's multi/single-select screens. */
export function ChipSelect({ options, selected, onChange, multiple = true }: ChipSelectProps) {
  const toggle = (value: string) => {
    if (multiple) {
      onChange(
        selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value],
      );
    } else {
      onChange(selected.includes(value) ? [] : [value]);
    }
  };

  return (
    <View style={styles.wrap}>
      {options.map((option) => (
        <PRISMChip
          key={option.value}
          label={option.label}
          selected={selected.includes(option.value)}
          onPress={() => toggle(option.value)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
