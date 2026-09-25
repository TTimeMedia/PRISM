import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { medicationLogCreateSchema, type MedicationLogCreateInput } from '@prism/validation';
import {
  PRISMButton,
  PRISMDateInput,
  PRISMHeader,
  PRISMIconButton,
  PRISMTextArea,
  PRISMTimeInput,
  spacing,
  useTheme,
  useToast,
} from '@prism/ui';
import { ArrowLeft } from 'lucide-react-native';
import { useCreateMedicationLog } from '../../../lib/care/mutations';
import { useMedication } from '../../../lib/care/queries';
import { toISODateTime, nowDateAndTime } from '../../../lib/care/dateTime';
import { KeyboardAwareScreen } from '../../../components/KeyboardAwareScreen';
import { ChipField } from '../components/ChipField';
import { INJECTION_SITE_OPTIONS, MEDICATION_LOG_STATUS_OPTIONS } from '../optionLabels';

/** The "Log" action from Medication Detail — records one dose entry (Screen 28's data source). */
export function LogMedicationDoseScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const createLog = useCreateMedicationLog();
  const { data: medication } = useMedication(id);
  // An injection is a medication: an injectable one also asks where the dose went.
  const isInjectable = medication?.form === 'injection';
  const { showToast } = useToast();
  const { date, time } = nowDateAndTime();

  const { control, handleSubmit, watch } = useForm<{
    status: string | null;
    date: string;
    time: string;
    notes: string | null;
    site: string | null;
  }>({
    defaultValues: { status: 'completed', date, time, notes: '', site: null },
  });
  const status = watch('status');

  const submit = async (values: {
    status: string | null;
    date: string;
    time: string;
    notes: string | null;
    site: string | null;
  }) => {
    const scheduled_at = toISODateTime(values.date, values.time);
    const input: MedicationLogCreateInput = medicationLogCreateSchema.parse({
      medication_id: id,
      scheduled_at,
      completed_at: values.status === 'completed' ? scheduled_at : null,
      status: values.status ?? 'completed',
      notes: values.notes,
      site: isInjectable ? values.site : null,
    });
    try {
      await createLog.mutateAsync(input);
      router.back();
    } catch {
      showToast("Couldn't save this entry. Please try again.", 'error');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <PRISMHeader
        title="Log a dose."
        leading={
          <PRISMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
      />
      <KeyboardAwareScreen>
        <View style={styles.content}>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <ChipField
                label="Status"
                options={MEDICATION_LOG_STATUS_OPTIONS}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="date"
            render={({ field }) => (
              <PRISMDateInput label="Date" value={field.value} onChangeText={field.onChange} />
            )}
          />
          <Controller
            control={control}
            name="time"
            render={({ field }) => (
              <PRISMTimeInput label="Time" value={field.value} onChangeText={field.onChange} />
            )}
          />
          {isInjectable ? (
            <Controller
              control={control}
              name="site"
              render={({ field }) => (
                <ChipField
                  label="Where (optional)"
                  options={INJECTION_SITE_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          ) : null}
          <Controller
            control={control}
            name="notes"
            render={({ field }) => (
              <PRISMTextArea
                label="Notes"
                value={field.value ?? ''}
                onChangeText={field.onChange}
              />
            )}
          />
          <View style={styles.submit}>
            <PRISMButton
              label="Save entry"
              onPress={handleSubmit(submit)}
              loading={createLog.isPending}
              disabled={!status}
            />
          </View>
        </View>
      </KeyboardAwareScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  submit: {
    marginTop: spacing.md,
  },
});
