import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import type { Module } from '@prism/types';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { CustomizeScreen } from '../CustomizeScreen';
import { useModules, useSetModuleEnabled } from '../../../../lib/profile/queries';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
}));

jest.mock('../../../../lib/profile/queries', () => ({
  useModules: jest.fn(),
  useSetModuleEnabled: jest.fn(),
}));

const mockedUseModules = useModules as jest.MockedFunction<typeof useModules>;
const mockedUseSetModuleEnabled = useSetModuleEnabled as jest.MockedFunction<
  typeof useSetModuleEnabled
>;

function module(overrides: Partial<Module> = {}): Module {
  return {
    id: 'mod1',
    user_id: 'u1',
    module_key: 'medications',
    enabled: false,
    configuration: {},
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('CustomizeScreen', () => {
  const mutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseSetModuleEnabled.mockReturnValue({ mutate } as never);
  });

  it('lists every P0 module, off by default with no module rows yet', () => {
    mockedUseModules.mockReturnValue({ data: [], isLoading: false, isError: false } as never);

    renderWithProviders(<CustomizeScreen />);

    expect(screen.getByText('Medications')).toBeTruthy();
    expect(screen.getByText('Injections')).toBeTruthy();
    expect(screen.getByText('Appointments')).toBeTruthy();
    expect(screen.getByText('Milestones')).toBeTruthy();
    expect(screen.getByText('Journal')).toBeTruthy();
  });

  it('toggling a module calls useSetModuleEnabled with the new value', () => {
    mockedUseModules.mockReturnValue({
      data: [module({ enabled: false })],
      isLoading: false,
      isError: false,
    } as never);

    renderWithProviders(<CustomizeScreen />);
    fireEvent(screen.getByLabelText('Medications enabled'), 'valueChange', true);

    expect(mutate).toHaveBeenCalledWith({ moduleKey: 'medications', enabled: true });
  });

  it('navigates to Module Configuration when Configure is pressed', () => {
    mockedUseModules.mockReturnValue({ data: [], isLoading: false, isError: false } as never);

    renderWithProviders(<CustomizeScreen />);
    fireEvent.press(screen.getByLabelText('Configure Medications'));

    expect(router.push).toHaveBeenCalledWith('/you/customize/medications');
  });
});
