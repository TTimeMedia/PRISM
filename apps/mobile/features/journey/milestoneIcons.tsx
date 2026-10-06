import React from 'react';
import {
  Award,
  Calendar,
  Flag,
  Heart,
  PartyPopper,
  Sparkles,
  type LucideIcon,
} from 'lucide-react-native';

/** Selectable icon names for a milestone — stored verbatim in `milestones.icon`. */
export const MILESTONE_ICON_OPTIONS = [
  { value: 'sparkles', label: 'Sparkles' },
  { value: 'heart', label: 'Heart' },
  { value: 'flag', label: 'Flag' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'award', label: 'Award' },
  { value: 'party-popper', label: 'Celebration' },
] as const;

const ICONS: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  heart: Heart,
  flag: Flag,
  calendar: Calendar,
  award: Award,
  'party-popper': PartyPopper,
};

/** Words in a typed category that suggest an icon, checked in order. */
const CATEGORY_WORDS: [RegExp, LucideIcon][] = [
  [/birthday|party|celebrat|anniversar|wedding|graduat/i, PartyPopper],
  [/love|relationship|partner|family|friend|heart|self.?care|feel/i, Heart],
  [/award|achiev|win|won|proud|accomplish|goal|career|job|work|school|degree/i, Award],
  [/appointment|date|day|year|month|week|schedule/i, Calendar],
  [/first|start|began|begin|new|move|moved|name|legal|document|step/i, Flag],
];

/**
 * The icon to show for a milestone: the one the person picked, or, if they
 * left the default (Sparkles), one that matches the category they typed.
 */
export function milestoneIconFor(
  icon: string | null | undefined,
  category: string | null | undefined,
): LucideIcon {
  if (icon && icon !== 'sparkles' && ICONS[icon]) return ICONS[icon];
  const typed = category?.trim();
  if (typed) {
    const match = CATEGORY_WORDS.find(([words]) => words.test(typed));
    if (match) return match[1];
  }
  return Sparkles;
}

export function milestoneIconComponent(icon: string | null | undefined, color: string, size = 24) {
  const Icon = ICONS[icon ?? ''] ?? Sparkles;
  return <Icon size={size} color={color} />;
}
