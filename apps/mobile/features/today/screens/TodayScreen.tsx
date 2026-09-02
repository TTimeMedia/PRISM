import React from 'react';
import { PlaceholderScreen } from '../../../components/PlaceholderScreen';

/**
 * TODAY — the personalized dashboard. See docs/SCREEN_BIBLE.md §6 and
 * docs/TECHNICAL_BIBLE.md §10 (Personalization Engine). Foundation
 * establishes the tab and design language only; the personalization
 * engine and dynamic cards are built in the TODAY milestone.
 */
export function TodayScreen() {
  return (
    <PlaceholderScreen
      title="Today"
      subtitle="What matters to you, right now."
      emptyTitle="Nothing urgent today."
      emptySubtitle="Your PRISM is here whenever you need it."
    />
  );
}
