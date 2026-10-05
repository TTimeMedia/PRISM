import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { SupportScreen } from '../SupportScreen';
import { useAppStore } from '../../../../lib/store/appStore';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
}));

jest.mock('../../../../lib/supabase/client', () => ({ supabase: {} }));

describe('SupportScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.setState({ shakeToReport: true });
  });

  it('opens the Help center and each form inside the app, not an email draft', () => {
    renderWithProviders(<SupportScreen />);

    fireEvent.press(screen.getByText('Help center'));
    fireEvent.press(screen.getByText('Contact support'));
    fireEvent.press(screen.getByText('Report a problem'));
    fireEvent.press(screen.getByText('Privacy concern'));

    expect((router.push as jest.Mock).mock.calls.map((call) => call[0])).toEqual([
      '/you/help',
      '/you/support/contact',
      '/you/support/problem',
      '/you/support/privacy',
    ]);
  });

  it('lets shake to report be turned off', () => {
    renderWithProviders(<SupportScreen />);

    fireEvent(screen.getByLabelText('Shake to report a problem'), 'valueChange', false);

    expect(useAppStore.getState().shakeToReport).toBe(false);
  });
});
