import React from 'react';
import { PlaceholderScreen } from '../../../components/PlaceholderScreen';

/**
 * CARE — medications, injections, appointments (P0), labs and
 * procedures (P1). See docs/SCREEN_BIBLE.md §7. Foundation establishes
 * the tab only; built out in the CARE milestone.
 */
export function CareScreen() {
  return (
    <PlaceholderScreen
      title="Care"
      subtitle="Organized, not clinical."
      emptyTitle="Nothing added yet."
      emptySubtitle="You can add something whenever you need to."
    />
  );
}
