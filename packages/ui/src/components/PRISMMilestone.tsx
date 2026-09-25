import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { componentRadius } from '../tokens/radius';
import { spacing } from '../tokens/spacing';
import { fontWeight, type } from '../tokens/typography';

export interface PRISMMilestoneProps {
  icon?: React.ReactNode;
  title: string;
  /** Already formatted for display. */
  date?: string;
  description?: string;
  onPress?: () => void;
}

/**
 * A milestone deserves slightly more visual emphasis than an ordinary
 * record — a larger icon, spectrum accent, date, and title. A
 * user-created milestone must feel equally important as a suggested one
 * — no visual second-class treatment. See docs/DESIGN_SYSTEM.md §16.
 */
export function PRISMMilestone({ icon, title, date, description, onPress }: PRISMMilestoneProps) {
  const theme = useTheme();

  const content = (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border.subtle },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: theme.spectrum.violet + '33', borderColor: theme.spectrum.violet },
        ]}
      >
        {icon}
      </View>
      <View style={styles.text}>
        {date ? (
          <Text style={[styles.date, { color: theme.colors.text.tertiary }]}>{date}</Text>
        ) : null}
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>{title}</Text>
        {description ? (
          <Text
            style={[styles.description, { color: theme.colors.text.secondary }]}
            numberOfLines={2}
          >
            {description}
          </Text>
        ) : null}
      </View>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={date ? `${title}, ${date}` : title}
      style={({ pressed }) => pressed && { opacity: 0.9 }}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: componentRadius.card,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.smd,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
  },
  date: {
    fontSize: type.caption.fontSize,
    lineHeight: type.caption.lineHeight,
    marginBottom: 2,
  },
  title: {
    fontSize: type.bodyL.fontSize,
    lineHeight: type.bodyL.lineHeight,
    fontWeight: fontWeight.semibold as '600',
  },
  description: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
    marginTop: 2,
  },
});
