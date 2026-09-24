import React, { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { CalendarDays, CalendarPlus, Clock } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getNextOnboardingStep } from '@prism/types';
import {
  appointmentSetupSchema,
  deriveAppointmentTitle,
  type AppointmentSetupInput,
} from '@prism/validation';
import {
  PRISMButton,
  PRISMDateInput,
  PRISMInput,
  PRISMSwitch,
  PRISMTimeInput,
  fontFamily,
  fontWeight,
  radius,
  spacing,
  type,
  useReducedMotion,
  useTheme,
  useToast,
} from '@prism/ui';
import { OnboardingScreenLayout } from '../components/OnboardingScreenLayout';
import { OptionGrid, type OptionGridOption } from '../components/OptionGrid';
import { onboardingStepHref } from '../../../lib/onboarding/routes';
import {
  useProfile,
  useSetModuleEnabled,
  useUpdateProfile,
  useUpdateSettings,
} from '../../../lib/profile/queries';
import { useCreateAppointment } from '../../../lib/care/mutations';
import { calendarProvider } from '../../../lib/calendar';
import { ChipField } from '../../care/components/ChipField';
import { CalendarImportSheet } from '../../care/components/CalendarImportSheet';
import { LocationSearchInput } from '../../../components/LocationSearchInput';
import { SUGGESTED_APPOINTMENT_CATEGORY_OPTIONS } from '../../care/optionLabels';

const INCLUDE_OPTIONS: OptionGridOption[] = [
  { value: 'yes', label: 'Yes, include them', icon: CalendarDays },
  { value: 'no', label: 'Not right now', icon: Clock },
];

/**
 * Screen 15 — Appointments. Asks whether to include appointments in Prism
 * at all, and, if so, whether to sync them to the phone's calendar (opt-in;
 * calendar access is only requested when the switch is turned on). Adding a
 * first appointment here is optional: a real appointment is only created if
 * a date was given, and its title is derived from the type. Only shown when
 * intent included appointments.
 */
export function AppointmentSetupScreen() {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const { showToast } = useToast();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const updateSettings = useUpdateSettings();
  const setModuleEnabled = useSetModuleEnabled();
  const createAppointment = useCreateAppointment();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [include, setInclude] = useState<'yes' | 'no' | null>(null);
  const [sync, setSync] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const syncAvailable = Platform.OS === 'ios';
  const {
    control,
    handleSubmit,
    formState: { isSubmitting: isFormSubmitting },
  } = useForm<AppointmentSetupInput>({
    resolver: zodResolver(appointmentSetupSchema),
    defaultValues: {
      provider: '',
      category: '',
      date: null,
      time: null,
      location: '',
      reminder_enabled: false,
    },
  });

  const goNext = async () => {
    const next = getNextOnboardingStep('appointment_setup', {
      careSetup: null,
      intent: profile?.intent,
    });
    await updateProfile.mutateAsync({ onboarding_step: next });
    router.replace(onboardingStepHref(next));
  };

  const toggleSync = async (value: boolean) => {
    if (!value) {
      setSync(false);
      return;
    }
    try {
      const granted = await calendarProvider.requestPermission();
      if (!granted) {
        showToast('Calendar access was not granted.', 'error');
        return;
      }
      setSync(true);
    } catch {
      showToast("Calendar isn't available in this build of Prism.", 'error');
    }
  };

  const submit = async (values: AppointmentSetupInput) => {
    setIsSubmitting(true);
    try {
      if (include === 'yes') {
        await setModuleEnabled.mutateAsync({ moduleKey: 'appointments', enabled: true });
        if (sync) await updateSettings.mutateAsync({ calendar_sync_enabled: true });
        if (values.date) {
          const time = values.time ?? '09:00';
          const startsAt = `${values.date}T${time}:00Z`;
          const title = deriveAppointmentTitle(values.category);
          await createAppointment.mutateAsync({
            title,
            provider: values.provider,
            category: values.category,
            starts_at: startsAt,
            location: values.location,
            reminder_enabled: values.reminder_enabled,
          });
          if (sync) {
            // Best effort: a calendar hiccup never blocks setup.
            await calendarProvider
              .addAppointment({ title, location: values.location, startsAt })
              .catch(() => undefined);
          }
        }
      }
      await goNext();
    } finally {
      setIsSubmitting(false);
    }
  };

  const skip = async () => {
    setIsSubmitting(true);
    try {
      await goNext();
    } finally {
      setIsSubmitting(false);
    }
  };

  const reveal = reducedMotion ? undefined : FadeInDown.duration(320);

  return (
    <OnboardingScreenLayout
      title="Include your appointments?"
      subtitle="Keep visits, dates and reminders in one place. You can change this any time."
      phase={0.7}
      primaryLabel="Continue"
      onPrimaryPress={handleSubmit(submit)}
      primaryLoading={isSubmitting || isFormSubmitting}
      onSkip={skip}
    >
      <OptionGrid
        options={INCLUDE_OPTIONS}
        selected={include ? [include] : []}
        onChange={(next) => setInclude((next[0] as 'yes' | 'no' | undefined) ?? null)}
        multiple={false}
      />

      {include === 'no' ? (
        <Animated.View entering={reveal}>
          <Text style={[styles.note, { color: theme.colors.text.secondary }]}>
            No problem. You can turn appointments on later from Customize.
          </Text>
        </Animated.View>
      ) : null}

      {include === 'yes' ? (
        <Animated.View entering={reveal} style={styles.section}>
          <View
            style={[
              styles.syncCard,
              { backgroundColor: theme.colors.field, borderColor: theme.colors.fieldBorder },
            ]}
          >
            <View style={[styles.syncIcon, { backgroundColor: `${theme.spectrum.cyan}55` }]}>
              <CalendarPlus size={22} color={theme.colors.text.primary} strokeWidth={2} />
            </View>
            <View style={styles.syncText}>
              <PRISMSwitch
                label="Sync with my calendar"
                description={
                  syncAvailable
                    ? "Appointments you add also appear in your phone's calendar. Prism only asks for access now, when you turn this on."
                    : 'Calendar sync is not available on this device.'
                }
                value={sync}
                disabled={!syncAvailable}
                onValueChange={toggleSync}
              />
            </View>
          </View>

          {showForm ? (
            <Animated.View entering={reveal} style={styles.form}>
              <Text style={[styles.formTitle, { color: theme.colors.text.primary }]}>
                Your next appointment
              </Text>
              <Controller
                control={control}
                name="provider"
                render={({ field }) => (
                  <PRISMInput
                    label="Provider"
                    value={field.value ?? ''}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <ChipField
                    label="Appointment type"
                    options={SUGGESTED_APPOINTMENT_CATEGORY_OPTIONS}
                    value={field.value ?? null}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="date"
                render={({ field, fieldState }) => (
                  <PRISMDateInput
                    label="Date"
                    value={field.value ?? ''}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="time"
                render={({ field, fieldState }) => (
                  <PRISMTimeInput
                    label="Time"
                    value={field.value ?? ''}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="location"
                render={({ field }) => (
                  <LocationSearchInput
                    value={field.value ?? ''}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
              <Controller
                control={control}
                name="reminder_enabled"
                render={({ field }) => (
                  <PRISMSwitch
                    label="Remind me"
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                )}
              />
            </Animated.View>
          ) : (
            <View style={styles.actions}>
              <PRISMButton
                label="Import from my calendar"
                variant="secondary"
                onPress={() => setImportOpen(true)}
              />
              <PRISMButton
                label="Add my next appointment now"
                variant="secondary"
                onPress={() => setShowForm(true)}
              />
            </View>
          )}
        </Animated.View>
      ) : null}
      <CalendarImportSheet visible={importOpen} onClose={() => setImportOpen(false)} />
    </OnboardingScreenLayout>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  note: {
    fontSize: type.bodyM.fontSize,
    lineHeight: type.bodyM.lineHeight,
    marginTop: spacing.md,
  },
  syncCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  syncIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncText: {
    flex: 1,
  },
  actions: {
    gap: spacing.smd,
  },
  form: {
    marginTop: spacing.sm,
  },
  formTitle: {
    fontFamily: fontFamily.display,
    fontSize: type.headingM.fontSize,
    lineHeight: type.headingM.lineHeight,
    fontWeight: fontWeight.semibold as '600',
    marginBottom: spacing.md,
  },
});
