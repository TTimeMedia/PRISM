import type { ChipSelectOption } from './components/ChipSelect';

/** Screen 09 — exact copy from docs/SCREEN_BIBLE.md Screen 09. */
export const INTENT_CHIP_OPTIONS: ChipSelectOption[] = [
  { value: 'managing_medications', label: 'Managing medications' },
  { value: 'tracking_injections', label: 'Tracking injections' },
  { value: 'appointments', label: 'Keeping up with appointments' },
  { value: 'lab_work', label: 'Tracking lab work' },
  { value: 'surgery', label: 'Preparing for surgery' },
  { value: 'legal_changes', label: 'Keeping track of legal changes' },
  { value: 'milestones', label: 'Documenting milestones' },
  { value: 'journaling', label: 'Journaling' },
  { value: 'records', label: 'Saving important records' },
  { value: 'all_in_one_place', label: 'Keeping everything in one place' },
  { value: 'still_figuring_out', label: "I'm still figuring things out" },
  { value: 'something_else', label: 'Something else' },
];

/** Screen 10 — exact copy from docs/SCREEN_BIBLE.md Screen 10. */
export const JOURNEY_STAGE_CHIP_OPTIONS: ChipSelectOption[] = [
  { value: 'exploring', label: 'Exploring' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'established', label: 'Established' },
  { value: 'somewhere_else', label: 'Somewhere else' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

/** Screen 12 — exact copy from docs/SCREEN_BIBLE.md Screen 12. */
export const CARE_SETUP_CHIP_OPTIONS: ChipSelectOption[] = [
  { value: 'hormones', label: 'Hormones' },
  { value: 'medication', label: 'Medication' },
  { value: 'injections', label: 'Injections' },
  { value: 'patches', label: 'Patches' },
  { value: 'gel_cream', label: 'Gel/cream' },
  { value: 'blockers', label: 'Blockers' },
  { value: 'surgery', label: 'Surgery' },
  { value: 'other', label: 'Other' },
  { value: 'none', label: 'None of these' },
];
