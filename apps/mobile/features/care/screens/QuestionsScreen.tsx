import React from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import {
  PRISMErrorState,
  PRISMHeader,
  PRISMIconButton,
  PRISMSection,
  PRISMSkeleton,
  spacing,
  type,
  useTheme,
} from '@prism/ui';
import type { Appointment } from '@prism/types';
import { useAppointments } from '../../../lib/care/queries';
import { nextAppointment, questionsFor, useQuestions } from '../../../lib/care/questions';
import { QuestionsList } from '../components/QuestionsList';

/**
 * Questions for my doctor: everything still to ask, by appointment. New
 * questions here aren't tied to a visit, so they go to whichever is next.
 */
export function QuestionsScreen() {
  const theme = useTheme();
  const { data: appointments } = useAppointments();
  const { data: questions, isLoading, isError, refetch } = useQuestions();
  const next = nextAppointment(appointments);
  const later = (appointments ?? [])
    .filter((a) => a.id !== next?.id && new Date(a.starts_at).getTime() >= Date.now())
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
    .filter((a) => (questions ?? []).some((q) => q.appointment_id === a.id));

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRISMHeader
        title="Questions for my doctor"
        leading={
          <PRISMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.intro, { color: theme.colors.text.secondary }]}>
          Write questions down as they come up. They wait on your next appointment, so nothing gets
          forgotten in the room. Tick them off once they&apos;re asked.
        </Text>
        {isLoading ? (
          <PRISMSkeleton height={120} />
        ) : isError ? (
          <PRISMErrorState onRetry={() => refetch()} />
        ) : (
          <>
            <PRISMSection title={next ? `Next visit · ${visitLabel(next)}` : 'For your next visit'}>
              <QuestionsList
                questions={
                  next
                    ? questionsFor(next.id, questions, next.id)
                    : (questions ?? []).filter((q) => q.appointment_id === null)
                }
                appointmentId={null}
              />
            </PRISMSection>
            {later.map((appointment) => (
              <PRISMSection key={appointment.id} title={visitLabel(appointment)}>
                <QuestionsList
                  questions={(questions ?? []).filter((q) => q.appointment_id === appointment.id)}
                  appointmentId={appointment.id}
                />
              </PRISMSection>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function visitLabel(appointment: Appointment): string {
  const date = new Date(appointment.starts_at).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  return `${appointment.title}, ${date}`;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md },
  intro: { fontSize: type.bodyM.fontSize, lineHeight: type.bodyM.lineHeight },
});
