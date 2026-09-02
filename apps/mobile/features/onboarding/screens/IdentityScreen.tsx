import React, { useState } from 'react';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getNextOnboardingStep } from '@prism/types';
import { identitySchema, type IdentityInput } from '@prism/validation';
import { PRISMInput } from '@prism/ui';
import { OnboardingScreenLayout } from '../components/OnboardingScreenLayout';
import { onboardingStepHref } from '../../../lib/onboarding/routes';
import { useUpdateProfile } from '../../../lib/profile/queries';

/** Screen 11 — Identity. Every field optional and skippable — see docs/PRODUCT_BIBLE.md §8.2 (No Assumptions). */
export function IdentityScreen() {
  const updateProfile = useUpdateProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting: isFormSubmitting },
  } = useForm<IdentityInput>({
    resolver: zodResolver(identitySchema),
    defaultValues: { display_name: '', pronouns: '', gender: '' },
  });

  const submit = async (values: IdentityInput) => {
    setIsSubmitting(true);
    const next = getNextOnboardingStep('identity', { careSetup: null, intent: null });
    await updateProfile.mutateAsync({
      display_name: values.display_name || null,
      pronouns: values.pronouns || null,
      gender: values.gender || null,
      onboarding_step: next,
    });
    setIsSubmitting(false);
    router.replace(onboardingStepHref(next));
  };

  const skip = async () => {
    setIsSubmitting(true);
    const next = getNextOnboardingStep('identity', { careSetup: null, intent: null });
    await updateProfile.mutateAsync({ onboarding_step: next });
    setIsSubmitting(false);
    router.replace(onboardingStepHref(next));
  };

  return (
    <OnboardingScreenLayout
      title="Tell PRISM about you."
      subtitle="Everything here is optional."
      primaryLabel="Continue"
      onPrimaryPress={handleSubmit(submit)}
      primaryLoading={isSubmitting || isFormSubmitting}
      onSkip={skip}
    >
      <Controller
        control={control}
        name="display_name"
        render={({ field }) => (
          <PRISMInput
            label="Name"
            value={field.value ?? ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
      <Controller
        control={control}
        name="pronouns"
        render={({ field }) => (
          <PRISMInput
            label="Pronouns"
            value={field.value ?? ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
      <Controller
        control={control}
        name="gender"
        render={({ field }) => (
          <PRISMInput
            label="Gender"
            value={field.value ?? ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
    </OnboardingScreenLayout>
  );
}
