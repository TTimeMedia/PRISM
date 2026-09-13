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
import type { Appointment } from '@prism/types';
import { useAppointments } from '../../../lib/care/queries';

/** Screen 31 — Appointments. Upcoming shown first. */
export function AppointmentsScreen() {
  const theme = useTheme();
  const { data: appointments, isLoading, isError, refetch } = useAppointments();

  const now = new Date().toISOString();
  const upcoming = (appointments ?? []).filter((a) => a.starts_at >= now);
  const past = (appointments ?? [])
    .filter((a) => a.starts_at < now)
    .sort((a, b) => (a.starts_at < b.starts_at ? 1 : -1));

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRISMHeader
        title="Appointments"
        leading={
          <PRISMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
        trailing={
          <PRISMIconButton
            accessibilityLabel="Add appointment"
            onPress={() => router.push('/care/appointments/add')}
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
        ) : (appointments ?? []).length === 0 ? (
          <PRISMEmptyState
            title="No appointments yet."
            subtitle="Add one whenever you're ready."
            action={{
              label: 'Add appointment',
              onPress: () => router.push('/care/appointments/add'),
            }}
          />
        ) : (
          <>
            <PRISMSection title="Upcoming">
              {upcoming.length === 0 ? null : (
                <View style={styles.list}>
                  {upcoming.map((appointment) => (
                    <AppointmentRow key={appointment.id} appointment={appointment} />
                  ))}
                </View>
              )}
            </PRISMSection>
            {past.length > 0 ? (
              <PRISMSection title="Past">
                <View style={styles.list}>
                  {past.map((appointment) => (
                    <AppointmentRow key={appointment.id} appointment={appointment} />
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

function AppointmentRow({ appointment }: { appointment: Appointment }) {
  const subtitleParts = [
    appointment.provider,
    new Date(appointment.starts_at).toLocaleString(),
  ].filter(Boolean);
  return (
    <PRISMListItem
      title={appointment.title}
      subtitle={subtitleParts.join(' · ')}
      onPress={() => router.push(`/care/appointments/${appointment.id}`)}
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
