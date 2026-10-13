import React from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ArrowLeft, Plus } from 'lucide-react-native';
import {
  PRIZMEmptyState,
  PRIZMErrorState,
  PRIZMHeader,
  PRIZMIconButton,
  PRIZMListItem,
  PRIZMSection,
  PRIZMSkeleton,
  spacing,
  useTheme,
} from '@prizm/ui';
import type { Medication } from '@prizm/types';
import { useMedications } from '../../../lib/care/queries';
import { describeNextDose, isMedicationActive } from '../medicationDisplay';

/** Screen 24 — Medications. Active cards first; paused ones stay reachable, never hidden entirely. */
export function MedicationsScreen() {
  const theme = useTheme();
  const { data: medications, isLoading, isError, refetch } = useMedications();

  const active = (medications ?? []).filter((m) => isMedicationActive(m.end_date));
  const paused = (medications ?? []).filter((m) => !isMedicationActive(m.end_date));

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRIZMHeader
        title="Medications"
        leading={
          <PRIZMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRIZMIconButton>
        }
        trailing={
          <PRIZMIconButton
            accessibilityLabel="Add medication"
            onPress={() => router.push('/care/medications/add')}
          >
            <Plus size={22} color={theme.colors.text.primary} />
          </PRIZMIconButton>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        {isLoading ? (
          <View style={styles.skeletons}>
            <PRIZMSkeleton height={56} />
            <PRIZMSkeleton height={56} />
          </View>
        ) : isError ? (
          <PRIZMErrorState onRetry={() => refetch()} />
        ) : (medications ?? []).length === 0 ? (
          <PRIZMEmptyState
            title="No medications yet."
            subtitle="Add one whenever you're ready."
            action={{
              label: 'Add medication',
              onPress: () => router.push('/care/medications/add'),
            }}
          />
        ) : (
          <>
            <PRIZMSection title="Active">
              {active.length === 0 ? null : (
                <View style={styles.list}>
                  {active.map((medication) => (
                    <MedicationRow key={medication.id} medication={medication} />
                  ))}
                </View>
              )}
            </PRIZMSection>
            {paused.length > 0 ? (
              <PRIZMSection title="Paused">
                <View style={styles.list}>
                  {paused.map((medication) => (
                    <MedicationRow key={medication.id} medication={medication} />
                  ))}
                </View>
              </PRIZMSection>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function MedicationRow({ medication }: { medication: Medication }) {
  const subtitleParts = [medication.dosage_text, describeNextDose(medication)].filter(Boolean);
  return (
    <PRIZMListItem
      title={medication.name}
      subtitle={subtitleParts.join(' · ')}
      onPress={() => router.push(`/care/medications/${medication.id}`)}
    />
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
  list: {
    gap: spacing.xs,
  },
});
