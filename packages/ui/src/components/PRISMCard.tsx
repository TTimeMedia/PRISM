import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { componentRadius } from '../tokens/radius';
import { layout } from '../tokens/spacing';

export interface PRISMCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * The primary PRISM surface component. Standard card: surface
 * background, 18px radius, subtle border, minimal shadow. Do not make
 * every piece of information a card — see docs/DESIGN_SYSTEM.md §9.
 */
export function PRISMCard({ children, onPress, accessibilityLabel, style }: PRISMCardProps) {
  const theme = useTheme();
  const cardStyle = [
    styles.base,
    {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border.subtle,
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [cardStyle, pressed && { opacity: 0.9 }]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: componentRadius.card,
    borderWidth: 1,
    padding: layout.cardPadding,
  },
});
