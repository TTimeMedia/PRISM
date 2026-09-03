import 'react-native-reanimated';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { Sora_600SemiBold, Sora_700Bold } from '@expo-google-fonts/sora';
import { ThemeProvider, ReducedMotionProvider, PRISMToastProvider } from '@prism/ui';
import { GlobalErrorFallback } from '../components/GlobalErrorFallback';
import { OfflineBanner } from '../components/OfflineBanner';
import { AuthProvider, useSession } from '../lib/auth/AuthProvider';
import { queryClient } from '../lib/queryClient';
import { useAppStore } from '../lib/store/appStore';
import { useAppLockStore } from '../lib/store/appLockStore';
import { useProfile, useSettings } from '../lib/profile/queries';
import { useAppLockGate } from '../lib/you/useAppLockGate';
import { useReminderSync } from '../lib/reminders/useReminderSync';
import { AppLockScreen } from '../features/you/screens/AppLockScreen';

export { GlobalErrorFallback as ErrorBoundary };

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const themePreference = useAppStore((state) => state.themePreference);
  const [fontsLoaded, fontError] = useFonts({
    Inter: Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    Sora: Sora_600SemiBold,
    'Sora-Bold': Sora_700Bold,
  });

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ThemeProvider preference={themePreference}>
              <PRISMToastProvider>
                <OfflineBanner />
                <RootNavigator fontsLoaded={fontsLoaded} />
              </PRISMToastProvider>
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/**
 * Screen 01 — Splash: stays up while the app initializes (fonts, the
 * initial session check, and — once authenticated — the profile fetch
 * needed to know whether onboarding is complete), then routes straight
 * to the right place: (tabs) if onboarding is complete, (onboarding) —
 * resuming at profile.onboarding_step — if not, (auth) otherwise. See
 * docs/SCREEN_BIBLE.md §4 and the User Lifecycle in
 * docs/TECHNICAL_BIBLE.md §7.
 */
function RootNavigator({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { session, isLoading: authLoading, isPasswordRecovery } = useSession();
  const showAuth = !session || isPasswordRecovery;

  // Only meaningful once authenticated and not mid-recovery — useProfile()
  // itself no-ops (enabled: false) until there's a session to scope it to.
  const { data: profile, isLoading: profileLoading } = useProfile();

  const authReady = fontsLoaded && !authLoading;
  const needsProfile = authReady && !showAuth;
  const ready = authReady && (!needsProfile || !profileLoading);

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  const showTabs = !showAuth && !!profile?.onboarding_completed;
  const showOnboarding = !showAuth && !profile?.onboarding_completed;

  // Screen 78 — App Lock Screen. Only relevant once inside the app
  // proper; see lib/you/useAppLockGate.ts for the lock/re-lock logic.
  const { data: settings } = useSettings();
  const appLockEnabled = showTabs && !!settings?.app_lock_enabled;
  useAppLockGate(appLockEnabled);
  // Reminder engine — see lib/reminders/useReminderSync.ts. Only relevant
  // once inside the app proper (its own queries are already user-scoped).
  useReminderSync();
  const isLocked = useAppLockStore((state) => state.isLocked);
  const unlock = useAppLockStore((state) => state.unlock);
  const showAppLockScreen = appLockEnabled && isLocked;

  if (!ready) {
    return null;
  }

  return (
    <ReducedMotionProvider preference={!!settings?.reduced_motion}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={showTabs}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>
        <Stack.Protected guard={showOnboarding}>
          <Stack.Screen name="(onboarding)" />
        </Stack.Protected>
        <Stack.Protected guard={showAuth}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
      {showAppLockScreen ? (
        <AppLockScreen biometricEnabled={!!settings?.biometric_lock} onUnlock={unlock} />
      ) : null}
    </ReducedMotionProvider>
  );
}
