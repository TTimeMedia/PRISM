import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PRISMChip, spacing, type, useTheme } from '@prism/ui';

const DAYS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export interface DaysOfWeekSelectProps {
  value: number[];
  onChange: (value: number[]) => void;
  error?: string;
}

/** Multi-select day-of-week row for a weekly medication schedule. */
export function DaysOfWeekSelect({ value, onChange, error }: DaysOfWeekSelectProps) {
  const theme = useTheme();
  const toggle = (day: number) => {
    onChange(value.includes(day) ? value.filter((d) => d !== day) : [...value, day].sort());
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Days</Text>
      <View style={styles.wrap}>
        {DAYS.map((day) => (
          <PRISMChip
            key={day.value}
            label={day.label}
            selected={value.includes(day.value)}
            onPress={() => toggle(day.value)}
          />
        ))}
      </View>
      {error ? <Text style={[styles.error, { color: theme.destructive }]}>{error}</Text> : null}
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
  error: {
    fontSize: type.caption.fontSize,
    lineHeight: type.caption.lineHeight,
    marginTop: spacing.xs,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
