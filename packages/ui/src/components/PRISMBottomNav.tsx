import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { layout, spacing } from '../tokens/spacing';
import { fontWeight, type } from '../tokens/typography';

export interface PRISMBottomNavItem {
  key: string;
  label: string;
  icon: (props: { color: string; size: number; focused: boolean }) => React.ReactNode;
  focused: boolean;
  onPress: () => void;
}

export interface PRISMBottomNavProps {
  items: PRISMBottomNavItem[];
}

/**
 * The primary TODAY / CARE / JOURNEY / YOU tab bar. Deliberately generic
 * (not coupled to expo-router's types) so it stays testable and reusable
 * — the app wires it up as a custom tabBar renderer. See
 * docs/DESIGN_SYSTEM.md §12.
 */
export function PRISMBottomNav({ items }: PRISMBottomNavProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border.subtle,
          paddingBottom: Math.max(insets.bottom, spacing.sm),
        },
      ]}
    >
      {items.map((item) => {
        const color = item.focused ? theme.spectrum.cyan : theme.colors.text.tertiary;
        return (
          <Pressable
            key={item.key}
            onPress={item.onPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: item.focused }}
            accessibilityLabel={item.label}
            style={styles.item}
          >
            {item.icon({ color, size: 24, focused: item.focused })}
            <Text
              style={[
                styles.label,
                {
                  color,
                  fontWeight: (item.focused ? fontWeight.semibold : fontWeight.regular) as
                    '600' | '400',
                },
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: spacing.sm,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: layout.preferredTouchTarget,
    gap: 2,
  },
  label: {
    fontSize: type.micro.fontSize,
    lineHeight: type.micro.lineHeight,
  },
});
