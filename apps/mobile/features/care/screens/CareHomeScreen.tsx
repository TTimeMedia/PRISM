import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  PRISMButton,
  PRISMErrorState,
  PRISMSkeleton,
  fontFamily,
  fontWeight,
  spacing,
  type,
  useTheme,
} from '@prism/ui';
import { useModules } from '../../../lib/profile/queries';
import { useAppointments, useMedications } from '../../../lib/care/queries';
import { resolveNextMedicationOccurrence } from '../../../lib/reminders/scheduleResolution';
import { formatComingUpWhen } from '../../../lib/today/comingUp';
import {
  EmptyCard,
  HeroCard,
  ItemRow,
  ScreenGlow,
  SectionTitle,
  StatChip,
} from '../../../components/home';
import { MODULE_STYLE } from '../../../components/home/moduleStyle';
import { TopBar } from '../../../components/home/TopBar';
import { CalendarImportSheet } from '../components/CalendarImportSheet';
import { describeFrequency, isMedicationActive } from '../medicationDisplay';

/**
 * CARE — Screen 22. Your care, organized by feature. Each feature that's on
 * gets its own block: a look at what's in it, and one obvious button to add
 * to it. A feature that's off says so and can be turned on right here, so
 * nothing is hidden where you can't find it. Only what's real is shown —
 * see docs/SCREEN_BIBLE.md §CARE Personalization.
 */
export function CareHomeScreen() {
  const theme = useTheme();
  const { data: modules, isLoading: modulesLoading, isError, refetch } = useModules();
  const enabled = new Set(modules?.filter((m) => m.enabled).map((m) => m.module_key));

  const [importOpen, setImportOpen] = useState(false);
  const medications = useMedications();
  const appointments = useAppointments();

  const loading =
    modulesLoading ||
    (enabled.has('medications') && medications.isLoading) ||
    (enabled.has('appointments') && appointments.isLoading);

  const nowIso = new Date().toISOString();
  const activeMeds = (medications.data ?? []).filter((m) => isMedicationActive(m.end_date));
  const upcoming = (appointments.data ?? []).filter((a) => a.starts_at >= nowIso);
  const nextAppointment = upcoming[0];

  const anyOn = enabled.has('medications') || enabled.has('appointments');

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <ScreenGlow colors={['mint', 'cyan']} />
      <TopBar title="Care" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text
            accessibilityRole="header"
            style={[styles.title, { color: theme.colors.text.primary }]}
          >
            Care
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            Your care, all in one place.
          </Text>
        </View>

        {loading ? (
          <View style={styles.skeletons}>
            <PRISMSkeleton height={96} />
            <PRISMSkeleton height={160} />
          </View>
        ) : isError ? (
          <PRISMErrorState onRetry={() => refetch()} />
        ) : (
          <>
            {anyOn ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipsScroll}
                contentContainerStyle={styles.chips}
              >
                {enabled.has('medications') ? (
                  <StatChip value={String(activeMeds.length)} label="medications" tint="cyan" />
                ) : null}
                {enabled.has('appointments') ? (
                  <StatChip
                    value={
                      nextAppointment
                        ? (formatComingUpWhen(nextAppointment.starts_at).split(',')[0] ?? '')
                        : 'None'
                    }
                    label="next appointment"
                    tint="yellow"
                  />
                ) : null}
              </ScrollView>
            ) : null}

            {/* Medications */}
            {enabled.has('medications') ? (
              <>
                <SectionTitle
                  title="Medications"
                  actionLabel={activeMeds.length > 0 ? 'See all' : undefined}
                  onAction={() => router.push('/care/medications')}
                  onAdd={() => router.push('/care/medications/add')}
                  addLabel="Add a medication"
                />
                {activeMeds.length === 0 ? (
                  <EmptyCard
                    icon={MODULE_STYLE.medications.icon}
                    tint="cyan"
                    title="No medications yet"
                    body="Add what you take to see your doses on Today and get reminders when you want them."
                    primaryLabel="Add medication"
                    onPrimary={() => router.push('/care/medications/add')}
                  />
                ) : (
                  <View style={styles.list}>
                    {activeMeds.slice(0, 3).map((medication) => {
                      const next = resolveNextMedicationOccurrence(medication);
                      const schedule = describeFrequency(
                        medication.frequency_type,
                        medication.frequency_config,
                      );
                      return (
                        <ItemRow
                          key={medication.id}
                          icon={MODULE_STYLE.medications.icon}
                          tint="cyan"
                          title={medication.name}
                          subtitle={
                            next ? `Next: ${formatComingUpWhen(next.toISOString())}` : schedule
                          }
                          onPress={() => router.push(`/care/medications/${medication.id}`)}
                        />
                      );
                    })}
                  </View>
                )}
              </>
            ) : null}

            {/* Appointments */}
            {enabled.has('appointments') ? (
              <>
                <SectionTitle
                  title="Appointments"
                  actionLabel={upcoming.length > 0 ? 'See all' : undefined}
                  onAction={() => router.push('/care/appointments')}
                  onAdd={() => router.push('/care/appointments/add')}
                  addLabel="Add an appointment"
                />
                {upcoming.length === 0 ? (
                  <EmptyCard
                    icon={MODULE_STYLE.appointments.icon}
                    tint="yellow"
                    title="No appointments coming up"
                    body="Add a visit, or bring them in from your phone's calendar."
                    primaryLabel="Add appointment"
                    onPrimary={() => router.push('/care/appointments/add')}
                    secondaryLabel="Import from calendar"
                    onSecondary={() => setImportOpen(true)}
                  />
                ) : (
                  <View style={styles.list}>
                    {upcoming.slice(0, 3).map((appointment) => (
                      <ItemRow
                        key={appointment.id}
                        icon={MODULE_STYLE.appointments.icon}
                        tint="yellow"
                        title={appointment.title}
                        subtitle={[formatComingUpWhen(appointment.starts_at), appointment.provider]
                          .filter(Boolean)
                          .join(' · ')}
                        onPress={() => router.push(`/care/appointments/${appointment.id}`)}
                      />
                    ))}
                    <PRISMButton
                      label="Import from calendar"
                      variant="tertiary"
                      onPress={() => setImportOpen(true)}
                    />
                  </View>
                )}
              </>
            ) : null}

            {!anyOn ? (
              <View style={styles.hero}>
                <HeroCard tint="mint" accentTint="cyan">
                  <Text style={[styles.heroTitle, { color: theme.colors.text.primary }]}>
                    Care is switched off.
                  </Text>
                  <Text style={[styles.heroBody, { color: theme.colors.text.secondary }]}>
                    Nothing is switched on here yet.
                  </Text>
                  <PRISMButton
                    label="Choose what shows"
                    variant="secondary"
                    onPress={() => router.push('/you/customize')}
                  />
                </HeroCard>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
      <CalendarImportSheet visible={importOpen} onClose={() => setImportOpen(false)} />
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
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: type.displayL.fontSize,
    lineHeight: type.displayL.lineHeight,
    fontWeight: fontWeight.bold as '700',
  },
  subtitle: {
    fontSize: type.bodyM.fontSize,
    lineHeight: type.bodyM.lineHeight,
    marginTop: spacing.xs,
  },
  skeletons: {
    gap: spacing.sm,
  },
  chipsScroll: {
    flexGrow: 0,
  },
  chips: {
    alignItems: 'flex-start',
    gap: spacing.smd,
    paddingRight: spacing.lg,
    paddingBottom: spacing.xs,
  },
  list: {
    gap: spacing.sm,
  },
  hero: {
    marginTop: spacing.lg,
  },
  heroTitle: {
    fontFamily: fontFamily.display,
    fontSize: type.headingXL.fontSize,
    lineHeight: type.headingXL.lineHeight,
    fontWeight: fontWeight.bold as '700',
  },
  heroBody: {
    fontSize: type.bodyM.fontSize,
    lineHeight: type.bodyM.lineHeight,
  },
});
