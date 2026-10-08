import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Lock } from 'lucide-react-native';
import { getNextOnboardingStep, renderReminder, SAMPLE_VARS } from '@prism/types';
import { PRISMSwitch, spacing, type, useTheme } from '@prism/ui';
import { OnboardingScreenLayout } from '../components/OnboardingScreenLayout';
import { NotificationPreview } from '../components/NotificationPreview';
import { Reveal } from '../../../components/motion';
import { onboardingStepHref } from '../../../lib/onboarding/routes';
import { useUpdateProfile, useUpdateSettings } from '../../../lib/profile/queries';

/** The lock-screen wording with private notifications on (lib/reminders/notificationScheduler.ts). */
const PRIVATE_BODY = 'Your Prism reminder is ready.';
/** A made-up reminder in the default wording, for what "off" looks like. */
const STANDARD_BODY = renderReminder('medication', SAMPLE_VARS.medication, {}).body;

/**
 * Screen 17 — Privacy Setup. This is where the person chooses private
 * notifications, so the screen says so and shows the difference: the
 * lock-screen preview follows the switch. Private notifications default
 * ON — see docs/SECURITY.md §7. Turning notifications on at all is the
 * next screen (Reminders).
 *
 * App Lock is deliberately NOT offered here. Enabling it requires a PIN
 * to exist first — there's no lock without a fallback unlock method
 * (see AppLockSettingsScreen's own header) — and this screen has no way
 * to collect one. An earlier version of this screen let onboarding set
 * `app_lock_enabled: true` with no PIN ever stored, which permanently
 * locked the user out on next launch (AppLockScreen has no recovery
 * path). App Lock is only ever enabled from YOU → App Lock, where PIN
 * creation is enforced before the setting can be turned on.
 */
export function PrivacySetupScreen() {
  const theme = useTheme();
  const updateSettings = useUpdateSettings();
  const updateProfile = useUpdateProfile();
  const [notificationPrivacy, setNotificationPrivacy] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    setIsSubmitting(true);
    const next = getNextOnboardingStep('privacy_setup', { careSetup: null, intent: null });
    await Promise.all([
      updateSettings.mutateAsync({
        notification_privacy: notificationPrivacy,
      }),
      updateProfile.mutateAsync({ onboarding_step: next }),
    ]);
    setIsSubmitting(false);
    router.replace(onboardingStepHref(next));
  };

  return (
    <OnboardingScreenLayout
      hero={
        <View style={[styles.lock, { backgroundColor: `${theme.spectrum.cyan}55` }]}>
          <Lock size={40} color={theme.colors.text.primary} strokeWidth={1.8} />
        </View>
      }
      phase={0.87}
      title="Protect your Prism."
      subtitle="Prism's reminders can show on your lock screen, where other people might see them. Choose what they say."
      primaryLabel="Continue"
      onPrimaryPress={submit}
      primaryLoading={isSubmitting}
    >
      <PRISMSwitch
        label="Private notifications"
        description={
          notificationPrivacy
            ? 'On: every reminder says the same thing, so nothing about your care shows.'
            : 'Off: reminders name the medication or appointment and the time.'
        }
        value={notificationPrivacy}
        onValueChange={setNotificationPrivacy}
      />
      <Reveal index={4}>
        <View style={styles.previewBlock}>
          <Text style={[styles.label, { color: theme.colors.text.secondary }]}>
            Your lock screen will show
          </Text>
          <NotificationPreview body={notificationPrivacy ? PRIVATE_BODY : STANDARD_BODY} />
          <Text style={[styles.note, { color: theme.colors.text.tertiary }]}>
            You can change this any time in You → Notifications.
          </Text>
        </View>
      </Reveal>
    </OnboardingScreenLayout>
  );
}

const styles = StyleSheet.create({
  lock: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewBlock: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  label: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
  },
  note: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
  },
});
