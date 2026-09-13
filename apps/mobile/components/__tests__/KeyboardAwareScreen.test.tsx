import React from 'react';
import { ScrollView, Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { KeyboardAwareScreen } from '../KeyboardAwareScreen';

/**
 * Regression coverage for the "keyboard covers the primary action" bug
 * (see docs/BUILD_STATUS.md and this component's own header): a screen
 * built from `KeyboardAwareScreen` must actually be wrapped in a
 * `KeyboardAvoidingView` with a scrollable, tap-friendly content area,
 * and an optional pinned `footer` must render alongside (not inside)
 * that scrollable area, so it can never end up scrolled away or nested
 * where the keyboard-avoiding behavior wouldn't reach it.
 */
describe('KeyboardAwareScreen', () => {
  it('renders its children', () => {
    render(
      <KeyboardAwareScreen>
        <Text>Field content</Text>
      </KeyboardAwareScreen>,
    );
    expect(screen.getByText('Field content')).toBeTruthy();
  });

  it('renders an optional footer alongside the scrollable children', () => {
    render(
      <KeyboardAwareScreen footer={<Text>Pinned action</Text>}>
        <Text>Field content</Text>
      </KeyboardAwareScreen>,
    );
    expect(screen.getByText('Field content')).toBeTruthy();
    expect(screen.getByText('Pinned action')).toBeTruthy();
  });

  it('keeps the footer outside the ScrollView — never nested inside the scrollable content', () => {
    const { UNSAFE_root } = render(
      <KeyboardAwareScreen footer={<Text testID="footer">Pinned action</Text>}>
        <Text testID="field">Field content</Text>
      </KeyboardAwareScreen>,
    );

    const scrollView = UNSAFE_root.findByType(ScrollView);
    expect(scrollView.findAllByProps({ testID: 'field' }).length).toBeGreaterThan(0);
    expect(scrollView.findAllByProps({ testID: 'footer' })).toHaveLength(0);
  });

  it('lets a tap on interactive content register on the first press while the keyboard is up', () => {
    const { UNSAFE_root } = render(
      <KeyboardAwareScreen>
        <Text>Field content</Text>
      </KeyboardAwareScreen>,
    );
    const scrollView = UNSAFE_root.findByType(ScrollView);
    // 'handled' — not the RN default 'never' — is what stops the first
    // tap on a button/field from being swallowed as a keyboard-dismiss
    // gesture, which was the "unnecessarily difficult to submit" half
    // of the reported bug.
    expect(scrollView.props.keyboardShouldPersistTaps).toBe('handled');
  });
});
