import React from 'react';
import { Switch, Text, View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { layout, spacing } from '../tokens/spacing';
import { type } from '../tokens/typography';

export interface PRISMSwitchProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export function PRISMSwitch({
  label,
  description,
  value,
  onValueChange,
  disabled = false,
}: PRISMSwitchProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <Text style={[styles.label, { color: theme.colors.text.primary }]}>{label}</Text>
        {description ? (
          <Text style={[styles.description, { color: theme.colors.text.tertiary }]}>
            {description}
          </Text>
        ) : null}
      </View>
      <Switch
        accessibilityLabel={label}
        accessibilityState={{ disabled, checked: value }}
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: theme.colors.border.strong, true: theme.spectrum.cyan }}
        thumbColor={theme.colors.text.inverse}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: layout.preferredTouchTarget,
    paddingVertical: spacing.sm,
  },
  text: {
    flex: 1,
    marginRight: spacing.md,
  },
  label: {
    fontSize: type.bodyL.fontSize,
    lineHeight: type.bodyL.lineHeight,
  },
  description: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
    marginTop: 2,
  },
});
