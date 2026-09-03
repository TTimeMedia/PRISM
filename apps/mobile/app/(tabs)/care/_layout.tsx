import React from 'react';
import { Stack } from 'expo-router';

/**
 * CARE — Screens 23-34. A plain internal stack; every screen renders its
 * own header (PRISMHeader) so the native header stays hidden throughout.
 * See docs/SCREEN_BIBLE.md §7.
 */
export default function CareLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
