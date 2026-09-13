import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { componentRadius } from '../tokens/radius';
import { layout, spacing } from '../tokens/spacing';
import { type } from '../tokens/typography';

export interface PRISMSelectOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
}

export interface PRISMSelectProps<T extends string = string> {
  label: string;
  options: readonly PRISMSelectOption<T>[];
  value: T | T[] | null;
  onChange: (value: T) => void;
  /** Multi-select renders every selected option with a check, e.g. Care Setup. */
  multiple?: boolean;
}

/**
 * An inline option list (not a native picker) so PRISM can present
 * richer, self-explanatory choices — see docs/DESIGN_SYSTEM.md §21
 * ("module cards should be visually richer than a plain checkbox row").
 */
export function PRISMSelect<T extends string = string>({
  label,
  options,
  value,
  onChange,
  multiple = false,
}: PRISMSelectProps<T>) {
  const theme = useTheme();
  const selectedValues = new Set(Array.isArray(value) ? value : value ? [value] : []);

  return (
    <View style={styles.container} accessibilityRole={multiple ? undefined : 'radiogroup'}>
      <Text style={[styles.label, { color: theme.colors.text.secondary }]}>{label}</Text>
      {options.map((option) => {
        const selected = selectedValues.has(option.value);
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole={multiple ? 'checkbox' : 'radio'}
            accessibilityState={{ checked: selected }}
            accessibilityLabel={option.label}
            style={({ pressed }) => [
              styles.option,
              {
                backgroundColor: selected ? theme.colors.surfaceSelected : theme.colors.surface,
                borderColor: selected ? theme.spectrum.cyan : theme.colors.border.subtle,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <View style={styles.optionText}>
              <Text style={[styles.optionLabel, { color: theme.colors.text.primary }]}>
                {option.label}
              </Text>
              {option.description ? (
                <Text style={[styles.optionDescription, { color: theme.colors.text.tertiary }]}>
                  {option.description}
                </Text>
              ) : null}
            </View>
            {selected ? <Check size={20} color={theme.spectrum.cyan} /> : null}
          </Pressable>
        );
      })}
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
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: layout.preferredTouchTarget,
    borderRadius: componentRadius.card,
    borderWidth: 1,
    paddingVertical: spacing.smd,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  optionText: {
    flex: 1,
    marginRight: spacing.sm,
  },
  optionLabel: {
    fontSize: type.bodyL.fontSize,
    lineHeight: type.bodyL.lineHeight,
  },
  optionDescription: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
    marginTop: 2,
  },
});
