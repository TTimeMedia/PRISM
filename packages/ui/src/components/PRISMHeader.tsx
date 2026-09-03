import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { spacing } from '../tokens/spacing';
import { fontFamily, fontWeight, type } from '../tokens/typography';

export interface PRISMHeaderProps {
  title: string;
  subtitle?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

/**
 * A screen-top header. Uses Sora for the title per docs/DESIGN_SYSTEM.md
 * §5 — sparingly, for major screen headings, not as the body typeface.
 */
export function PRISMHeader({ title, subtitle, leading, trailing }: PRISMHeaderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.row}>
        {leading}
        <View style={styles.titleBlock}>
          <Text
            accessibilityRole="header"
            style={[styles.title, { color: theme.colors.text.primary }]}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {trailing}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: type.headingXL.fontSize,
    lineHeight: type.headingXL.lineHeight,
    fontWeight: fontWeight.semibold as '600',
  },
  subtitle: {
    fontSize: type.bodyM.fontSize,
    lineHeight: type.bodyM.lineHeight,
    marginTop: 2,
  },
});
