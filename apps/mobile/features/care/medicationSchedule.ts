import type { FieldErrors, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  medicationCreateSchema,
  medicationScheduleProblems,
  type MedicationCreateInput,
} from '@prism/validation';

const zodMedicationResolver = zodResolver(medicationCreateSchema);

/**
 * The medication forms' check: the schema's own rules plus what a chosen
 * schedule still needs (days, how many days apart, the time), all at once,
 * so every missing piece shows under its field on the first tap of Save.
 * A schedule without these would silently never come up on Today.
 */
export const medicationResolver: Resolver<MedicationCreateInput> = async (
  values,
  context,
  options,
) => {
  const result = await zodMedicationResolver(values, context, options);
  const problems = medicationScheduleProblems(values);
  if (problems.length === 0) return result;

  const errors = { ...result.errors } as FieldErrors<MedicationCreateInput>;
  const config = { ...(errors.frequency_config as Record<string, unknown> | undefined) };
  for (const problem of problems) {
    const key = problem.path.split('.')[1];
    // A more specific message from the schema wins.
    if (!config[key]) config[key] = { type: 'validate', message: problem.message };
  }
  errors.frequency_config = config as FieldErrors<MedicationCreateInput>['frequency_config'];
  return { values: {}, errors };
};

function todayIso(now: Date): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * Every-X-days schedules count from the start date, so without one there is
 * nothing to count from. Default it to today rather than saving a
 * medication that never comes up.
 */
export function withScheduleDefaults(
  values: MedicationCreateInput,
  now: Date = new Date(),
): MedicationCreateInput {
  if (values.frequency_type === 'every_x_days' && !values.start_date) {
    return { ...values, start_date: todayIso(now) };
  }
  return values;
}
