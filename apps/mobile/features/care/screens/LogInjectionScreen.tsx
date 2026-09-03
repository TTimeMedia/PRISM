import React from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import {
  PRISMButton,
  PRISMDateInput,
  PRISMHeader,
  PRISMIconButton,
  PRISMInput,
  PRISMTextArea,
  spacing,
  useTheme,
  useToast,
} from '@prism/ui';
import { injectionCreateSchema } from '@prism/validation';
import { useMedications } from '../../../lib/care/queries';
import { useCreateInjection } from '../../../lib/care/mutations';
import { toISODateTime, nowDateAndTime } from '../../../lib/care/dateTime';
import { ChipField } from '../components/ChipField';
import { INJECTION_SITE_OPTIONS } from '../optionLabels';

interface LogInjectionFormValues {
  medication_id: string | null;
  date: string;
  time: string;
  site: string | null;
  notes: string | null;
}

/** Screen 30 — Log Injection. No medical guidance is given on site selection. */
export function LogInjectionScreen() {
  const theme = useTheme();
  const { data: medications } = useMedications();
  const createInjection = useCreateInjection();
  const { showToast } = useToast();
  const { date, time } = nowDateAndTime();

  const { control, handleSubmit } = useForm<LogInjectionFormValues>({
    defaultValues: { medication_id: null, date, time, site: null, notes: '' },
  });

  const medicationOptions = (medications ?? []).map((m) => ({ value: m.id, label: m.name }));

  const submit = async (values: LogInjectionFormValues) => {
    const input = injectionCreateSchema.parse({
      medication_id: values.medication_id,
      injected_at: toISODateTime(values.date, values.time),
      site: values.site,
      notes: values.notes,
    });
    try {
      await createInjection.mutateAsync(input);
      router.back();
    } catch {
      showToast("Couldn't save this injection. Please try again.", 'error');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <PRISMHeader
        title="Log injection."
        leading={
          <PRISMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        {medicationOptions.length > 0 ? (
          <Controller
            control={control}
            name="medication_id"
            render={({ field }) => (
              <ChipField
                label="Medication"
                options={medicationOptions}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        ) : null}
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
            <PRISMInput
              label="Time"
              placeholder="HH:mm"
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="site"
          render={({ field }) => (
            <ChipField
              label="Site"
              options={INJECTION_SITE_OPTIONS}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="notes"
          render={({ field }) => (
            <PRISMTextArea label="Notes" value={field.value ?? ''} onChangeText={field.onChange} />
          )}
        />
        <View style={styles.submit}>
          <PRISMButton
            label="Save injection"
            onPress={handleSubmit(submit)}
            loading={createInjection.isPending}
          />
        </View>
      </ScrollView>
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
