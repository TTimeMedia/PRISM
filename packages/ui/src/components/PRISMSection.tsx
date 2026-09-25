import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { spacing } from '../tokens/spacing';
import { fontWeight, type } from '../tokens/typography';

export interface PRISMSectionProps {
  title?: string;
  children: React.ReactNode;
}

/** Groups related content with a consistent heading + spacing rhythm. */
export function PRISMSection({ title, children }: PRISMSectionProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {title ? (
        <Text
          accessibilityRole="header"
          style={[styles.title, { color: theme.colors.text.secondary }]}
        >
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
    fontWeight: fontWeight.semibold as '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
});
