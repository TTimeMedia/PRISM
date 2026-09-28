import React from 'react';
import { Linking } from 'react-native';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { SupportScreen } from '../SupportScreen';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
}));

describe('SupportScreen', () => {
  let openURL: jest.SpyInstance;

  beforeEach(() => {
    openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
  });

  afterEach(() => openURL.mockRestore());

  it('opens a problem report addressed to support', async () => {
    renderWithProviders(<SupportScreen />);

    fireEvent.press(screen.getByText('Report a problem'));

    await waitFor(() => expect(openURL).toHaveBeenCalledTimes(1));
    expect(openURL.mock.calls[0][0]).toMatch(
      /^mailto:support@ttimemedia\.org\?subject=Prism%20problem%20report/,
    );
  });

  it('names the address when no mail app can open it', async () => {
    openURL.mockRejectedValueOnce(new Error('no handler'));
    renderWithProviders(<SupportScreen />);

    fireEvent.press(screen.getByText('Contact support'));

    expect(
      await screen.findByText('No mail app found. Write to support@ttimemedia.org.'),
    ).toBeTruthy();
  });
});
