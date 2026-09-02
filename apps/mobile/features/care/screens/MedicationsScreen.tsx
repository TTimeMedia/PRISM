import React from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ArrowLeft, Plus } from 'lucide-react-native';
import {
  PRISMEmptyState,
  PRISMErrorState,
  PRISMHeader,
  PRISMIconButton,
  PRISMListItem,
  PRISMSection,
  PRISMSkeleton,
  spacing,
  useTheme,
} from '@prism/ui';
import type { Medication } from '@prism/types';
import { useMedications } from '../../../lib/care/queries';
import { describeFrequency, isMedicationActive } from '../medicationDisplay';

/** Screen 24 — Medications. Active cards first; paused ones stay reachable, never hidden entirely. */
export function MedicationsScreen() {
  const theme = useTheme();
  const { data: medications, isLoading, isError, refetch } = useMedications();

  const active = (medications ?? []).filter((m) => isMedicationActive(m.end_date));
  const paused = (medications ?? []).filter((m) => !isMedicationActive(m.end_date));

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRISMHeader
        title="Medications"
        leading={
          <PRISMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
        trailing={
          <PRISMIconButton
            accessibilityLabel="Add medication"
            onPress={() => router.push('/care/medications/add')}
          >
            <Plus size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        {isLoading ? (
          <View style={styles.skeletons}>
            <PRISMSkeleton height={56} />
            <PRISMSkeleton height={56} />
          </View>
        ) : isError ? (
          <PRISMErrorState onRetry={() => refetch()} />
        ) : (medications ?? []).length === 0 ? (
          <PRISMEmptyState
            title="No medications yet."
            subtitle="Add one whenever you're ready."
            action={{
              label: 'Add medication',
              onPress: () => router.push('/care/medications/add'),
            }}
          />
        ) : (
          <>
            <PRISMSection title="Active">
              {active.length === 0 ? null : (
                <View style={styles.list}>
                  {active.map((medication) => (
                    <MedicationRow key={medication.id} medication={medication} />
                  ))}
                </View>
              )}
            </PRISMSection>
            {paused.length > 0 ? (
              <PRISMSection title="Paused">
                <View style={styles.list}>
                  {paused.map((medication) => (
                    <MedicationRow key={medication.id} medication={medication} />
                  ))}
                </View>
              </PRISMSection>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function MedicationRow({ medication }: { medication: Medication }) {
  const subtitleParts = [
    medication.dosage_text,
    describeFrequency(medication.frequency_type, medication.frequency_config),
  ].filter(Boolean);
  return (
    <PRISMListItem
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
