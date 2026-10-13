import React from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ArrowLeft, Plus } from 'lucide-react-native';
import {
  PRIZMEmptyState,
  PRIZMErrorState,
  PRIZMHeader,
  PRIZMIconButton,
  PRIZMMilestone,
  PRIZMSkeleton,
  spacing,
  useTheme,
} from '@prizm/ui';
import { useMilestones } from '../../../lib/journey/queries';
import { milestoneIconComponent } from '../milestoneIcons';

/** Screen 44 — Milestones. Displayed chronologically, most recent first. */
export function MilestonesScreen() {
  const theme = useTheme();
  const { data: milestones, isLoading, isError, refetch } = useMilestones();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRIZMHeader
        title="Milestones"
        leading={
          <PRIZMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRIZMIconButton>
        }
        trailing={
          <PRIZMIconButton
            accessibilityLabel="Add milestone"
            onPress={() => router.push('/journey/milestones/add')}
          >
            <Plus size={22} color={theme.colors.text.primary} />
          </PRIZMIconButton>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        {isLoading ? (
          <View style={styles.skeletons}>
            <PRIZMSkeleton height={72} />
            <PRIZMSkeleton height={72} />
          </View>
        ) : isError ? (
          <PRIZMErrorState onRetry={() => refetch()} />
        ) : (milestones ?? []).length === 0 ? (
          <PRIZMEmptyState
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
              <PRIZMMilestone
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
