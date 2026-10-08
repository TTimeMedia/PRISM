import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, MapPin } from 'lucide-react-native';
import { LinkedText, mapsUrl } from '../../../components/LinkedText';
import {
  PRISMButton,
  PRISMErrorState,
  PRISMHeader,
  PRISMIconButton,
  PRISMModal,
  PRISMSection,
  PRISMSkeleton,
  spacing,
  type,
  useTheme,
  useToast,
} from '@prism/ui';
import { useAppointment, useAppointments } from '../../../lib/care/queries';
import { nextAppointment, questionsFor, useQuestions } from '../../../lib/care/questions';
import { QuestionsList } from '../components/QuestionsList';
import { useDeleteAppointment } from '../../../lib/care/mutations';
import { useSettings } from '../../../lib/profile/queries';
import { calendarProvider } from '../../../lib/calendar';

/** Screen 33 — Appointment Detail. */
export function AppointmentDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: appointment, isLoading, isError, refetch } = useAppointment(id);
  const { data: settings } = useSettings();
  const { data: appointments } = useAppointments();
  const { data: questions } = useQuestions();
  const nextId = nextAppointment(appointments)?.id ?? null;
  const isPast = appointment ? new Date(appointment.starts_at).getTime() < Date.now() : false;
  const deleteAppointment = useDeleteAppointment();
  const { showToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [addingToCalendar, setAddingToCalendar] = useState(false);

  const handleDelete = async () => {
    setConfirmDelete(false);
    try {
      await deleteAppointment.mutateAsync(id);
      router.back();
    } catch {
      showToast("Couldn't delete this appointment. Please try again.", 'error');
    }
  };

  const handleAddToCalendar = async () => {
    if (!appointment) return;
    setAddingToCalendar(true);
    try {
      await calendarProvider.addAppointment({
        title: appointment.title,
        location: appointment.location,
        notes: appointment.notes,
        startsAt: appointment.starts_at,
        endsAt: appointment.ends_at,
      });
      showToast('Added to your calendar.', 'success');
    } catch {
      showToast("Couldn't add this to your calendar. Please try again.", 'error');
    } finally {
      setAddingToCalendar(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRISMHeader
        title={appointment?.title ?? 'Appointment'}
        leading={
          <PRISMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
      />
      {isLoading ? (
        <PRISMSkeleton height={56} />
      ) : isError || !appointment ? (
        <PRISMErrorState onRetry={() => refetch()} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <PRISMSection>
            <DetailRow label="Provider" value={appointment.provider} />
            <DetailRow label="Category" value={appointment.category} />
            <DetailRow
              label="Date & time"
              value={formatWhen(appointment.starts_at, appointment.ends_at)}
            />
            <DetailRow label="Location" value={appointment.location} linked />
            {appointment.location ? (
              <Pressable
                accessibilityRole="link"
                onPress={() =>
                  Linking.openURL(mapsUrl(appointment.location!)).catch(() => undefined)
                }
                style={styles.mapLink}
                hitSlop={8}
              >
                <MapPin size={16} color={theme.accentText} />
                <Text style={[styles.mapText, { color: theme.accentText }]}>Open in Maps</Text>
              </Pressable>
            ) : null}
            <DetailRow label="Reminder" value={appointment.reminder_enabled ? 'On' : 'Off'} />
            <DetailRow label="Notes" value={appointment.notes} linked />
          </PRISMSection>
          <PRISMSection title={isPast ? 'Questions you brought' : 'Questions to ask'}>
            <QuestionsList
              questions={questionsFor(id, questions, nextId)}
              appointmentId={id}
              placeholder="Add a question for this visit"
            />
          </PRISMSection>
          <View style={styles.actions}>
            <PRISMButton
              label="Edit"
              variant="secondary"
              onPress={() => router.push(`/care/appointments/${id}/edit`)}
            />
            {settings?.calendar_sync_enabled ? (
              <PRISMButton
                label="Add to calendar"
                variant="secondary"
                loading={addingToCalendar}
                onPress={handleAddToCalendar}
              />
            ) : null}
            <PRISMButton
              label="Delete"
              variant="destructive"
              onPress={() => setConfirmDelete(true)}
            />
          </View>
        </ScrollView>
      )}
      <PRISMModal
        visible={confirmDelete}
        title="Delete this appointment?"
        onRequestClose={() => setConfirmDelete(false)}
        actions={[
          { label: 'Cancel', onPress: () => setConfirmDelete(false), variant: 'secondary' },
          { label: 'Delete', onPress: handleDelete, variant: 'destructive' },
        ]}
      />
    </View>
  );
}

function DetailRow({
  label,
  value,
  linked = false,
}: {
  label: string;
  value?: string | null;
  /** Make web addresses, emails and phone numbers in it tappable. */
  linked?: boolean;
}) {
  const theme = useTheme();
  if (!value) return null;
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: theme.colors.text.tertiary }]}>{label}</Text>
      {linked ? (
        <LinkedText text={value} style={[styles.rowValue, { color: theme.colors.text.primary }]} />
      ) : (
        <Text style={[styles.rowValue, { color: theme.colors.text.primary }]}>{value}</Text>
      )}
    </View>
  );
}

/** "Saturday, October 10 · 2:00 – 3:00 PM". */
function formatWhen(startsAt: string, endsAt: string | null): string {
  const start = new Date(startsAt);
  const day = start.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const time = (d: Date) => d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return endsAt ? `${day} · ${time(start)} – ${time(new Date(endsAt))}` : `${day} · ${time(start)}`;
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
  row: {
    marginBottom: spacing.sm,
  },
  rowLabel: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
  },
  rowValue: {
    fontSize: type.bodyL.fontSize,
    lineHeight: type.bodyL.lineHeight,
  },
  actions: {
    gap: spacing.sm,
  },
  mapLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
  },
  mapText: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
    fontWeight: '600',
  },
});
