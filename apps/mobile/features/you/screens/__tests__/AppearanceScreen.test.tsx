import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { AppearanceScreen } from '../AppearanceScreen';
import { useSettings, useUpdateSettings } from '../../../../lib/profile/queries';
import { useAppStore } from '../../../../lib/store/appStore';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
}));

jest.mock('../../../../lib/profile/queries', () => ({
  useSettings: jest.fn(),
  useUpdateSettings: jest.fn(),
}));

const mockedUseSettings = useSettings as jest.MockedFunction<typeof useSettings>;
const mockedUseUpdateSettings = useUpdateSettings as jest.MockedFunction<typeof useUpdateSettings>;

const mutate = jest.fn();

describe('AppearanceScreen colors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.setState({ palette: 'slate' });
    mockedUseSettings.mockReturnValue({
      data: { theme: 'system' },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as never);
    mockedUseUpdateSettings.mockReturnValue({ mutate } as never);
  });

  it('marks the current palette as selected and switches it when another is pressed', () => {
    renderWithProviders(<AppearanceScreen />);

    expect(screen.getByLabelText(/^Slate./).props.accessibilityState.selected).toBe(true);

    fireEvent.press(screen.getByLabelText(/^Ember./));

    expect(useAppStore.getState().palette).toBe('ember');
    expect(mutate).toHaveBeenCalledWith({ palette: 'ember' });
    expect(screen.getByLabelText(/^Ember./).props.accessibilityState.selected).toBe(true);
    expect(screen.getByLabelText(/^Slate./).props.accessibilityState.selected).toBe(false);
  });
});
