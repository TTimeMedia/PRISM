import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

export interface KeyboardAwareScreenProps {
  children: React.ReactNode;
}

/**
 * Wraps any screen containing form inputs so the keyboard never covers
 * the focused field — see docs/MASTER_BUILD_SPEC.md §01 (Foundation:
 * "keyboard-aware behavior") and docs/SCREEN_BIBLE.md §3 (Global Screen
 * Contract: "keyboard-aware layout"). Onboarding, Add Medication, New
 * Journal Entry, and every other form screen should use this rather
 * than each re-implementing keyboard handling.
 */
export function KeyboardAwareScreen({ children }: KeyboardAwareScreenProps) {
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
      >
        {children}
      </ScrollView>
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
