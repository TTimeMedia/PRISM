import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, spacing, type, useTheme } from '@prism/ui';
import { APP_ICONS, type AppIconKey } from '../../../lib/you/appIcon';

interface AppIconPickerProps {
  value: AppIconKey;
  onChange: (key: AppIconKey) => void;
}

/** Choose the home-screen icon. Four to a row, each with its name underneath. */
export function AppIconPicker({ value, onChange }: AppIconPickerProps) {
  const theme = useTheme();
  return (
    <View style={styles.grid} accessibilityRole="radiogroup">
      {APP_ICONS.map((icon) => {
        const selected = icon.key === value;
        return (
          <Pressable
            key={icon.key}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={`${icon.label} icon`}
            onPress={() => onChange(icon.key)}
            style={({ pressed }) => [styles.option, { opacity: pressed ? 0.8 : 1 }]}
          >
            <View style={[styles.ring, { borderColor: selected ? theme.accent : 'transparent' }]}>
              <Image
                source={icon.image}
                style={[styles.icon, { borderColor: theme.colors.border.default }]}
              />
            </View>
            <Text
              style={[
                styles.label,
                { color: selected ? theme.colors.text.primary : theme.colors.text.secondary },
              ]}
            >
              {icon.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const ICON_SIZE = 60;

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.md,
  },
  option: {
    width: '25%',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ring: {
    padding: 3,
    borderWidth: 2,
    borderRadius: radius.md + 5,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
  },
});
