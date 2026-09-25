import {
  BookOpen,
  Bandage,
  CalendarDays,
  Droplets,
  Ellipsis,
  FlaskConical,
  Flag,
  FolderOpen,
  LayoutGrid,
  CircleHelp,
  Pill,
  Scale,
  Scissors,
  Stethoscope,
  Syringe,
  Sun,
  Ban,
  Layers,
} from 'lucide-react-native';
import type { ChipSelectOption } from './components/ChipSelect';
import type { OptionGridOption } from './components/OptionGrid';

/** Screen 09 — What Brings You Here? Values match docs/SCREEN_BIBLE.md Screen 09; labels are the softened in-app wording. */
export const INTENT_CHIP_OPTIONS: OptionGridOption[] = [
  { value: 'managing_medications', label: 'Medications', icon: Pill },
  { value: 'tracking_injections', label: 'Injections', icon: Syringe },
  { value: 'appointments', label: 'Appointments', icon: CalendarDays },
  { value: 'lab_work', label: 'Lab work', icon: FlaskConical },
  { value: 'surgery', label: 'Preparing for surgery', icon: Stethoscope },
  { value: 'legal_changes', label: 'Legal changes', icon: Scale },
  { value: 'milestones', label: 'Milestones', icon: Flag },
  { value: 'journaling', label: 'Journaling', icon: BookOpen },
  { value: 'records', label: 'Important records', icon: FolderOpen },
  { value: 'all_in_one_place', label: 'Everything in one place', icon: LayoutGrid },
  { value: 'still_figuring_out', label: "I'm still figuring things out", icon: CircleHelp },
  { value: 'something_else', label: 'Something else', icon: Ellipsis },
];

/**
 * Screen 16 — three mutually exclusive choices. "I have a specific start
 * date" is the only one that leads anywhere else (to the date picker) —
 * see JourneyDateScreen.tsx.
 */
export const JOURNEY_DATE_CHOICE_OPTIONS: ChipSelectOption[] = [
  { value: 'unknown', label: "I don't know" },
  { value: 'no_specific_date', label: "My journey doesn't have one specific start date" },
  { value: 'specific_date', label: 'I have a specific start date' },
];

/** Screen 12 — what care to set up. */
export const CARE_SETUP_CHIP_OPTIONS: OptionGridOption[] = [
  { value: 'hormones', label: 'Hormones', icon: Droplets },
  { value: 'medication', label: 'Medication', icon: Pill },
  { value: 'injections', label: 'Injections', icon: Syringe },
  { value: 'patches', label: 'Patches', icon: Bandage },
  { value: 'gel_cream', label: 'Gel/cream', icon: Sun },
  { value: 'blockers', label: 'Blockers', icon: Layers },
  { value: 'surgery', label: 'Surgery', icon: Scissors },
  { value: 'other', label: 'Other', icon: Ellipsis },
  { value: 'none', label: 'None of these', icon: Ban },
];
