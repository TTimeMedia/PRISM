import React, { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { PRIZMButton, spacing, useToast } from '@prizm/ui';
import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { FormError } from '../components/FormError';
import { resendVerificationEmail } from '../../../lib/auth/actions';
import { getAuthErrorMessage } from '../../../lib/auth/errors';
import { useSignInWhenConfirmed } from '../../../lib/auth/pendingSignUp';

/** Screen 07 — Email Verification. See docs/SCREEN_BIBLE.md §4. */
export function VerifyEmailScreen() {
  useSignInWhenConfirmed();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = params.email ?? '';
  const { showToast } = useToast();
  const [isResending, setIsResending] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  const openEmail = () => {
    // Best-effort — there's no universal cross-platform "open the mail
    // app" API. Silently no-ops where it can't be handled.
    Linking.openURL('mailto:').catch(() => {});
  };

  const resend = async () => {
    if (!email) return;
    setResendError(null);
    setIsResending(true);
    const { error } = await resendVerificationEmail(email);
    setIsResending(false);
    if (error) {
      setResendError(getAuthErrorMessage(error));
      return;
    }
    showToast('Verification email sent.', 'success');
  };

  return (
    <AuthScreenLayout
      title="Check your email."
      subtitle="We sent a link to confirm it's you. Tap it, then come back here: Prizm signs you in as soon as it's confirmed."
    >
      {resendError ? <FormError message={resendError} /> : null}
      <View style={styles.actions}>
        <PRIZMButton label="Open email" onPress={openEmail} />
        <PRIZMButton
          label="Resend email"
          variant="secondary"
          loading={isResending}
          onPress={resend}
        />
        <PRIZMButton
          label="Change email"
          variant="tertiary"
          onPress={() => router.replace('/(auth)/sign-up')}
        />
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.smd,
  },
});
