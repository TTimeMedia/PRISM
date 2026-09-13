import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { spacing } from '../tokens/spacing';
import { type } from '../tokens/typography';

export interface PRISMTimelineEventItem {
  id: string;
  /** A spectrum hex value — see docs/DESIGN_SYSTEM.md §4 "Spectrum palette." */
  color: string;
  title: string;
  subtitle?: string;
  /** Already formatted for display. */
  date: string;
  onPress?: () => void;
}

export interface PRISMTimelineProps {
  events: PRISMTimelineEventItem[];
}

/**
 * The JOURNEY timeline — a "path of light" connecting events, explicitly
 * not a conventional medical record list. Subtle spectrum changes
 * distinguish event categories rather than icons alone. See
 * docs/DESIGN_SYSTEM.md §15 and docs/SCREEN_BIBLE.md Screens 42-43.
 */
export function PRISMTimeline({ events }: PRISMTimelineProps) {
  const theme = useTheme();

  return (
    <FlatList
      data={events}
      keyExtractor={(event) => event.id}
      renderItem={({ item: event, index }) => {
        const isLast = index === events.length - 1;
        const content = (
          <View style={styles.row}>
            <View style={styles.rail}>
              <View style={[styles.dot, { backgroundColor: event.color }]} />
              {!isLast ? (
                <View style={[styles.line, { backgroundColor: theme.colors.border.subtle }]} />
              ) : null}
            </View>
            <View style={styles.content}>
              <Text style={[styles.date, { color: theme.colors.text.tertiary }]}>{event.date}</Text>
              <Text style={[styles.title, { color: theme.colors.text.primary }]}>
                {event.title}
              </Text>
              {event.subtitle ? (
                <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
                  {event.subtitle}
                </Text>
              ) : null}
            </View>
          </View>
        );

        if (!event.onPress) {
          return (
            <View key={event.id} style={!isLast && styles.spacer}>
              {content}
            </View>
          );
        }

        return (
          <Pressable
            key={event.id}
            onPress={event.onPress}
            accessibilityRole="button"
            accessibilityLabel={event.subtitle ? `${event.title}, ${event.subtitle}` : event.title}
            style={({ pressed }) => [!isLast && styles.spacer, pressed && { opacity: 0.8 }]}
          >
            {content}
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  spacer: {
    marginBottom: 0,
  },
  row: {
    flexDirection: 'row',
  },
  rail: {
    alignItems: 'center',
    width: 20,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  content: {
    flex: 1,
    paddingLeft: spacing.sm,
    paddingBottom: spacing.lg,
  },
  date: {
    fontSize: type.caption.fontSize,
    lineHeight: type.caption.lineHeight,
    marginBottom: 2,
  },
  title: {
    fontSize: type.bodyL.fontSize,
    lineHeight: type.bodyL.lineHeight,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
    marginTop: 2,
  },
});
