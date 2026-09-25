import { BookHeart, CalendarDays, Flag, Pill, Syringe, type LucideIcon } from 'lucide-react-native';
import type { ModuleKey, P0ModuleKey } from '@prism/types';
import type { Tint } from './tint';

export interface ModuleStyle {
  label: string;
  icon: LucideIcon;
  tint: Tint;
  /** What turning it on gives you, in a few words. */
  blurb: string;
}

/** One look per feature, used the same way on every tab so a color always means the same thing. */
export const MODULE_STYLE: Record<P0ModuleKey, ModuleStyle> = {
  medications: {
    label: 'Medications',
    icon: Pill,
    tint: 'cyan',
    blurb: 'Doses, schedules and reminders.',
  },
  injections: {
    label: 'Injections',
    icon: Syringe,
    tint: 'violet',
    blurb: 'Log injections and where.',
  },
  appointments: {
    label: 'Appointments',
    icon: CalendarDays,
    tint: 'yellow',
    blurb: 'Visits, dates and reminders.',
  },
  milestones: {
    label: 'Milestones',
    icon: Flag,
    tint: 'pink',
    blurb: 'Moments worth remembering.',
  },
  journal: {
    label: 'Journal',
    icon: BookHeart,
    tint: 'mint',
    blurb: 'Write freely, privately.',
  },
};

/** The style for any module key; features without a screen yet fall back to the medications look. */
export function moduleStyle(key: ModuleKey): ModuleStyle {
  return MODULE_STYLE[key as P0ModuleKey] ?? MODULE_STYLE.medications;
}
