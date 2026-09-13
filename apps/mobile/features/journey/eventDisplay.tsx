import React from 'react';
import { BookOpen, CalendarDays, Pill, Sparkles, Syringe } from 'lucide-react-native';
import type { ModuleKey } from '@prism/types';
import type { useTheme } from '@prism/ui';

type Theme = ReturnType<typeof useTheme>;

/**
 * Spectrum color and icon per record type shown on JOURNEY's Timeline —
 * "subtle spectrum changes distinguishing event categories," per
 * docs/DESIGN_SYSTEM.md §15. Assignments follow §4's own spectrum-token
 * guide (violet for milestones/journey moments, pink for personal
 * reflection) rather than inventing a new palette.
 */
export function eventColor(theme: Theme, moduleKey: ModuleKey): string {
  switch (moduleKey) {
    case 'medications':
      return theme.spectrum.cyan;
    case 'injections':
      return theme.spectrum.mint;
    case 'appointments':
      return theme.spectrum.yellow;
    case 'milestones':
      return theme.spectrum.violet;
    case 'journal':
      return theme.spectrum.pink;
    default:
      return theme.spectrum.cyan;
  }
}

export function eventIcon(moduleKey: ModuleKey, color: string, size = 16) {
  switch (moduleKey) {
    case 'medications':
      return <Pill size={size} color={color} />;
    case 'injections':
      return <Syringe size={size} color={color} />;
    case 'appointments':
      return <CalendarDays size={size} color={color} />;
    case 'milestones':
      return <Sparkles size={size} color={color} />;
    case 'journal':
      return <BookOpen size={size} color={color} />;
    default:
      return null;
  }
}
