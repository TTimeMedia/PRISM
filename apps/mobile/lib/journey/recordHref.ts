import type { Href } from 'expo-router';
import type { ModuleKey } from '@prism/types';

/**
 * Where tapping a timeline moment goes: the original record. The timeline
 * never copies data, it's a view over it. There's no injection detail
 * screen, so an injection opens Injection History.
 */
export function recordHref(moduleKey: ModuleKey, sourceId: string): Href {
  switch (moduleKey) {
    case 'medications':
      return `/care/medications/${sourceId}/history`;
    case 'injections':
      return '/care/injections';
    case 'appointments':
      return `/care/appointments/${sourceId}`;
    case 'milestones':
      return `/journey/milestones/${sourceId}`;
    case 'journal':
      return `/journey/journal/${sourceId}`;
    default:
      return '/journey';
  }
}
