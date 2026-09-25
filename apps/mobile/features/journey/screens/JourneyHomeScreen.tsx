import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Compass, PenLine } from 'lucide-react-native';
import type { TimelineEvent } from '@prism/types';
import {
  PRISMButton,
  PRISMErrorState,
  PRISMSkeleton,
  fontFamily,
  fontWeight,
  radius,
  spacing,
  type,
  useTheme,
} from '@prism/ui';
import { useModules } from '../../../lib/profile/queries';
import { useJournalEntries, useMilestones } from '../../../lib/journey/queries';
import { useTimelineEvents } from '../../../lib/journey/timelineQuery';
import { recordHref } from '../../../lib/journey/recordHref';
import { HeroCard, ItemRow, ScreenGlow, SectionTitle, useTint } from '../../../components/home';
import { MODULE_STYLE, moduleStyle } from '../../../components/home/moduleStyle';
import { TopBar } from '../../../components/home/TopBar';
import { EntryImage } from '../components/EntryImage';

function formatDay(at: string): string {
  return new Date(at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/**
 * JOURNEY — Screen 41. Your story: a warm prompt to add to it, the moments
 * you've already kept (with photos), and the timeline. "24 moments
 * recorded," never "24 achievements" — see docs/SCREEN_BIBLE.md Screen 41.
 * A feature that's off says so and can be turned on right here.
 */
export function JourneyHomeScreen() {
  const theme = useTheme();
  const { data: modules, isLoading: modulesLoading, isError, refetch } = useModules();
  const enabled = new Set(modules?.filter((m) => m.enabled).map((m) => m.module_key));
  const journalOn = enabled.has('journal');
  const milestonesOn = enabled.has('milestones');

  const milestones = useMilestones();
  const journalEntries = useJournalEntries();
  const timeline = useTimelineEvents();

  const loading = modulesLoading || timeline.isLoading;
  const momentCount = (milestones.data?.length ?? 0) + (journalEntries.data?.length ?? 0);
  const events = timeline.data ?? [];
  // The moments that are stories in themselves: milestones and journal entries.
  const moments = events.filter((e) => e.moduleKey === 'milestones' || e.moduleKey === 'journal');

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <ScreenGlow colors={['pink', 'violet']} />
      <TopBar title="Journey" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text
            accessibilityRole="header"
            style={[styles.title, { color: theme.colors.text.primary }]}
          >
            Your journey
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            {momentCount > 0
              ? `${momentCount} moment${momentCount === 1 ? '' : 's'} recorded`
              : 'Your story starts wherever you decide.'}
          </Text>
        </View>

        {loading ? (
          <View style={styles.skeletons}>
            <PRISMSkeleton height={168} />
            <PRISMSkeleton height={120} />
          </View>
        ) : isError ? (
          <PRISMErrorState onRetry={() => refetch()} />
        ) : (
          <>
            {journalOn || milestonesOn ? (
              <HeroCard tint="pink" accentTint="violet">
                <Text style={[styles.heroTitle, { color: theme.colors.text.primary }]}>
                  {momentCount > 0 ? 'Add to your story.' : 'Start your story.'}
                </Text>
                <Text style={[styles.heroBody, { color: theme.colors.text.secondary }]}>
                  A few words about today, or a moment you want to keep. It stays private.
                </Text>
                <View style={styles.heroActions}>
                  {journalOn ? (
                    <View style={styles.heroPrimary}>
                      <PRISMButton
                        label="Write an entry"
                        onPress={() => router.push('/journey/journal/add')}
                      />
                    </View>
                  ) : null}
                  {milestonesOn ? (
                    <View style={styles.heroPrimary}>
                      <PRISMButton
                        label="Add a milestone"
                        variant={journalOn ? 'secondary' : 'primary'}
                        onPress={() => router.push('/journey/milestones/add')}
                      />
                    </View>
                  ) : null}
                </View>
              </HeroCard>
            ) : null}

            {moments.length > 0 ? (
              <>
                <SectionTitle
                  title="Recent moments"
                  actionLabel="Timeline"
                  onAction={() => router.push('/you')}
                />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.momentsScroll}
                  contentContainerStyle={styles.moments}
                >
                  {moments.slice(0, 8).map((event) => (
                    <MomentCard key={event.id} event={event} />
                  ))}
                </ScrollView>
              </>
            ) : null}

            <SectionTitle title="Your story" />
            <View style={styles.list}>
              <ItemRow
                icon={Compass}
                tint="cyan"
                title="Timeline"
                subtitle={
                  events.length > 0
                    ? `${events.length} thing${events.length === 1 ? '' : 's'}, in order`
                    : 'Everything you add, in order.'
                }
                onPress={() => router.push('/you')}
              />
              {milestonesOn ? (
                <ItemRow
                  icon={MODULE_STYLE.milestones.icon}
                  tint="pink"
                  title="Milestones"
                  subtitle={
                    (milestones.data?.length ?? 0) > 0
                      ? `${milestones.data?.length} kept`
                      : 'Nothing kept yet. Tap to add one.'
                  }
                  onPress={() => router.push('/journey/milestones')}
                />
              ) : null}
              {journalOn ? (
                <ItemRow
                  icon={MODULE_STYLE.journal.icon}
                  tint="mint"
                  title="Journal"
                  subtitle={
                    (journalEntries.data?.length ?? 0) > 0
                      ? `${journalEntries.data?.length} entries`
                      : 'Nothing written yet. Tap to start.'
                  }
                  onPress={() => router.push('/journey/journal')}
                />
              ) : null}
            </View>

            {!journalOn && !milestonesOn ? (
              <View style={styles.hint}>
                <Text style={[styles.hintText, { color: theme.colors.text.secondary }]}>
                  Milestones and Journal aren&apos;t switched on, so there&apos;s nothing to add to
                  yet.
                </Text>
                <PRISMButton
                  label="Choose what shows"
                  variant="secondary"
                  onPress={() => router.push('/you/customize')}
                />
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/** One kept moment as a small story card: a photo if there is one, otherwise a colored block. */
function MomentCard({ event }: { event: TimelineEvent }) {
  const theme = useTheme();
  const style = moduleStyle(event.moduleKey);
  const colors = useTint(style.tint);
  const Icon = event.moduleKey === 'journal' ? PenLine : style.icon;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${event.title}, ${formatDay(event.at)}`}
      onPress={() => router.push(recordHref(event.moduleKey, event.sourceId))}
      style={({ pressed }) => [
        styles.moment,
        {
          backgroundColor: theme.colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.88 : 1,
        },
        theme.scheme === 'light' && theme.shadow,
      ]}
    >
      {event.imagePath ? (
        <EntryImage path={event.imagePath} label={event.title} height={104} />
      ) : (
        <View style={[styles.momentArt, { backgroundColor: colors.tile }]}>
          <Icon size={30} color={theme.colors.text.primary} strokeWidth={1.8} />
        </View>
      )}
      <View style={styles.momentText}>
        <Text style={[styles.momentTitle, { color: theme.colors.text.primary }]} numberOfLines={2}>
          {event.title}
        </Text>
        <Text style={[styles.momentDate, { color: theme.colors.text.secondary }]}>
          {formatDay(event.at)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
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
  skeletons: {
    gap: spacing.sm,
  },
  heroTitle: {
    fontFamily: fontFamily.display,
    fontSize: type.headingXL.fontSize + 2,
    lineHeight: type.headingXL.lineHeight + 4,
    fontWeight: fontWeight.bold as '700',
  },
  heroBody: {
    fontSize: type.bodyM.fontSize,
    lineHeight: type.bodyM.lineHeight,
  },
  heroActions: {
    gap: spacing.smd,
    marginTop: spacing.sm,
  },
  heroPrimary: {
    alignSelf: 'stretch',
  },
  momentsScroll: {
    flexGrow: 0,
  },
  moments: {
    alignItems: 'flex-start',
    gap: spacing.smd,
    paddingRight: spacing.lg,
    paddingBottom: spacing.xs,
  },
  moment: {
    width: 176,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  momentArt: {
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
  },
  momentText: {
    padding: spacing.smd,
    gap: 2,
    minHeight: 72,
  },
  momentTitle: {
    fontSize: type.bodyM.fontSize,
    lineHeight: type.bodyM.lineHeight,
    fontWeight: fontWeight.semibold as '600',
  },
  momentDate: {
    fontSize: type.caption.fontSize,
    lineHeight: type.caption.lineHeight,
  },
  list: {
    gap: spacing.sm,
  },
  hint: {
    gap: spacing.smd,
    marginTop: spacing.lg,
  },
  hintText: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
  },
});
