import React from 'react';
import { router } from 'expo-router';
import { TourSlides } from '../../onboarding/components/TourSlides';

/** You → How Prism works. Replays the onboarding walkthrough any time. */
export function HowItWorksScreen() {
  return <TourSlides doneLabel="Done" onDone={() => router.back()} />;
}
