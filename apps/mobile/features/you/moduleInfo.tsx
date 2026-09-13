import React from 'react';
import { Pill, Syringe, CalendarDays, Flag, BookHeart } from 'lucide-react-native';
import type { P0ModuleKey } from '@prism/types';

export interface ModuleInfo {
  key: P0ModuleKey;
  label: string;
  description: string;
  icon: (color: string) => React.ReactNode;
  /** Whether this module's items have a per-item reminder toggle worth a global default — see docs/DECISIONS.md § YOU. */
  hasReminderDefault: boolean;
}

/**
 * Screens 56-57 (Customize PRISM / Module Configuration). P0 modules
 * only — see @prism/types MODULE_KEYS and docs/DECISIONS.md "Customize
 * PRISM and Quick Add expose only P0 modules until P1 ships".
 */
export const MODULE_INFO: ModuleInfo[] = [
  {
    key: 'medications',
    label: 'Medications',
    description: 'Track what you take and when.',
    icon: (color) => <Pill size={20} color={color} />,
    hasReminderDefault: true,
  },
  {
    key: 'injections',
    label: 'Injections',
    description: 'Log injections and sites.',
    icon: (color) => <Syringe size={20} color={color} />,
    hasReminderDefault: false,
  },
  {
    key: 'appointments',
    label: 'Appointments',
    description: 'Keep track of upcoming care.',
    icon: (color) => <CalendarDays size={20} color={color} />,
    hasReminderDefault: true,
  },
  {
    key: 'milestones',
    label: 'Milestones',
    description: 'Mark the moments that matter.',
    icon: (color) => <Flag size={20} color={color} />,
    hasReminderDefault: false,
  },
  {
    key: 'journal',
    label: 'Journal',
    description: 'Write freely, privately.',
    icon: (color) => <BookHeart size={20} color={color} />,
    hasReminderDefault: false,
  },
];
