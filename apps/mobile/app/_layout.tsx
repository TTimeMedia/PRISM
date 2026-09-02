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
import { ThemeProvider, PRISMToastProvider } from '@prism/ui';
import { GlobalErrorFallback } from '../components/GlobalErrorFallback';
import { OfflineBanner } from '../components/OfflineBanner';
import { AuthProvider, useSession } from '../lib/auth/AuthProvider';
import { queryClient } from '../lib/queryClient';
import { useAppStore } from '../lib/store/appStore';

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
 * Screen 01 — Splash: stays up while the app initializes (fonts +
 * the initial session check), then routes straight to the right place
 * (Today if authenticated, Welcome otherwise) — see
 * docs/SCREEN_BIBLE.md §4. Onboarding-resume routing is added in the
 * Personalization milestone once onboarding screens exist; for now any
 * authenticated session goes straight to (tabs).
 */
function RootNavigator({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { session, isLoading: authLoading, isPasswordRecovery } = useSession();
  const ready = fontsLoaded && !authLoading;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  const showTabs = !!session && !isPasswordRecovery;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={showTabs}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={!showTabs}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}
