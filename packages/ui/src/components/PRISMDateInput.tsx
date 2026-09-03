import React from 'react';
import { PRISMInput, type PRISMInputProps } from './PRISMInput';

export interface PRISMDateInputProps extends Omit<
  PRISMInputProps,
  'keyboardType' | 'autoCapitalize' | 'helperText'
> {}

/**
 * A date field in the app's canonical YYYY-MM-DD wire format. The Global
 * Screen Contract (docs/SCREEN_BIBLE.md §3) calls for platform-native
 * date pickers; this is a validated text-entry stand-in for them, used
 * across onboarding's date fields (Medication/Appointment Setup, Journey
 * Date). Swapping in a real native picker is a tracked, non-blocking
 * follow-up — see docs/BUILD_STATUS.md — deferred rather than
 * integrating an unverified native module sight-unseen.
 */
export function PRISMDateInput(props: PRISMDateInputProps) {
  return (
    <PRISMInput
      keyboardType="numbers-and-punctuation"
      autoCapitalize="none"
      helperText="YYYY-MM-DD"
      {...props}
    />
  );
}
