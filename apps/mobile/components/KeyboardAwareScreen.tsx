import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

export interface KeyboardAwareScreenProps {
  children: React.ReactNode;
  /**
   * Rendered below the scrollable `children`, inside the same
   * `KeyboardAvoidingView` but outside the `ScrollView` — for a primary
   * action that's normally pinned to the bottom of the screen (e.g.
   * OnboardingScreenLayout's Continue button) and must rise above the
   * keyboard along with everything else, without becoming *part of* the
   * scrollable content (which would leave it floating mid-screen on a
   * short form instead of anchored at the bottom).
   */
  footer?: React.ReactNode;
}

/**
 * Wraps any screen containing form inputs so the keyboard never covers
 * the focused field — see docs/MASTER_BUILD_SPEC.md §01 (Foundation:
 * "keyboard-aware behavior") and docs/SCREEN_BIBLE.md §3 (Global Screen
 * Contract: "keyboard-aware layout"). Onboarding, Add Medication, New
 * Journal Entry, and every other form screen should use this rather
 * than each re-implementing keyboard handling.
 */
export function KeyboardAwareScreen({ children, footer }: KeyboardAwareScreenProps) {
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        // Scrolling (dragging the content, e.g. to tap something further
        // down) also dismisses the keyboard — the standard way to tap
        // "outside" a field without hunting for exact blank space.
        keyboardDismissMode="on-drag"
      >
        {children}
      </ScrollView>
      {footer}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
});
