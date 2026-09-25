import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';
import { SideMenu } from '../SideMenu';
import { useModules, useProfile } from '../../../lib/profile/queries';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
}));

jest.mock('../../../lib/profile/queries', () => ({
  useModules: jest.fn(),
  useProfile: jest.fn(),
}));

const mockedUseModules = useModules as jest.MockedFunction<typeof useModules>;
const mockedUseProfile = useProfile as jest.MockedFunction<typeof useProfile>;

describe('SideMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseModules.mockReturnValue({ data: [] } as never);
    mockedUseProfile.mockReturnValue({ data: { display_name: 'Dominic Perignon' } } as never);
  });

  it('always shows Settings, as a labeled row, whichever features are on', () => {
    renderWithProviders(<SideMenu visible onClose={jest.fn()} />);

    expect(screen.getByLabelText('Settings')).toBeTruthy();
    expect(screen.getByText('Settings')).toBeTruthy();
  });

  it('shows Settings even before anything has loaded', () => {
    mockedUseModules.mockReturnValue({ data: undefined } as never);
    mockedUseProfile.mockReturnValue({ data: undefined } as never);

    renderWithProviders(<SideMenu visible onClose={jest.fn()} />);

    expect(screen.getByText('Settings')).toBeTruthy();
    expect(screen.getByLabelText('Your profile')).toBeTruthy();
  });

  it('closes the menu and opens Settings when tapped', () => {
    const onClose = jest.fn();
    renderWithProviders(<SideMenu visible onClose={onClose} />);

    fireEvent.press(screen.getByLabelText('Settings'));

    expect(onClose).toHaveBeenCalled();
    expect(router.push).toHaveBeenCalledWith('/you/settings');
  });
});
