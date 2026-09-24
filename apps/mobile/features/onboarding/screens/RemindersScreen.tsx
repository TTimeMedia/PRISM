import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Bell, Pill } from 'lucide-react-native';
import { getNextOnboardingStep } from '@prism/types';
import { fontFamily, fontWeight, radius, spacing, type, useTheme } from '@prism/ui';
import { OnboardingScreenLayout } from '../components/OnboardingScreenLayout';
import { Reveal } from '../../../components/motion';
import { onboardingStepHref } from '../../../lib/onboarding/routes';
import { useUpdateProfile } from '../../../lib/profile/queries';
import { requestNotificationPermissions } from '../../../lib/reminders/notificationScheduler';

/** What a reminder looks like on the lock screen — always the private wording. */
function NotificationPreview() {
  const theme = useTheme();
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.preview,
        { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border.default },
      ]}
    >
      <View style={[styles.appIcon, { backgroundColor: theme.accent }]}>
        <Pill size={22} color={theme.onAccent} strokeWidth={2.4} />
      </View>
      <View style={styles.previewText}>
        <View style={styles.previewHeader}>
          <Text style={[styles.previewApp, { color: theme.colors.text.primary }]}>Prism</Text>
          <Text style={[styles.previewTime, { color: theme.colors.text.tertiary }]}>now</Text>
        </View>
        <Text style={[styles.previewBody, { color: theme.colors.text.secondary }]}>
          Your Prism reminder is ready.
        </Text>
      </View>
    </View>
  );
}

/**
 * Reminders — asks for notification permission at a moment that makes
 * sense, with the reason spelled out, instead of a surprise system prompt
 * the first time a medication reminder is saved. Reminders themselves are
 * scheduled on the phone (lib/reminders/notificationScheduler.ts), so
 * this only needs the OS permission; declining never blocks setup.
 */
export function RemindersScreen() {
  const theme = useTheme();
  const updateProfile = useUpdateProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [declinedNote, setDeclinedNote] = useState(false);

  const advance = async () => {
    const next = getNextOnboardingStep('reminders', { careSetup: null, intent: null });
    await updateProfile.mutateAsync({ onboarding_step: next });
    router.replace(onboardingStepHref(next));
  };

  const turnOn = async () => {
    setIsSubmitting(true);
    try {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        setDeclinedNote(true);
        return;
      }
      await advance();
    } finally {
      setIsSubmitting(false);
    }
  };

  const skip = async () => {
    setIsSubmitting(true);
    try {
      await advance();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingScreenLayout
      hero={
        <View style={[styles.bell, { backgroundColor: `${theme.spectrum.violet}55` }]}>
          <Bell size={44} color={theme.colors.text.primary} strokeWidth={1.8} />
        </View>
      }
      phase={0.9}
      title="Reminders that find you."
      subtitle="Get a nudge when it's time for a medication or an appointment. They're set on your phone, and you choose what each one says."
      primaryLabel={declinedNote ? 'Continue' : 'Turn on reminders'}
      onPrimaryPress={declinedNote ? skip : turnOn}
      primaryLoading={isSubmitting}
      onSkip={declinedNote ? undefined : skip}
      skipLabel="Not now"
    >
      <NotificationPreview />
      <Reveal index={4}>
        <Text style={[styles.note, { color: theme.colors.text.secondary }]}>
          {declinedNote
            ? "No problem. Reminders are off for now. You can turn them on any time in your phone's Settings under Notifications."
            : 'With private notifications on, your lock screen only shows this. You can change it any time in You → Notifications.'}
        </Text>
      </Reveal>
    </OnboardingScreenLayout>
  );
}

const styles = StyleSheet.create({
  bell: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  appIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewText: {
    flex: 1,
    gap: 2,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewApp: {
    fontFamily: fontFamily.primary,
    fontSize: type.bodyS.fontSize,
    fontWeight: fontWeight.semibold as '600',
  },
  previewTime: {
    fontSize: type.caption.fontSize,
  },
  previewBody: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
  },
  note: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
    marginTop: spacing.md,
  },
});
