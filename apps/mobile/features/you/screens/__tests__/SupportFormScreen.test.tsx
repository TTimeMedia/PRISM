import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { SupportFormScreen } from '../SupportFormScreen';
import { submitSupportRequest } from '../../../../lib/you/support';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
}));

jest.mock('../../../../lib/auth/AuthProvider', () => ({
  useSession: () => ({ session: { user: { id: 'u1' } } }),
}));

jest.mock('../../../../lib/supabase/client', () => ({ supabase: {} }));

jest.mock('../../../../lib/you/support', () => ({
  ...jest.requireActual('../../../../lib/you/support'),
  submitSupportRequest: jest.fn(),
}));

const mockedSubmit = submitSupportRequest as jest.MockedFunction<typeof submitSupportRequest>;

describe('SupportFormScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedSubmit.mockResolvedValue({ emailed: true });
  });

  it('sends the message from inside the app and goes back', async () => {
    renderWithProviders(<SupportFormScreen kind="contact" />);

    fireEvent.changeText(screen.getByLabelText('Message'), 'How do I export?');
    fireEvent.press(screen.getByText('Send'));

    await waitFor(() =>
      expect(mockedSubmit).toHaveBeenCalledWith({
        userId: 'u1',
        kind: 'contact',
        message: 'How do I export?',
        screen: undefined,
        screenshotUri: null,
      }),
    );
    expect(router.back).toHaveBeenCalled();
  });

  it('leaves a shake screenshot out unless the person turns it on', async () => {
    renderWithProviders(
      <SupportFormScreen kind="problem" screenshotUri="file:///shot.jpg" fromScreen="/care" />,
    );

    expect(
      screen.getByLabelText('Attach this screenshot').props.accessibilityState?.checked,
    ).not.toBe(true);
    fireEvent.changeText(screen.getByLabelText('Message'), 'The menu lags.');
    fireEvent.press(screen.getByText('Send'));

    await waitFor(() => expect(mockedSubmit).toHaveBeenCalled());
    expect(mockedSubmit.mock.calls[0][0]).toMatchObject({
      kind: 'problem',
      screen: '/care',
      screenshotUri: null,
    });
  });

  it('attaches the screenshot once switched on', async () => {
    renderWithProviders(
      <SupportFormScreen kind="problem" screenshotUri="file:///shot.jpg" fromScreen="/care" />,
    );

    fireEvent(screen.getByLabelText('Attach this screenshot'), 'valueChange', true);
    fireEvent.changeText(screen.getByLabelText('Message'), 'The menu lags.');
    fireEvent.press(screen.getByText('Send'));

    await waitFor(() => expect(mockedSubmit).toHaveBeenCalled());
    expect(mockedSubmit.mock.calls[0][0].screenshotUri).toBe('file:///shot.jpg');
  });

  it('stays put and says so when sending fails', async () => {
    mockedSubmit.mockRejectedValue(new Error('offline'));
    renderWithProviders(<SupportFormScreen kind="privacy" />);

    fireEvent.changeText(screen.getByLabelText('Message'), 'Who can see my data?');
    fireEvent.press(screen.getByText('Send'));

    await waitFor(() => expect(screen.getByText(/Couldn't send that/)).toBeTruthy());
    expect(router.back).not.toHaveBeenCalled();
  });
});
