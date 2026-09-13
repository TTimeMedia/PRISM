import React, { useState } from 'react';
import { router } from 'expo-router';
import { getNextOnboardingStep } from '@prism/types';
import { PRISMDateInput } from '@prism/ui';
import { OnboardingScreenLayout } from '../components/OnboardingScreenLayout';
import { ChipSelect } from '../components/ChipSelect';
import { JOURNEY_DATE_CHOICE_OPTIONS } from '../optionLabels';
import { onboardingStepHref } from '../../../lib/onboarding/routes';
import { useUpdateProfile } from '../../../lib/profile/queries';

/**
 * Screen 16 — Journey Date. Three mutually exclusive choices — "I don't
 * know", "My journey doesn't have one specific start date", "I have a
 * specific start date" — never a default is invented on the user's
 * behalf. "Choose a date" only ever appears once "I have a specific
 * start date" is selected; it previously showed unconditionally as the
 * screen's primary action, which made it look required even for users
 * who'd explicitly said they didn't have (or didn't know) a date. See
 * docs/SCREEN_BIBLE.md Screen 16 and docs/DECISIONS.md § Onboarding.
 */
export function JourneyDateScreen() {
  const updateProfile = useUpdateProfile();
  const [choice, setChoice] = useState<string[]>([]);
  const [choosingDate, setChoosingDate] = useState(false);
  const [date, setDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (journeyStartDate: string | null) => {
    setIsSubmitting(true);
    const next = getNextOnboardingStep('journey_date', { careSetup: null, intent: null });
    await updateProfile.mutateAsync({
      journey_start_date: journeyStartDate,
      onboarding_step: next,
    });
    setIsSubmitting(false);
    router.replace(onboardingStepHref(next));
  };

  if (choosingDate) {
    return (
      <OnboardingScreenLayout
        title="Does your journey have a start date?"
        primaryLabel="Continue"
        onPrimaryPress={() => submit(date || null)}
        primaryLoading={isSubmitting}
      >
        <PRISMDateInput label="Date" value={date} onChangeText={setDate} />
      </OnboardingScreenLayout>
    );
  }

  const selected = choice[0];
  const hasChosenSpecificDate = selected === 'specific_date';

  return (
    <OnboardingScreenLayout
      title="Does your journey have a start date?"
      primaryLabel={hasChosenSpecificDate ? 'Choose a date' : 'Continue'}
      onPrimaryPress={() => (hasChosenSpecificDate ? setChoosingDate(true) : submit(null))}
      primaryLoading={isSubmitting}
    >
      <ChipSelect
        options={JOURNEY_DATE_CHOICE_OPTIONS}
        selected={choice}
        onChange={setChoice}
        multiple={false}
      />
    </OnboardingScreenLayout>
  );
}
