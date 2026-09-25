import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { PenLine } from 'lucide-react-native';
import type { JournalEntry, Milestone } from '@prism/types';
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
import { EmptyCard, HeroCard, ScreenGlow, SectionTitle, useTint } from '../../../components/home';
import { MODULE_STYLE } from '../../../components/home/moduleStyle';
import { TopBar } from '../../../components/home/TopBar';
import { EntryImage } from '../components/EntryImage';
import { SUGGESTED_JOURNAL_MOODS } from '../optionLabels';

/** A few gentle ways in. Tapping one starts an entry with that word already in the mood box. */
const CHECK_IN_MOODS = SUGGESTED_JOURNAL_MOODS.slice(0, 6);

function formatDay(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function excerpt(text: string, max = 110): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max).trimEnd()}…` : clean;
}

/**
 * JOURNEY — Screen 41. Where you write and reflect: a gentle way in
 * (how are you today?), your latest entries, and the milestones you've
 * kept. Everything you've done in order, with the month's counts, lives on
 * the YOU tab. "24 moments recorded," never "24 achievements" — see
 * docs/SCREEN_BIBLE.md Screen 41.
 */
export function JourneyHomeScreen() {
  const theme = useTheme();
  const { data: modules, isLoading: modulesLoading, isError, refetch } = useModules();
  const enabled = new Set(modules?.filter((m) => m.enabled).map((m) => m.module_key));
  const journalOn = enabled.has('journal');
  const milestonesOn = enabled.has('milestones');

  const milestones = useMilestones();
  const journalEntries = useJournalEntries();

  const loading =
    modulesLoading ||
    (milestonesOn && milestones.isLoading) ||
    (journalOn && journalEntries.isLoading);
  const entries = [...(journalEntries.data ?? [])].sort((a, b) => (a.date < b.date ? 1 : -1));
  const kept = [...(milestones.data ?? [])].sort((a, b) => (a.date < b.date ? 1 : -1));
  const momentCount = entries.length + kept.length;

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
            {journalOn ? (
              <HeroCard tint="pink" accentTint="violet">
                <Text style={[styles.heroTitle, { color: theme.colors.text.primary }]}>
                  How are you today?
                </Text>
                <Text style={[styles.heroBody, { color: theme.colors.text.secondary }]}>
                  Pick a word to start, or just write. It stays private.
                </Text>
                <View style={styles.moods}>
                  {CHECK_IN_MOODS.map((mood) => (
                    <MoodChip key={mood} label={mood} />
                  ))}
                </View>
                <PRISMButton
                  label="Write an entry"
                  onPress={() => router.push('/journey/journal/add')}
                />
              </HeroCard>
            ) : milestonesOn ? (
              <HeroCard tint="pink" accentTint="violet">
                <Text style={[styles.heroTitle, { color: theme.colors.text.primary }]}>
                  Keep a moment.
                </Text>
                <Text style={[styles.heroBody, { color: theme.colors.text.secondary }]}>
                  A milestone, with a photo if you like. It stays private.
                </Text>
                <PRISMButton
                  label="Add a milestone"
                  onPress={() => router.push('/journey/milestones/add')}
                />
              </HeroCard>
            ) : null}

            {journalOn ? (
              <>
                <SectionTitle
                  title="Recent entries"
                  actionLabel={entries.length > 0 ? 'See all' : undefined}
                  onAction={() => router.push('/journey/journal')}
                  onAdd={() => router.push('/journey/journal/add')}
                  addLabel="Write an entry"
                />
                {entries.length === 0 ? (
                  <EmptyCard
                    icon={MODULE_STYLE.journal.icon}
                    tint="mint"
                    title="Nothing written yet"
                    body="A few words about today is a good start. Only you can read it."
                    primaryLabel="Write an entry"
                    onPrimary={() => router.push('/journey/journal/add')}
                  />
                ) : (
                  <View style={styles.list}>
                    {entries.slice(0, 3).map((entry) => (
                      <EntryCard key={entry.id} entry={entry} />
                    ))}
                  </View>
                )}
              </>
            ) : null}

            {milestonesOn ? (
              <>
                <SectionTitle
                  title="Milestones"
                  actionLabel={kept.length > 0 ? 'See all' : undefined}
                  onAction={() => router.push('/journey/milestones')}
                  onAdd={() => router.push('/journey/milestones/add')}
                  addLabel="Add a milestone"
                />
                {kept.length === 0 ? (
                  <EmptyCard
                    icon={MODULE_STYLE.milestones.icon}
                    tint="pink"
                    title="No milestones yet"
                    body="Mark the moments that matter, with a photo if you like."
                    primaryLabel="Add a milestone"
                    onPrimary={() => router.push('/journey/milestones/add')}
                  />
                ) : (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.momentsScroll}
                    contentContainerStyle={styles.moments}
                  >
                    {kept.slice(0, 8).map((milestone) => (
                      <MilestoneCard key={milestone.id} milestone={milestone} />
                    ))}
                  </ScrollView>
                )}
              </>
            ) : null}

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

function MoodChip({ label }: { label: string }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Start an entry feeling ${label.toLowerCase()}`}
      onPress={() => router.push({ pathname: '/journey/journal/add', params: { mood: label } })}
      style={({ pressed }) => [
        styles.moodChip,
        {
          backgroundColor: theme.colors.field,
          borderColor: theme.colors.fieldBorder,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text style={[styles.moodLabel, { color: theme.colors.text.primary }]}>{label}</Text>
    </Pressable>
  );
}

/** A journal entry as a small card: its date, its first lines, and the mood if there was one. */
function EntryCard({ entry }: { entry: JournalEntry }) {
  const theme = useTheme();
  const colors = useTint('mint');
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${entry.title?.trim() || 'Journal entry'}, ${formatDay(entry.date)}`}
      onPress={() => router.push(`/journey/journal/${entry.id}`)}
      style={({ pressed }) => [
        styles.entry,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border.default,
          opacity: pressed ? 0.9 : 1,
        },
        theme.scheme === 'light' && theme.shadow,
      ]}
    >
      <View style={styles.entryTop}>
        <View style={[styles.entryIcon, { backgroundColor: colors.tile }]}>
          <PenLine size={16} color={theme.colors.text.primary} strokeWidth={2.2} />
        </View>
        <Text style={[styles.entryDate, { color: theme.colors.text.secondary }]}>
          {formatDay(entry.date)}
        </Text>
        {entry.mood ? (
          <View style={[styles.moodPill, { borderColor: theme.colors.border.default }]}>
            <Text style={[styles.moodPillText, { color: theme.colors.text.secondary }]}>
              {entry.mood}
            </Text>
          </View>
        ) : null}
      </View>
      {entry.title?.trim() ? (
        <Text style={[styles.entryTitle, { color: theme.colors.text.primary }]} numberOfLines={1}>
          {entry.title.trim()}
        </Text>
      ) : null}
      <Text style={[styles.entryBody, { color: theme.colors.text.secondary }]} numberOfLines={2}>
        {excerpt(entry.content)}
      </Text>
    </Pressable>
  );
}

/** A kept milestone: its photo if it has one, otherwise a soft colored block. */
function MilestoneCard({ milestone }: { milestone: Milestone }) {
  const theme = useTheme();
  const colors = useTint('pink');
  const Icon = MODULE_STYLE.milestones.icon;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${milestone.title}, ${formatDay(milestone.date)}`}
      onPress={() => router.push(`/journey/milestones/${milestone.id}`)}
      style={({ pressed }) => [
        styles.milestone,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border.default,
          opacity: pressed ? 0.9 : 1,
        },
        theme.scheme === 'light' && theme.shadow,
      ]}
    >
      {milestone.image_path ? (
        <EntryImage path={milestone.image_path} label={milestone.title} height={112} />
      ) : (
        <View style={[styles.milestoneArt, { backgroundColor: colors.tile }]}>
          <Icon size={30} color={theme.colors.text.primary} strokeWidth={1.8} />
        </View>
      )}
      <View style={styles.milestoneText}>
        <Text
          style={[styles.milestoneTitle, { color: theme.colors.text.primary }]}
          numberOfLines={2}
        >
          {milestone.title}
        </Text>
        <Text style={[styles.milestoneDate, { color: theme.colors.text.secondary }]}>
          {formatDay(milestone.date)}
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
  moods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  moodChip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    minHeight: 40,
    justifyContent: 'center',
  },
  moodLabel: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
    fontWeight: fontWeight.medium as '500',
  },
  list: {
    gap: spacing.sm,
  },
  entry: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.xs,
  },
  entryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  entryIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryDate: {
    flex: 1,
    fontSize: type.caption.fontSize,
    lineHeight: type.caption.lineHeight,
    fontWeight: fontWeight.semibold as '600',
  },
  moodPill: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.smd,
    paddingVertical: 2,
  },
  moodPillText: {
    fontSize: type.caption.fontSize,
    lineHeight: type.caption.lineHeight,
  },
  entryTitle: {
    fontFamily: fontFamily.display,
    fontSize: type.bodyL.fontSize,
    lineHeight: type.bodyL.lineHeight,
    fontWeight: fontWeight.semibold as '600',
  },
  entryBody: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
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
  milestone: {
    width: 176,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  milestoneArt: {
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneText: {
    padding: spacing.smd,
    gap: 2,
    minHeight: 72,
  },
  milestoneTitle: {
    fontSize: type.bodyM.fontSize,
    lineHeight: type.bodyM.lineHeight,
    fontWeight: fontWeight.semibold as '600',
  },
  milestoneDate: {
    fontSize: type.caption.fontSize,
    lineHeight: type.caption.lineHeight,
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
