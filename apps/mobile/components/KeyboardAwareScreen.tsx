import React, { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { spacing } from '@prism/ui';

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
 *
 * Two iOS details make that true below a header:
 * - KeyboardAvoidingView measures itself against its parent, not the
 *   screen, so on its own it misses the header's height and the bottom
 *   fields stay under the keyboard. Its offset is where it really sits.
 * - When the keyboard opens, the field being typed in is scrolled up
 *   just far enough to clear it.
 */
export function KeyboardAwareScreen({ children, footer }: KeyboardAwareScreenProps) {
  const container = useRef<View>(null);
  const scroll = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  const [top, setTop] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    const subscription = Keyboard.addListener('keyboardDidShow', (event) => {
      const input = TextInput.State.currentlyFocusedInput();
      input?.measureInWindow((_x, y, _width, height) => {
        const keyboardTop = event.endCoordinates.screenY;
        // Enough to show the whole field, but never past its top edge.
        const overlap = Math.min(y + height + spacing.md - keyboardTop, y - top - spacing.md);
        if (overlap > 0) {
          scroll.current?.scrollTo({ y: scrollY.current + overlap, animated: true });
        }
      });
    });
    return () => subscription.remove();
  }, [top]);

  return (
    <View
      ref={container}
      style={styles.flex}
      onLayout={() => container.current?.measureInWindow((_x, y) => setTop(y))}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? top : 20}
      >
        <ScrollView
          ref={scroll}
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          // Scrolling (dragging the content, e.g. to tap something further
          // down) also dismisses the keyboard — the standard way to tap
          // "outside" a field without hunting for exact blank space.
          keyboardDismissMode="on-drag"
          onScroll={(event) => {
            scrollY.current = event.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
        >
          {children}
        </ScrollView>
        {footer}
      </KeyboardAvoidingView>
    </View>
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
