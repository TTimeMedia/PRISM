import React from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Pill, Syringe, CalendarDays } from 'lucide-react-native';
import {
  PRISMCard,
  PRISMEmptyState,
  PRISMErrorState,
  PRISMHeader,
  PRISMSkeleton,
  spacing,
  type,
  useTheme,
} from '@prism/ui';
import { useModules } from '../../../lib/profile/queries';
import { useAppointments, useInjections, useMedications } from '../../../lib/care/queries';
import { isMedicationActive } from '../medicationDisplay';

interface CareSection {
  key: 'medications' | 'injections' | 'appointments';
  title: string;
  icon: React.ReactNode;
  count: number;
  summary: string;
  href: '/care/medications' | '/care/injections' | '/care/appointments';
}

/**
 * Screen 23 — Care Home. Only enabled modules get a section, and a
 * section with no data is never shown as an oversized empty dashboard —
 * see docs/SCREEN_BIBLE.md §CARE Personalization. Labs/Procedures are P1
 * and have no screens yet (docs/DECISIONS.md § Customize PRISM and Quick
 * Add expose only P0 modules until P1 ships).
 */
export function CareHomeScreen() {
  const theme = useTheme();
  const { data: modules, isLoading: modulesLoading, isError, refetch } = useModules();
  const enabled = new Set(modules?.filter((m) => m.enabled).map((m) => m.module_key));

  const medications = useMedications();
  const injections = useInjections();
  const appointments = useAppointments();

  const loading =
    modulesLoading ||
    (enabled.has('medications') && medications.isLoading) ||
    (enabled.has('injections') && injections.isLoading) ||
    (enabled.has('appointments') && appointments.isLoading);

  const sections: CareSection[] = [];
  if (enabled.has('medications')) {
    const active = (medications.data ?? []).filter((m) => isMedicationActive(m.end_date));
    sections.push({
      key: 'medications',
      title: 'Medications',
      icon: <Pill size={20} color={theme.spectrum.cyan} />,
      count: active.length,
      summary:
        active.length > 0
          ? `${active.length} active medication${active.length === 1 ? '' : 's'}`
          : 'Nothing added yet.',
      href: '/care/medications',
    });
  }
  if (enabled.has('injections')) {
    const count = injections.data?.length ?? 0;
    sections.push({
      key: 'injections',
      title: 'Injections',
      icon: <Syringe size={20} color={theme.spectrum.violet} />,
      count,
      summary: count > 0 ? `${count} logged` : 'Nothing logged yet.',
      href: '/care/injections',
    });
  }
  if (enabled.has('appointments')) {
    const upcoming = (appointments.data ?? []).filter(
      (a) => a.starts_at >= new Date().toISOString(),
    );
    sections.push({
      key: 'appointments',
      title: 'Appointments',
      icon: <CalendarDays size={20} color={theme.spectrum.yellow} />,
      count: upcoming.length,
      summary: upcoming.length > 0 ? `${upcoming.length} upcoming` : 'Nothing scheduled.',
      href: '/care/appointments',
    });
  }
  // Sections with real activity surface first — see §CARE Personalization.
  sections.sort((a, b) => b.count - a.count);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRISMHeader title="Care." subtitle="Organized, not clinical." />
      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <View style={styles.skeletons}>
            <PRISMSkeleton height={72} />
            <PRISMSkeleton height={72} />
          </View>
        ) : isError ? (
          <PRISMErrorState onRetry={() => refetch()} />
        ) : sections.length > 0 ? (
          <View style={styles.cards}>
            {sections.map((section) => (
              <PRISMCard
                key={section.key}
                accessibilityLabel={`${section.title}, ${section.summary}`}
                onPress={() => router.push(section.href)}
              >
                <View style={styles.row}>
                  {section.icon}
                  <View style={styles.text}>
                    <Text style={[styles.title, { color: theme.colors.text.primary }]}>
                      {section.title}
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
                      {section.summary}
                    </Text>
                  </View>
                </View>
              </PRISMCard>
            ))}
          </View>
        ) : (
          <PRISMEmptyState
            title="Nothing added yet."
            subtitle="You can add something whenever you need to."
          />
        )}
      </ScrollView>
    </View>
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
  cards: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.smd,
  },
  text: {
    flex: 1,
  },
  title: {
    fontSize: type.bodyL.fontSize,
    lineHeight: type.bodyL.lineHeight,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
    marginTop: 2,
  },
});
