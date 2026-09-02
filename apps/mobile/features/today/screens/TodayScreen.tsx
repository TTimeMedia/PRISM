import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { useProfile } from '../../../lib/profile/queries';
import { useTodayItems } from '../../../lib/today/queries';
import { formatTodayDate, timeOfDayGreeting } from '../greeting';

/**
 * TODAY — Screen 20. The personalized dashboard, dynamically generated
 * from the personalization engine — never hard-coded. See
 * docs/SCREEN_BIBLE.md Screen 20 and docs/TECHNICAL_BIBLE.md §10.
 */
export function TodayScreen() {
  const theme = useTheme();
  const { data: profile } = useProfile();
  const { data: items, isLoading, isError, refetch } = useTodayItems();

  const name = profile?.display_name?.trim();
  const greeting = name ? `${timeOfDayGreeting()}, ${name}.` : `${timeOfDayGreeting()}.`;

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
        ) : items && items.length > 0 ? (
          <View style={styles.cards}>
            {items.map((item) => (
              <PRISMCard key={item.id} accessibilityLabel={item.title}>
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
        ) : (
          <PRISMEmptyState
            title="Nothing urgent today."
            subtitle="Your PRISM is here whenever you need it."
          />
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
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  skeletons: {
    gap: spacing.sm,
  },
  cards: {
    gap: spacing.sm,
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
});
