import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { CareHomeScreen } from '../CareHomeScreen';
import { useModules, useSetModuleEnabled } from '../../../../lib/profile/queries';
import { useAppointments, useInjections, useMedications } from '../../../../lib/care/queries';

// The top bar and menu have their own tests.
jest.mock('../../../../components/home/TopBar', () => ({ TopBar: () => null }));

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
}));

jest.mock('../../../../lib/profile/queries', () => ({
  useModules: jest.fn(),
  useSetModuleEnabled: jest.fn(),
}));

jest.mock('../../../../lib/care/queries', () => ({
  useMedications: jest.fn(),
  useInjections: jest.fn(),
  useAppointments: jest.fn(),
}));

// The import sheet lives on this screen but stays closed; it needs the queries and mutations above.
jest.mock('../../../../lib/care/mutations', () => ({
  useCreateAppointment: jest.fn(() => ({ mutateAsync: jest.fn() })),
}));

const mockedUseModules = useModules as jest.MockedFunction<typeof useModules>;
const mockedUseSetModuleEnabled = useSetModuleEnabled as jest.MockedFunction<
  typeof useSetModuleEnabled
>;
const mockedUseMedications = useMedications as jest.MockedFunction<typeof useMedications>;
const mockedUseInjections = useInjections as jest.MockedFunction<typeof useInjections>;
const mockedUseAppointments = useAppointments as jest.MockedFunction<typeof useAppointments>;

const list = (data: unknown[]) => ({ data, isLoading: false, isError: false }) as never;
const modules = (off: string[] = []) =>
  ['medications', 'injections', 'appointments', 'milestones', 'journal'].map((module_key) => ({
    module_key,
    enabled: !off.includes(module_key),
  }));

describe('CareHomeScreen', () => {
  const setEnabled = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseModules.mockReturnValue({
      data: modules(),
      isLoading: false,
      isError: false,
    } as never);
    mockedUseSetModuleEnabled.mockReturnValue({ mutate: setEnabled, isPending: false } as never);
    mockedUseMedications.mockReturnValue(list([]));
    mockedUseInjections.mockReturnValue(list([]));
    mockedUseAppointments.mockReturnValue(list([]));
  });

  it('gives every feature that is on a clear first step when it is empty', () => {
    renderWithProviders(<CareHomeScreen />);

    expect(screen.getByText('Add your first medication')).toBeTruthy();
    expect(screen.getByText('Add your next appointment')).toBeTruthy();
    expect(screen.getByText('Log your first injection')).toBeTruthy();
  });

  it('starts adding from the button under each block', () => {
    renderWithProviders(<CareHomeScreen />);

    fireEvent.press(screen.getByLabelText('Add your first medication'));
    expect(router.push).toHaveBeenCalledWith('/care/medications/add');
    fireEvent.press(screen.getByLabelText('Log your first injection'));
    expect(router.push).toHaveBeenCalledWith('/care/injections/add');
  });

  it('shows what is already there and opens it', () => {
    mockedUseMedications.mockReturnValue(
      list([
        {
          id: 'm1',
          name: 'Estradiol valerate',
          frequency_type: 'daily',
          frequency_config: { time_of_day: '09:00' },
          start_date: null,
          end_date: null,
        },
      ]),
    );

    renderWithProviders(<CareHomeScreen />);

    expect(screen.getByText('Add a medication')).toBeTruthy();
    fireEvent.press(screen.getByLabelText(/^Estradiol valerate/));
    expect(router.push).toHaveBeenCalledWith('/care/medications/m1');
  });

  it('leaves out a feature that is off instead of nudging people toward it', () => {
    mockedUseModules.mockReturnValue({
      data: modules(['injections']),
      isLoading: false,
      isError: false,
    } as never);

    renderWithProviders(<CareHomeScreen />);

    expect(screen.queryByText('Injections')).toBeNull();
    expect(screen.queryByText('Log your first injection')).toBeNull();
    expect(screen.queryByText('Turn on')).toBeNull();
    expect(screen.getByText('Add your first medication')).toBeTruthy();
  });

  it('points to where features can be added or removed', () => {
    renderWithProviders(<CareHomeScreen />);

    fireEvent.press(screen.getByLabelText(/^Choose what shows here/));
    expect(router.push).toHaveBeenCalledWith('/you/customize');
  });
});
