import React from 'react';
import { Award, Calendar, Flag, Heart, PartyPopper, Sparkles } from 'lucide-react-native';

/** Selectable icon names for a milestone — stored verbatim in `milestones.icon`. */
export const MILESTONE_ICON_OPTIONS = [
  { value: 'sparkles', label: 'Sparkles' },
  { value: 'heart', label: 'Heart' },
  { value: 'flag', label: 'Flag' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'award', label: 'Award' },
  { value: 'party-popper', label: 'Celebration' },
] as const;

export function milestoneIconComponent(icon: string | null | undefined, color: string, size = 24) {
  switch (icon) {
    case 'heart':
      return <Heart size={size} color={color} />;
    case 'flag':
      return <Flag size={size} color={color} />;
    case 'calendar':
      return <Calendar size={size} color={color} />;
    case 'award':
      return <Award size={size} color={color} />;
    case 'party-popper':
      return <PartyPopper size={size} color={color} />;
    case 'sparkles':
    default:
      return <Sparkles size={size} color={color} />;
  }
}
