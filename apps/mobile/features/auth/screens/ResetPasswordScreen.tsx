import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, type ResetPasswordInput } from '@prism/validation';
import { PRISMButton, PRISMInput, spacing, useToast } from '@prism/ui';
import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { FormError } from '../components/FormError';
import { updatePassword } from '../../../lib/auth/actions';
import { getAuthErrorMessage } from '../../../lib/auth/errors';
import { useSession } from '../../../lib/auth/AuthProvider';

/**
 * Screen 06 — Reset Password. Only reachable while `isPasswordRecovery`
 * is true (see lib/auth/AuthProvider.tsx and app/_layout.tsx) — the
 * recovery session is established from the emailed deep link before this
 * screen ever renders.
 */
export function ResetPasswordScreen() {
  const { clearPasswordRecovery } = useSession();
  const { showToast } = useToast();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: ResetPasswordInput) => {
    setSubmitError(null);
    const { error } = await updatePassword(values.password);
    if (error) {
      setSubmitError(getAuthErrorMessage(error));
      return;
    }
    showToast('Your password has been reset.', 'success');
    // The root layout's guards route to (tabs) once this clears, since a
    // real session already exists from the recovery link.
    clearPasswordRecovery();
  };

  return (
    <AuthScreenLayout title="Choose a new password">
      {submitError ? <FormError message={submitError} /> : null}
      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <PRISMInput
            label="New password"
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
          label="Reset password"
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
