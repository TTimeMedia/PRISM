import React from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  PRISMEmptyState,
  PRISMErrorState,
  PRISMSkeleton,
  PRISMTimeline,
  fontFamily,
  fontWeight,
  spacing,
  type,
  useTheme,
} from '@prism/ui';
import { ScreenGlow } from '../../../components/home';
import { TopBar } from '../../../components/home/TopBar';
import { useTimelineEvents } from '../../../lib/journey/timelineQuery';
import { recordHref } from '../../../lib/journey/recordHref';
import { eventColor } from '../eventDisplay';
import { EntryImage } from '../components/EntryImage';
import { TimelinePrompts } from '../components/TimelinePrompts';

/**
 * The YOU tab's home: your Timeline (Screen 42). Settings and the rest live
 * behind the menu button. Tapping an event opens its original record
 * (Screen 43) — Timeline never duplicates data, it's a view. There is no
 * dedicated Injection Detail screen in the P0 screen inventory (only
 * Injection History/Log Injection), so an injection event routes to
 * Injection History — the closest real view of that record. See
 * docs/DECISIONS.md § JOURNEY.
 */
export function TimelineScreen() {
  const theme = useTheme();
  const { data: events, isLoading, isError, refetch } = useTimelineEvents();

  const count = events?.length ?? 0;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <ScreenGlow colors={['violet', 'pink']} />
      <TopBar title="You" />
      <View style={styles.header}>
        <Text
          accessibilityRole="header"
          style={[styles.title, { color: theme.colors.text.primary }]}
        >
          Your timeline
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
          {count > 0
            ? `${count} thing${count === 1 ? '' : 's'}, in order`
            : 'Everything you add, in order.'}
        </Text>
      </View>
      {isLoading ? (
        <View style={styles.content}>
          <View style={styles.skeletons}>
            <PRISMSkeleton height={56} />
            <PRISMSkeleton height={56} />
            <PRISMSkeleton height={56} />
          </View>
        </View>
      ) : isError ? (
        <View style={styles.content}>
          <PRISMErrorState onRetry={() => refetch()} />
        </View>
      ) : events && events.length > 0 ? (
        <View style={styles.content}>
          <TimelinePrompts variant="strip" />
          <PRISMTimeline
            events={events.map((event) => ({
              id: event.id,
              color: eventColor(theme, event.moduleKey),
              title: event.title,
              subtitle: event.subtitle,
              date: formatEventDate(event.at),
              media: event.imagePath ? (
                <EntryImage path={event.imagePath} label={event.title} />
              ) : undefined,
              onPress: () => router.push(recordHref(event.moduleKey, event.sourceId)),
            }))}
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <PRISMEmptyState
            title="Your story builds itself."
            subtitle="Milestones, journal entries, appointments, doses and injections all land here, in order. Add one to begin."
          />
          <TimelinePrompts variant="list" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function formatEventDate(at: string): string {
  return new Date(at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: type.displayL.fontSize,
    lineHeight: type.displayL.lineHeight,
    fontWeight: fontWeight.bold as '700',
  },
  subtitle: {
    fontSize: type.bodyM.fontSize,
    lineHeight: type.bodyM.lineHeight,
    marginTop: spacing.xs,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  skeletons: {
    gap: spacing.sm,
  },
});
