import type { ChipFieldOption } from './components/ChipField';

/** Human-readable labels for CARE's enum fields — see docs/SCREEN_BIBLE.md §7. */

export const MEDICATION_FORM_OPTIONS: ChipFieldOption[] = [
  { value: 'pill', label: 'Pill' },
  { value: 'injection', label: 'Injection' },
  { value: 'patch', label: 'Patch' },
  { value: 'gel', label: 'Gel' },
  { value: 'cream', label: 'Cream' },
  { value: 'other', label: 'Other' },
];

export const FREQUENCY_TYPE_OPTIONS: ChipFieldOption[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'every_x_days', label: 'Every X days' },
  { value: 'custom', label: 'Custom' },
];

/** No medical guidance is given on site selection — see docs/PRODUCT_BIBLE.md §13. */
export const INJECTION_SITE_OPTIONS: ChipFieldOption[] = [
  { value: 'left_thigh', label: 'Left thigh' },
  { value: 'right_thigh', label: 'Right thigh' },
  { value: 'left_glute', label: 'Left glute' },
  { value: 'right_glute', label: 'Right glute' },
  { value: 'left_abdomen', label: 'Left abdomen' },
  { value: 'right_abdomen', label: 'Right abdomen' },
  { value: 'other', label: 'Other' },
  { value: 'not_tracked', label: "Don't track" },
];

/** Never shame a user for a status — see docs/MASTER_BUILD_SPEC.md §08. */
export const MEDICATION_LOG_STATUS_OPTIONS: ChipFieldOption[] = [
  { value: 'completed', label: 'Completed' },
  { value: 'skipped', label: 'Skipped' },
  { value: 'missed', label: 'Missed' },
  { value: 'skipped_intentionally', label: 'Skipped intentionally' },
];

export const MEDICATION_LOG_FILTER_OPTIONS: ChipFieldOption[] = [
  { value: 'all', label: 'All' },
  { value: 'completed', label: 'Completed' },
  { value: 'skipped', label: 'Skipped' },
  { value: 'missed', label: 'Missed' },
];

/** Suggested only — users may enter any custom category text. */
export const SUGGESTED_APPOINTMENT_CATEGORY_OPTIONS: ChipFieldOption[] = [
  { value: 'Primary care', label: 'Primary care' },
  { value: 'Gender-affirming care', label: 'Gender-affirming care' },
  { value: 'Endocrinology', label: 'Endocrinology' },
  { value: 'Surgery', label: 'Surgery' },
  { value: 'Mental health', label: 'Mental health' },
  { value: 'Lab', label: 'Lab' },
  { value: 'Other', label: 'Other' },
];
