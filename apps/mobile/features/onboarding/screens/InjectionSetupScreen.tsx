import React, { useState } from 'react';
import { router } from 'expo-router';
import { getNextOnboardingStep } from '@prism/types';
import { PRISMSwitch, spacing } from '@prism/ui';
import { StyleSheet, View } from 'react-native';
import { OnboardingScreenLayout } from '../components/OnboardingScreenLayout';
import { onboardingStepHref } from '../../../lib/onboarding/routes';
import { careSetupSignalFromModules } from '../../../lib/onboarding/careSetupSignal';
import {
  useModules,
  useProfile,
  useSetModuleEnabled,
  useUpdateProfile,
} from '../../../lib/profile/queries';

/**
 * Screen 14 — Injection Setup. Only shown when Care Setup implied
 * injection tracking. Captures *preferences* for the injections module
 * (there's nothing to log yet) — stored in modules.configuration, not a
 * standalone injections row. No medication linkage or medical guidance
 * on site selection is given — see docs/PRODUCT_BIBLE.md §13.
 */
export function InjectionSetupScreen() {
  const { data: profile } = useProfile();
  const { data: modules } = useModules();
  const updateProfile = useUpdateProfile();
  const setModuleEnabled = useSetModuleEnabled();
  const [wantsTracking, setWantsTracking] = useState<boolean | null>(null);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [trackSite, setTrackSite] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const goNext = async () => {
    const careSetup = careSetupSignalFromModules(modules);
    const next = getNextOnboardingStep('injection_setup', {
      careSetup,
      intent: profile?.intent,
    });
    await updateProfile.mutateAsync({ onboarding_step: next });
    router.replace(onboardingStepHref(next));
  };

  const submit = async () => {
    setIsSubmitting(true);
    if (wantsTracking) {
      await setModuleEnabled.mutateAsync({
        moduleKey: 'injections',
        enabled: true,
        configuration: { reminder_enabled: reminderEnabled, track_site: trackSite },
      });
    }
    await goNext();
    setIsSubmitting(false);
  };

  if (wantsTracking === null) {
    return (
      <OnboardingScreenLayout
        title="Want to track injections?"
        primaryLabel="Yes"
        onPrimaryPress={() => setWantsTracking(true)}
        onSkip={() => setWantsTracking(false)}
        skipLabel="Not right now"
      />
    );
  }

  return (
    <OnboardingScreenLayout
      title="Injection preferences"
      primaryLabel="Continue"
      onPrimaryPress={submit}
      primaryLoading={isSubmitting}
    >
      <View style={styles.field}>
        <PRISMSwitch label="Remind me" value={reminderEnabled} onValueChange={setReminderEnabled} />
      </View>
      <PRISMSwitch label="Track injection site" value={trackSite} onValueChange={setTrackSite} />
    </OnboardingScreenLayout>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: spacing.xs,
  },
});
