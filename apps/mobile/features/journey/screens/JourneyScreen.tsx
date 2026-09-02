import React from 'react';
import { PlaceholderScreen } from '../../../components/PlaceholderScreen';

/**
 * JOURNEY — timeline, milestones, journal (P0), memories (P1). See
 * docs/SCREEN_BIBLE.md §8. Foundation establishes the tab only; built
 * out in the JOURNEY milestone.
 */
export function JourneyScreen() {
  return (
    <PlaceholderScreen
      title="Journey"
      subtitle="Your story, unfolding."
      emptyTitle="Your story starts wherever you decide."
    />
  );
}
