import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Bell, Plus, Sparkles } from 'lucide-react-native';
import {
  PRISMButton,
  PRISMErrorState,
  PRISMSkeleton,
  fontFamily,
  fontWeight,
  radius,
  spacing,
  type,
  useTheme,
} from '@prism/ui';
import { useModules } from '../../../lib/profile/queries';
import { useAppointments, useInjections, useMedications } from '../../../lib/care/queries';
import { resolveNextMedicationOccurrence } from '../../../lib/reminders/scheduleResolution';
import { formatComingUpWhen } from '../../../lib/today/comingUp';
import {
  HeroCard,
  ItemRow,
  ScreenGlow,
  SectionTitle,
  StatChip,
  useTint,
} from '../../../components/home';
import { MODULE_STYLE } from '../../../components/home/moduleStyle';
import { TopBar } from '../../../components/home/TopBar';
import { CalendarImportSheet } from '../components/CalendarImportSheet';
import { describeFrequency, isMedicationActive } from '../medicationDisplay';
import { INJECTION_SITE_OPTIONS } from '../optionLabels';

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
  const injections = useInjections();
  const appointments = useAppointments();

  const loading =
    modulesLoading ||
    (enabled.has('medications') && medications.isLoading) ||
    (enabled.has('injections') && injections.isLoading) ||
    (enabled.has('appointments') && appointments.isLoading);

  const nowIso = new Date().toISOString();
  const activeMeds = (medications.data ?? []).filter((m) => isMedicationActive(m.end_date));
  const upcoming = (appointments.data ?? []).filter((a) => a.starts_at >= nowIso);
  const injectionCount = injections.data?.length ?? 0;
  const nextAppointment = upcoming[0];
  const siteLabel = (site: string | null) =>
    INJECTION_SITE_OPTIONS.find((option) => option.value === site)?.label;

  const anyOn =
    enabled.has('medications') || enabled.has('injections') || enabled.has('appointments');

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
                {enabled.has('injections') ? (
                  <StatChip
                    value={String(injectionCount)}
                    label="injections logged"
                    tint="violet"
                  />
                ) : null}
              </ScrollView>
            ) : null}

            {/* Medications */}
            {enabled.has('medications') ? (
              <>
                <SectionTitle
                  title="Medications"
                  actionLabel={
                    enabled.has('medications') && activeMeds.length > 0 ? 'See all' : undefined
                  }
                  onAction={() => router.push('/care/medications')}
                />
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
                  <AddButton
                    label={
                      activeMeds.length === 0 ? 'Add your first medication' : 'Add a medication'
                    }
                    onPress={() => router.push('/care/medications/add')}
                  />
                </View>
              </>
            ) : null}

            {/* Appointments */}
            {enabled.has('appointments') ? (
              <>
                <SectionTitle
                  title="Appointments"
                  actionLabel={
                    enabled.has('appointments') && upcoming.length > 0 ? 'See all' : undefined
                  }
                  onAction={() => router.push('/care/appointments')}
                />
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
                  <AddButton
                    label={
                      upcoming.length === 0 ? 'Add your next appointment' : 'Add an appointment'
                    }
                    onPress={() => router.push('/care/appointments/add')}
                  />
                  <PRISMButton
                    label="Import from calendar"
                    variant="tertiary"
                    onPress={() => setImportOpen(true)}
                  />
                </View>
              </>
            ) : null}

            {/* Injections */}
            {enabled.has('injections') ? (
              <>
                <SectionTitle
                  title="Injections"
                  actionLabel={
                    enabled.has('injections') && injectionCount > 0 ? 'History' : undefined
                  }
                  onAction={() => router.push('/care/injections')}
                />
                <View style={styles.list}>
                  {(injections.data ?? []).slice(0, 2).map((injection) => (
                    <ItemRow
                      key={injection.id}
                      icon={MODULE_STYLE.injections.icon}
                      tint="violet"
                      title={siteLabel(injection.site) ?? 'Injection'}
                      subtitle={new Date(injection.injected_at).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                      onPress={() => router.push('/care/injections')}
                    />
                  ))}
                  <AddButton
                    label={injectionCount === 0 ? 'Log your first injection' : 'Log an injection'}
                    onPress={() => router.push('/care/injections/add')}
                  />
                </View>
              </>
            ) : null}

            <SectionTitle title="Make it yours" />
            <View style={styles.list}>
              <ItemRow
                icon={Bell}
                tint="pink"
                title="Set up reminders"
                subtitle="Get a nudge for doses and appointments."
                onPress={() => router.push('/you/notifications')}
              />
              <ItemRow
                icon={Sparkles}
                tint="violet"
                title="Choose what shows here"
                subtitle="Add or remove parts of Prism any time."
                onPress={() => router.push('/you/customize')}
              />
            </View>

            {!anyOn ? (
              <View style={styles.hero}>
                <HeroCard tint="mint" accentTint="cyan">
                  <Text style={[styles.heroTitle, { color: theme.colors.text.primary }]}>
                    Care is switched off.
                  </Text>
                  <Text style={[styles.heroBody, { color: theme.colors.text.secondary }]}>
                    Nothing is switched on here yet. Choose what to show below.
                  </Text>
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

/** The one obvious "+" button at the end of each block. */
function AddButton({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useTheme();
  const colors = useTint('cyan');
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.add,
        { borderColor: colors.border, backgroundColor: colors.soft, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <Plus size={18} color={theme.colors.text.primary} strokeWidth={2.6} />
      <Text style={[styles.addLabel, { color: theme.colors.text.primary }]}>{label}</Text>
    </Pressable>
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
  add: {
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 56,
  },
  addLabel: {
    fontSize: type.bodyM.fontSize,
    lineHeight: type.bodyM.lineHeight,
    fontWeight: fontWeight.semibold as '600',
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
