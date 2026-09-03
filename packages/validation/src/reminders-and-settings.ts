import { z } from 'zod';
import { NOTIFICATION_STYLES, THEMES } from '@prism/types';
import { isoDateTimeSchema } from './common';

/**
 * `reminders.recurrence` shape — see @prism/types Reminder and
 * docs/BUILD_STATUS.md §6. Intentionally the same shape as
 * FrequencyConfig; kept as a separate schema because a reminder's
 * recurrence and a medication's dosing frequency are conceptually
 * different fields that happen to need the same structure today.
 */
export const recurrenceSchema = z
  .object({
    interval_days: z.number().int().min(1).max(365).optional(),
    days_of_week: z.array(z.number().int().min(0).max(6)).optional(),
    time_of_day: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Expected HH:mm')
      .optional(),
  })
  .nullable()
  .optional();

/** Private notifications default to ON — see docs/SECURITY.md §7. */
export const reminderCreateSchema = z.object({
  type: z.string().trim().min(1).max(50),
  reference_id: z.string().uuid().nullable().optional(),
  scheduled_time: isoDateTimeSchema,
  recurrence: recurrenceSchema,
  notification_style: z.enum(NOTIFICATION_STYLES).default('private'),
  enabled: z.boolean().default(true),
});
export type ReminderCreateInput = z.infer<typeof reminderCreateSchema>;

export const settingsUpdateSchema = z.object({
  theme: z.enum(THEMES).optional(),
  app_lock_enabled: z.boolean().optional(),
  biometric_lock: z.boolean().optional(),
  notification_privacy: z.boolean().optional(),
  reduced_motion: z.boolean().optional(),
  accessibility_preferences: z.record(z.string(), z.unknown()).nullable().optional(),
});
export type SettingsUpdateInput = z.infer<typeof settingsUpdateSchema>;
