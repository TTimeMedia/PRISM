import React from 'react';
import { Stack } from 'expo-router';

/**
 * YOU — Screens 53-66 (Legal Journey/Documents, 67-71, are P1, no
 * screens yet). A plain internal stack; every screen renders its own
 * header (PRISMHeader) so the native header stays hidden throughout. See
 * docs/SCREEN_BIBLE.md §9.
 */
/**
 * Always keep this tab's first screen underneath, even when another screen
 * in it is opened directly (for example from the side menu). Otherwise the
 * tab would keep showing that screen instead of its home.
 */
export const unstable_settings = { initialRouteName: 'index' };

export default function YouLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
