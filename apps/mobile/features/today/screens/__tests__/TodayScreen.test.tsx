import React from 'react';
import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { TodayScreen } from '../TodayScreen';

describe('TodayScreen', () => {
  it('renders the approved empty-state copy rather than manufactured content', () => {
    // "Do not manufacture content when the user has nothing to show." —
    // docs/MASTER_BUILD_SPEC.md §31, Non-Negotiable Rule 11.
    renderWithProviders(<TodayScreen />);

    expect(screen.getByText('Nothing urgent today.')).toBeTruthy();
    expect(screen.getByText('Your PRISM is here whenever you need it.')).toBeTruthy();
  });

  it('renders the Today heading', () => {
    renderWithProviders(<TodayScreen />);
    expect(screen.getByText('Today')).toBeTruthy();
  });
});
