import React from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ArrowLeft, Plus } from 'lucide-react-native';
import {
  PRISMEmptyState,
  PRISMErrorState,
  PRISMHeader,
  PRISMIconButton,
  PRISMMilestone,
  PRISMSkeleton,
  spacing,
  useTheme,
} from '@prism/ui';
import { useMilestones } from '../../../lib/journey/queries';
import { milestoneIconComponent } from '../milestoneIcons';

/** Screen 44 — Milestones. Displayed chronologically, most recent first. */
export function MilestonesScreen() {
  const theme = useTheme();
  const { data: milestones, isLoading, isError, refetch } = useMilestones();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRISMHeader
        title="Milestones"
        leading={
          <PRISMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
        trailing={
          <PRISMIconButton
            accessibilityLabel="Add milestone"
            onPress={() => router.push('/journey/milestones/add')}
          >
            <Plus size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        {isLoading ? (
          <View style={styles.skeletons}>
            <PRISMSkeleton height={72} />
            <PRISMSkeleton height={72} />
          </View>
        ) : isError ? (
          <PRISMErrorState onRetry={() => refetch()} />
        ) : (milestones ?? []).length === 0 ? (
          <PRISMEmptyState
            title="No milestones yet."
            subtitle="Suggested milestones are waiting whenever you're ready — or create your own."
            action={{
              label: 'Add milestone',
              onPress: () => router.push('/journey/milestones/add'),
            }}
          />
        ) : (
          <View style={styles.list}>
            {(milestones ?? []).map((milestone) => (
              <PRISMMilestone
                key={milestone.id}
                icon={milestoneIconComponent(milestone.icon, theme.spectrum.violet)}
                title={milestone.title}
                date={formatDate(milestone.date)}
                description={milestone.description ?? undefined}
                onPress={() => router.push(`/journey/milestones/${milestone.id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function formatDate(date: string): string {
  return new Date(`${date}T12:00:00.000Z`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
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
  list: {
    gap: spacing.sm,
  },
});
