import React from 'react';
import { Stack } from 'expo-router';
import { useSession } from '../../lib/auth/AuthProvider';

/**
 * Authentication screens. `reset-password` is only reachable while
 * `isPasswordRecovery` is true (a recovery session established from an
 * emailed deep link); every other auth screen is only reachable while it
 * is false. See lib/auth/AuthProvider.tsx.
 */
export default function AuthLayout() {
  const { isPasswordRecovery } = useSession();

  return (
    <Stack initialRouteName="welcome" screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isPasswordRecovery}>
        <Stack.Screen name="reset-password" />
      </Stack.Protected>
      <Stack.Protected guard={!isPasswordRecovery}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="sign-up" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="verify-email" />
      </Stack.Protected>
    </Stack>
  );
}
