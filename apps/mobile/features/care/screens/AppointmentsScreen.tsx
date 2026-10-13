import React, { useState } from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ArrowLeft, CalendarArrowDown, MessageCircleQuestion, Plus } from 'lucide-react-native';
import {
  PRIZMButton,
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
import type { Appointment } from '@prizm/types';
import { useAppointments } from '../../../lib/care/queries';
import { useQuestions } from '../../../lib/care/questions';
import { CalendarImportSheet } from '../components/CalendarImportSheet';

/** Screen 31 — Appointments. Upcoming shown first. */
export function AppointmentsScreen() {
  const theme = useTheme();
  const { data: appointments, isLoading, isError, refetch } = useAppointments();
  const [importOpen, setImportOpen] = useState(false);
  const { data: questions } = useQuestions();
  const openQuestions = (questions ?? []).filter((q) => !q.asked).length;

  const now = new Date().toISOString();
  const upcoming = (appointments ?? []).filter((a) => a.starts_at >= now);
  const past = (appointments ?? [])
    .filter((a) => a.starts_at < now)
    .sort((a, b) => (a.starts_at < b.starts_at ? 1 : -1));

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRIZMHeader
        title="Appointments"
        leading={
          <PRIZMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRIZMIconButton>
        }
        trailing={
          <View style={styles.headerActions}>
            <PRIZMIconButton
              accessibilityLabel="Import from calendar"
              onPress={() => setImportOpen(true)}
            >
              <CalendarArrowDown size={22} color={theme.colors.text.primary} />
            </PRIZMIconButton>
            <PRIZMIconButton
              accessibilityLabel="Add appointment"
              onPress={() => router.push('/care/appointments/add')}
            >
              <Plus size={22} color={theme.colors.text.primary} />
            </PRIZMIconButton>
          </View>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <PRIZMListItem
          title="Questions for my doctor"
          subtitle={
            openQuestions === 0
              ? 'Jot one down whenever it comes to mind.'
              : openQuestions === 1
                ? '1 question to ask'
                : `${openQuestions} questions to ask`
          }
          leading={<MessageCircleQuestion size={22} color={theme.colors.text.secondary} />}
          onPress={() => router.push('/care/appointments/questions')}
          showChevron
        />
        {isLoading ? (
          <View style={styles.skeletons}>
            <PRIZMSkeleton height={56} />
            <PRIZMSkeleton height={56} />
          </View>
        ) : isError ? (
          <PRIZMErrorState onRetry={() => refetch()} />
        ) : (appointments ?? []).length === 0 ? (
          <View>
            <PRIZMEmptyState
              title="No appointments yet."
              subtitle="Add one, or bring them in from your calendar."
            />
            <View style={styles.emptyActions}>
              <PRIZMButton
                label="Add appointment"
                onPress={() => router.push('/care/appointments/add')}
              />
              <PRIZMButton
                label="Import from calendar"
                variant="secondary"
                onPress={() => setImportOpen(true)}
              />
            </View>
          </View>
        ) : (
          <>
            <PRIZMSection title="Upcoming">
              {upcoming.length === 0 ? null : (
                <View style={styles.list}>
                  {upcoming.map((appointment) => (
                    <AppointmentRow key={appointment.id} appointment={appointment} />
                  ))}
                </View>
              )}
            </PRIZMSection>
            {past.length > 0 ? (
              <PRIZMSection title="Past">
                <View style={styles.list}>
                  {past.map((appointment) => (
                    <AppointmentRow key={appointment.id} appointment={appointment} />
                  ))}
                </View>
              </PRIZMSection>
            ) : null}
          </>
        )}
      </ScrollView>
      <CalendarImportSheet visible={importOpen} onClose={() => setImportOpen(false)} />
    </View>
  );
}

function AppointmentRow({ appointment }: { appointment: Appointment }) {
  const subtitleParts = [
    appointment.provider,
    new Date(appointment.starts_at).toLocaleString(),
  ].filter(Boolean);
  return (
    <PRIZMListItem
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
  headerActions: {
    flexDirection: 'row',
  },
  emptyActions: {
    gap: spacing.sm,
  },
  skeletons: {
    gap: spacing.sm,
  },
  list: {
    gap: spacing.xs,
  },
});
