import React from 'react';
import { ScrollView, Text } from 'react-native';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { OnboardingScreenLayout } from '../OnboardingScreenLayout';

/**
 * Regression coverage for the physical-device QA bug: on a screen with
 * text inputs (Identity, Medication Setup, Appointment Setup, Journey
 * Date), the keyboard could remain open and cover the primary action —
 * because that action lived outside `KeyboardAwareScreen`'s keyboard-
 * avoiding area entirely, at a screen position the keyboard could
 * freely cover with nothing repositioning it. See this component's own
 * header and components/KeyboardAwareScreen.tsx's.
 */
describe('OnboardingScreenLayout', () => {
  it('renders the primary action and fires onPrimaryPress', () => {
    const onPrimaryPress = jest.fn();
    renderWithProviders(
      <OnboardingScreenLayout title="Title" primaryLabel="Continue" onPrimaryPress={onPrimaryPress}>
        <Text>Field content</Text>
      </OnboardingScreenLayout>,
    );

    fireEvent.press(screen.getByText('Continue'));
    expect(onPrimaryPress).toHaveBeenCalledTimes(1);
  });

  it('keeps the primary action outside the ScrollView — never nested inside the scrollable content', () => {
    const { UNSAFE_root } = renderWithProviders(
      <OnboardingScreenLayout title="Title" primaryLabel="Continue" onPrimaryPress={jest.fn()}>
        <Text testID="field">Field content</Text>
      </OnboardingScreenLayout>,
    );

    const scrollView = UNSAFE_root.findByType(ScrollView);
    expect(scrollView.findAllByProps({ testID: 'field' }).length).toBeGreaterThan(0);
    expect(scrollView.findAllByProps({ children: 'Continue' })).toHaveLength(0);
  });

  it('renders an onSkip action when provided', () => {
    const onSkip = jest.fn();
    renderWithProviders(
      <OnboardingScreenLayout
        title="Title"
        primaryLabel="Continue"
        onPrimaryPress={jest.fn()}
        onSkip={onSkip}
      >
        <Text>Field content</Text>
      </OnboardingScreenLayout>,
    );

    fireEvent.press(screen.getByText('Skip'));
    expect(onSkip).toHaveBeenCalledTimes(1);
  });
});
