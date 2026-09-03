import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@prism/validation';
import { PRISMButton, PRISMInput, spacing } from '@prism/ui';
import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { FormError } from '../components/FormError';
import { sendPasswordResetEmail } from '../../../lib/auth/actions';
import { getAuthErrorMessage } from '../../../lib/auth/errors';

/**
 * Screen 05 — Forgot Password. See docs/SCREEN_BIBLE.md §4 and
 * docs/SECURITY.md §1 — the confirmation message is shown on every
 * successful submit regardless of whether the email exists (enumeration
 * protection). A genuine failure (network, rate limit) is *not* the same
 * as "email doesn't exist" and gets its own error copy instead.
 */
export function ForgotPasswordScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: params.email ?? '' },
  });

  const onSubmit = async (values: ForgotPasswordInput) => {
    setSubmitError(null);
    const { error } = await sendPasswordResetEmail(values.email);
    if (error) {
      setSubmitError(getAuthErrorMessage(error));
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <AuthScreenLayout
        title="Check your email"
        subtitle="If an account exists for this email, we'll send instructions to reset your password."
      >
        <PRISMButton
          label="Back to sign in"
          variant="secondary"
          onPress={() => router.replace('/(auth)/sign-in')}
        />
      </AuthScreenLayout>
    );
  }

  return (
    <AuthScreenLayout title="Reset your password">
      {submitError ? <FormError message={submitError} /> : null}
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <PRISMInput
            label="Email"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <View style={styles.actions}>
        <PRISMButton
          label="Send reset link"
          loading={isSubmitting}
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginTop: spacing.sm,
  },
});
