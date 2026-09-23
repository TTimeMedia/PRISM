import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { onAccentColor, resolveAccentColor } from '@prism/ui';
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

describe('AppearanceScreen accent themes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.setState({ accentColor: 'cyan' });
    mockedUseSettings.mockReturnValue({
      data: { theme: 'system' },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as never);
    mockedUseUpdateSettings.mockReturnValue({ mutate: jest.fn() } as never);
  });

  it('marks the current accent as selected and switches it when another swatch is pressed', () => {
    renderWithProviders(<AppearanceScreen />);

    expect(screen.getByLabelText('Sky accent').props.accessibilityState.selected).toBe(true);

    fireEvent.press(screen.getByLabelText('Coral accent'));

    expect(useAppStore.getState().accentColor).toBe('coral');
    expect(screen.getByLabelText('Coral accent').props.accessibilityState.selected).toBe(true);
    expect(screen.getByLabelText('Sky accent').props.accessibilityState.selected).toBe(false);
  });
});

describe('accent helpers', () => {
  it('falls back to the default accent for an unknown key', () => {
    expect(resolveAccentColor(undefined)).toBe('#5BCFFB');
  });

  it('picks dark text on light accents and white text on dark accents', () => {
    expect(onAccentColor('#FFE58A')).toBe('#0B0B0F');
    expect(onAccentColor('#1A237E')).toBe('#FFFFFF');
  });
});
