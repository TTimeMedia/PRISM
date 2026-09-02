import React from 'react';
import { PlaceholderScreen } from '../../../components/PlaceholderScreen';
import { signOut } from '../../../lib/auth/actions';

/**
 * YOU — profile, Customize PRISM, privacy, notifications, app lock,
 * accessibility, data export, account deletion. See
 * docs/SCREEN_BIBLE.md §9. Foundation established the tab only; built
 * out across the YOU and Privacy & security milestones. Sign out is
 * added here in Milestone 02 (Authentication & Identity) — session
 * handling needs a real, working way to end a session, even before the
 * rest of this screen exists.
 */
export function YouScreen() {
  return (
    <PlaceholderScreen
      title="You"
      subtitle="Your information belongs to you."
      emptyTitle="Nothing here yet. That's okay."
      action={{ label: 'Sign out', onPress: () => signOut() }}
    />
  );
}
