import React from 'react';
import { Stack } from 'expo-router';

/**
 * JOURNEY — Screens 41-49 (P0; Memories/50-52 are P1, no screens yet).
 * A plain internal stack; every screen renders its own header
 * (PRISMHeader) so the native header stays hidden throughout. See
 * docs/SCREEN_BIBLE.md §8.
 */
export default function JourneyLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
