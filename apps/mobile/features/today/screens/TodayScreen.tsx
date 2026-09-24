import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, type Href } from 'expo-router';
import { NotebookPen, Pill, Sparkles, Syringe } from 'lucide-react-native';
import {
  PRISMButton,
  PRISMCard,
  PRISMEmptyState,
  PRISMErrorState,
  PRISMHeader,
  PRISMListItem,
  PRISMSection,
  PRISMSkeleton,
  spacing,
  type,
  useTheme,
} from '@prism/ui';
import { useProfile } from '../../../lib/profile/queries';
import { useTodayItems } from '../../../lib/today/queries';
import {
  comingUpItemHref,
  formatComingUpWhen,
  selectComingUpItems,
} from '../../../lib/today/comingUp';
import { formatTodayDate, timeOfDayGreeting } from '../greeting';

interface QuickAction {
  key: string;
  label: string;
  href: Href;
  Icon: typeof Pill;
}

/**
 * Static, not personalization-driven — every action stays reachable
 * regardless of which modules are enabled (docs/DECISIONS.md § TODAY):
 * starting to log a medication is how a disabled-but-relevant module
 * would get used, not something to hide because nothing's logged yet.
 * "Log medication" has no medication-agnostic logging screen (unlike
 * Log Injection, which lets you pick the medication inline) — it opens
 * the Medications list to pick which one, reusing that existing screen
 * rather than inventing a new flow.
 */
const QUICK_ACTIONS: QuickAction[] = [
  { key: 'medication', label: 'Log medication', href: '/care/medications', Icon: Pill },
  { key: 'injection', label: 'Log injection', href: '/care/injections/add', Icon: Syringe },
  { key: 'journal', label: 'Journal', href: '/journey/journal/add', Icon: NotebookPen },
  { key: 'milestone', label: 'Milestone', href: '/journey/milestones/add', Icon: Sparkles },
];

/**
 * TODAY — Screen 20. The personalized dashboard, dynamically generated
 * from the personalization engine — never hard-coded. See
 * docs/SCREEN_BIBLE.md Screen 20 and docs/TECHNICAL_BIBLE.md §10.
 *
 * "Coming up" leads the screen — what's next matters most. Below it, cards
 * for anything not already listed there (appointments, recent milestones)
 * open their own record; medications appear only in Coming up, never as
 * cards. "Coming up" is a display-side slice of the same `useTodayItems()`
 * data (lib/today/comingUp.ts): no second query, no invented content.
 */
export function TodayScreen() {
  const theme = useTheme();
  const { data: profile } = useProfile();
  const { data: items, isLoading, isError, refetch } = useTodayItems();

  const name = profile?.display_name?.trim();
  const greeting = name ? `${timeOfDayGreeting()}, ${name}.` : `${timeOfDayGreeting()}.`;
  const comingUp = selectComingUpItems(items ?? []);
  const comingUpIds = new Set(comingUp.map((item) => item.id));
  // Medications live only in Coming up (and their own screens); anything
  // already shown in Coming up isn't repeated as a card below it.
  const feedItems = (items ?? []).filter(
    (item) => item.moduleKey !== 'medications' && !comingUpIds.has(item.id),
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <PRISMHeader title={greeting} subtitle={formatTodayDate()} />
      <ScrollView contentContainerStyle={styles.content}>
        {isLoading ? (
          <View style={styles.skeletons}>
            <PRISMSkeleton height={72} />
            <PRISMSkeleton height={72} />
          </View>
        ) : isError ? (
          <PRISMErrorState onRetry={() => refetch()} />
        ) : (
          <>
            <PRISMSection title="Coming up">
              {comingUp.length > 0 ? (
                <View style={styles.comingUpList}>
                  {comingUp.map((item) => (
                    <PRISMListItem
                      key={item.id}
                      title={item.title}
                      subtitle={formatComingUpWhen(item.at)}
                      onPress={() => router.push(comingUpItemHref(item))}
                    />
                  ))}
                  <PRISMButton
                    label="View all"
                    variant="tertiary"
                    onPress={() => router.push('/journey/timeline')}
                  />
                </View>
              ) : (
                <PRISMEmptyState title="Nothing scheduled." />
              )}
            </PRISMSection>

            {feedItems.length > 0 ? (
              <View style={styles.cards}>
                {feedItems.map((item) => (
                  <PRISMCard
                    key={item.id}
                    accessibilityLabel={item.title}
                    onPress={() => router.push(comingUpItemHref(item))}
                  >
                    <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
                      {item.title}
                    </Text>
                    {item.subtitle ? (
                      <Text style={[styles.cardSubtitle, { color: theme.colors.text.secondary }]}>
                        {item.subtitle}
                      </Text>
                    ) : null}
                  </PRISMCard>
                ))}
              </View>
            ) : comingUp.length === 0 ? (
              <PRISMEmptyState
                title="Nothing urgent today."
                subtitle="Your Prism is here whenever you need it."
              />
            ) : null}

            <PRISMSection title="Quick actions">
              <View style={styles.quickActions}>
                {QUICK_ACTIONS.map(({ key, label, href, Icon }) => (
                  <PRISMCard
                    key={key}
                    accessibilityLabel={label}
                    onPress={() => router.push(href)}
                    style={styles.quickActionCard}
                  >
                    <Icon size={22} color={theme.accent} />
                    <Text
                      style={[styles.quickActionLabel, { color: theme.colors.text.primary }]}
                      numberOfLines={2}
                    >
                      + {label}
                    </Text>
                  </PRISMCard>
                ))}
              </View>
            </PRISMSection>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  skeletons: {
    gap: spacing.sm,
  },
  cards: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  cardTitle: {
    fontSize: type.bodyL.fontSize,
    lineHeight: type.bodyL.lineHeight,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickActionCard: {
    flexBasis: '47%',
    flexGrow: 1,
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  quickActionLabel: {
    fontSize: type.bodyM.fontSize,
    lineHeight: type.bodyM.lineHeight,
    fontWeight: '600',
  },
  comingUpList: {
    gap: spacing.xs,
  },
});
