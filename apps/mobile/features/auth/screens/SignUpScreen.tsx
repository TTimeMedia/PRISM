import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema, type SignUpInput } from '@prism/validation';
import { PRISMButton, PRISMInput, spacing, type, useTheme } from '@prism/ui';
import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { FormError } from '../components/FormError';
import { signUp } from '../../../lib/auth/actions';
import { getAuthErrorMessage } from '../../../lib/auth/errors';

/** Screen 03 — Sign Up. See docs/SCREEN_BIBLE.md §4. */
export function SignUpScreen() {
  const theme = useTheme();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: SignUpInput) => {
    setSubmitError(null);
    const { data, error } = await signUp(values.email, values.password);
    if (error) {
      setSubmitError(getAuthErrorMessage(error));
      return;
    }
    if (!data.session) {
      // Email confirmation required — the normal path. A session means
      // auto-confirm is on (e.g. local dev) and the root gate takes over.
      router.replace({ pathname: '/(auth)/verify-email', params: { email: values.email } });
    }
  };

  return (
    <AuthScreenLayout
      title="Create your account"
      footer={
        <PRISMButton
          label="Sign in"
          variant="tertiary"
          onPress={() => router.replace('/(auth)/sign-in')}
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
            autoComplete="new-password"
            textContentType="newPassword"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field, fieldState }) => (
          <PRISMInput
            label="Confirm password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <View style={styles.actions}>
        <PRISMButton
          label="Create account"
          loading={isSubmitting}
          onPress={handleSubmit(onSubmit)}
        />
      </View>
      <Text style={[styles.legal, { color: theme.colors.text.tertiary }]}>
        By continuing, you agree to PRISM&apos;s Terms and Privacy Policy.
      </Text>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginTop: spacing.sm,
  },
  legal: {
    fontSize: type.caption.fontSize,
    lineHeight: type.caption.lineHeight,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
});
