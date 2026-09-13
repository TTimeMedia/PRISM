import React from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Compass, NotebookPen, Sparkles } from 'lucide-react-native';
import {
  PRISMCard,
  PRISMEmptyState,
  PRISMErrorState,
  PRISMHeader,
  PRISMSkeleton,
  spacing,
  type,
  useTheme,
} from '@prism/ui';
import { useModules } from '../../../lib/profile/queries';
import { useMilestones, useJournalEntries } from '../../../lib/journey/queries';

interface JourneySection {
  key: 'timeline' | 'milestones' | 'journal';
  title: string;
  icon: React.ReactNode;
  subtitle: string;
  href: '/journey/timeline' | '/journey/milestones' | '/journey/journal';
}

/**
 * Screen 41 — Journey Home. "24 moments recorded," never "24
 * achievements" — see docs/SCREEN_BIBLE.md Screen 41. Memories is P1 and
 * has no screen yet (docs/DECISIONS.md § Customize PRISM and Quick Add
 * expose only P0 modules until P1 ships).
 */
export function JourneyHomeScreen() {
  const theme = useTheme();
  const { data: modules, isLoading: modulesLoading, isError, refetch } = useModules();
  const enabled = new Set(modules?.filter((m) => m.enabled).map((m) => m.module_key));

  const milestones = useMilestones();
  const journalEntries = useJournalEntries();

  const loading =
    modulesLoading ||
    (enabled.has('milestones') && milestones.isLoading) ||
    (enabled.has('journal') && journalEntries.isLoading);

  const momentCount = (milestones.data?.length ?? 0) + (journalEntries.data?.length ?? 0);

  const sections: JourneySection[] = [
    {
      key: 'timeline',
      title: 'Timeline',
      icon: <Compass size={20} color={theme.spectrum.cyan} />,
      subtitle: 'Your story, in order.',
      href: '/journey/timeline',
    },
  ];
  if (enabled.has('milestones')) {
    const count = milestones.data?.length ?? 0;
    sections.push({
      key: 'milestones',
      title: 'Milestones',
      icon: <Sparkles size={20} color={theme.spectrum.violet} />,
      subtitle: count > 0 ? `${count} recorded` : 'Nothing recorded yet.',
      href: '/journey/milestones',
    });
  }
  if (enabled.has('journal')) {
    const count = journalEntries.data?.length ?? 0;
    sections.push({
      key: 'journal',
      title: 'Journal',
      icon: <NotebookPen size={20} color={theme.spectrum.pink} />,
      subtitle: count > 0 ? `${count} entries` : 'Nothing written yet.',
      href: '/journey/journal',
    });
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRISMHeader
        title="Your journey."
        subtitle={momentCount > 0 ? `${momentCount} moments recorded` : undefined}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <View style={styles.skeletons}>
            <PRISMSkeleton height={72} />
            <PRISMSkeleton height={72} />
          </View>
        ) : isError ? (
          <PRISMErrorState onRetry={() => refetch()} />
        ) : sections.length > 0 ? (
          <View style={styles.cards}>
            {sections.map((section) => (
              <PRISMCard
                key={section.key}
                accessibilityLabel={`${section.title}, ${section.subtitle}`}
                onPress={() => router.push(section.href)}
              >
                <View style={styles.row}>
                  {section.icon}
                  <View style={styles.text}>
                    <Text style={[styles.title, { color: theme.colors.text.primary }]}>
                      {section.title}
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
                      {section.subtitle}
                    </Text>
                  </View>
                </View>
              </PRISMCard>
            ))}
          </View>
        ) : (
          <PRISMEmptyState
            title="Your story starts wherever you decide."
            subtitle="Nothing recorded yet."
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  skeletons: {
    gap: spacing.sm,
  },
  cards: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.smd,
  },
  text: {
    flex: 1,
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
