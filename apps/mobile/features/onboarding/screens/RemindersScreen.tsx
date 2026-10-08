import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Bell, CalendarDays, Package, Pill, type LucideIcon } from 'lucide-react-native';
import { getNextOnboardingStep } from '@prism/types';
import { radius, spacing, type, useTheme } from '@prism/ui';
import { OnboardingScreenLayout } from '../components/OnboardingScreenLayout';
import { Reveal } from '../../../components/motion';
import { onboardingStepHref } from '../../../lib/onboarding/routes';
import { useUpdateProfile } from '../../../lib/profile/queries';
import { requestNotificationPermissions } from '../../../lib/reminders/notificationScheduler';

/** What Prism sends once notifications are on (lib/reminders/useReminderSync.ts). */
const USES: { icon: LucideIcon; text: string }[] = [
  { icon: Pill, text: 'Dose and shot reminders, with one follow-up if a dose is missed' },
  { icon: CalendarDays, text: 'A heads-up before each appointment' },
  { icon: Package, text: 'A reminder before a supply runs out or needs a refill' },
];

/**
 * Reminders — the one place onboarding turns notifications on. It says what
 * Prism uses them for, then asks for the phone's permission at a moment
 * that makes sense instead of a surprise system prompt the first time a
 * reminder is saved. What each notification says was chosen on the screen
 * before (Privacy Setup). Reminders are scheduled on the phone
 * (lib/reminders/notificationScheduler.ts), so this only needs the OS
 * permission; declining never blocks setup.
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
      title="Turn on notifications."
      subtitle="Prism uses notifications for gentle reminders about the things you track. Your phone will ask for permission next."
      primaryLabel={declinedNote ? 'Continue' : 'Turn on notifications'}
      onPrimaryPress={declinedNote ? skip : turnOn}
      primaryLoading={isSubmitting}
      onSkip={declinedNote ? undefined : skip}
      skipLabel="Not now"
    >
      <View style={styles.uses}>
        {USES.map(({ icon: Icon, text }, index) => (
          <Reveal key={text} index={index + 3}>
            <View style={styles.use}>
              <View style={[styles.useIcon, { backgroundColor: theme.colors.field }]}>
                <Icon size={20} color={theme.colors.text.primary} strokeWidth={2} />
              </View>
              <Text style={[styles.useText, { color: theme.colors.text.primary }]}>{text}</Text>
            </View>
          </Reveal>
        ))}
      </View>
      <Reveal index={USES.length + 3}>
        <Text style={[styles.note, { color: theme.colors.text.secondary }]}>
          {declinedNote
            ? "No problem. Notifications are off for now. You can turn them on any time in your phone's Settings under Notifications."
            : 'What they say follows the privacy choice you just made. You can change how reminders work any time in You → Notifications.'}
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
  uses: {
    gap: spacing.md,
  },
  use: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  useIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  useText: {
    flex: 1,
    fontSize: type.bodyM.fontSize,
    lineHeight: type.bodyM.lineHeight,
  },
  note: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
    marginTop: spacing.lg,
  },
});
