import React from 'react';
import { Stack } from 'expo-router';
import { useSession } from '../../lib/auth/AuthProvider';

export default function AuthLayout() {
  const { isPasswordRecovery } = useSession();

  return (
    <Stack initialRouteName="sign-in" screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isPasswordRecovery}>
        <Stack.Screen name="reset-password" />
      </Stack.Protected>

      <Stack.Protected guard={!isPasswordRecovery}>
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="sign-up" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="verify-email" />
      </Stack.Protected>
    </Stack>
  );
}
