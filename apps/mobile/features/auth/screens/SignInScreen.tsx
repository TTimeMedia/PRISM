import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema, type SignInInput } from '@prism/validation';
import { PRISMButton, PRISMInput, spacing } from '@prism/ui';
import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { FormError } from '../components/FormError';
import { signIn } from '../../../lib/auth/actions';
import { getAuthErrorMessage, isEmailNotConfirmedError } from '../../../lib/auth/errors';

/** Screen 04 — Sign In. See docs/SCREEN_BIBLE.md §4. */
export function SignInScreen() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    getValues,
    formState: { isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: SignInInput) => {
    setSubmitError(null);
    const { error } = await signIn(values.email, values.password);
    if (error) {
      if (isEmailNotConfirmedError(error)) {
        router.push({ pathname: '/(auth)/verify-email', params: { email: values.email } });
        return;
      }
      setSubmitError(getAuthErrorMessage(error));
      return;
    }
    // Success routes automatically — the root layout's Stack.Protected
    // guards react to the session change and swap to (tabs).
  };

  return (
    <AuthScreenLayout
      title="Welcome back."
      footer={
        <PRISMButton
          label="Create account"
          variant="tertiary"
          onPress={() => router.replace('/(auth)/sign-up')}
        />
      }
    >
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
      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <PRISMInput
            label="Password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="current-password"
            textContentType="password"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <View style={styles.actions}>
        <PRISMButton label="Sign in" loading={isSubmitting} onPress={handleSubmit(onSubmit)} />
        <PRISMButton
          label="Forgot password?"
          variant="tertiary"
          onPress={() =>
            router.push({
              pathname: '/(auth)/forgot-password',
              params: { email: getValues('email') },
            })
          }
        />
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
});
