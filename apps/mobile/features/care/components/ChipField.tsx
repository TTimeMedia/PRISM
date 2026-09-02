import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PRISMChip, spacing, type, useTheme } from '@prism/ui';

export interface ChipFieldOption {
  value: string;
  label: string;
}

export interface ChipFieldProps {
  label: string;
  options: readonly ChipFieldOption[];
  value: string | null;
  onChange: (value: string | null) => void;
}

/** A labeled single-select chip row — Form, Frequency, Injection Site, Log Status. */
export function ChipField({ label, options, value, onChange }: ChipFieldProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.text.secondary }]}>{label}</Text>
      <View style={styles.wrap}>
        {options.map((option) => (
          <PRISMChip
            key={option.value}
            label={option.label}
            selected={value === option.value}
            onPress={() => onChange(value === option.value ? null : option.value)}
          />
        ))}
      </View>
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
