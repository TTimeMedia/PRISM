import React, { useState } from 'react';
import { PRISMModal } from '@prism/ui';
import { useAppStore } from '../../../lib/store/appStore';
import { useAppLockStore } from '../../../lib/store/appLockStore';

/**
 * The one-time question on Today: show LGBTQ+ days under the greeting?
 * Nothing shows until the person answers, since someone glancing at their
 * phone could see it. Closing without answering asks again next time.
 * Hidden while the app is locked, so it never sits on top of the lock
 * screen. The choice can be changed in Appearance.
 */
export function CelebrationDaysPrompt() {
  const choice = useAppStore((state) => state.celebrationDays);
  const setChoice = useAppStore((state) => state.setCelebrationDays);
  const isLocked = useAppLockStore((state) => state.isLocked);
  const [closed, setClosed] = useState(false);

  return (
    <PRISMModal
      visible={choice === 'unasked' && !closed && !isLocked}
      title="Celebrate LGBTQ+ days?"
      message="Prism can show a note on Today for days like National Coming Out Day and Trans Day of Visibility. You can change this any time in Appearance."
      onRequestClose={() => setClosed(true)}
      actions={[
        { label: 'Turn on', onPress: () => setChoice('on'), variant: 'primary' },
        { label: 'Keep off', onPress: () => setChoice('off'), variant: 'secondary' },
      ]}
    />
  );
}
