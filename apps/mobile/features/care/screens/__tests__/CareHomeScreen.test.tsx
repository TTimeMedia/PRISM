import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { CareHomeScreen } from '../CareHomeScreen';
import { useModules, useSetModuleEnabled } from '../../../../lib/profile/queries';
import { useAppointments, useMedications } from '../../../../lib/care/queries';

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
    mockedUseAppointments.mockReturnValue(list([]));
  });

  it('gives every feature that is on a clear first step when it is empty', () => {
    renderWithProviders(<CareHomeScreen />);

    expect(screen.getByText('Add medication')).toBeTruthy();
    expect(screen.getByText('Add appointment')).toBeTruthy();
  });

  it('starts adding from the button under each block', () => {
    renderWithProviders(<CareHomeScreen />);

    fireEvent.press(screen.getByLabelText('Add medication'));
    expect(router.push).toHaveBeenCalledWith('/care/medications/add');
    fireEvent.press(screen.getByLabelText('Add appointment'));
    expect(router.push).toHaveBeenCalledWith('/care/appointments/add');
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

    // With something in the list, adding is the + beside the heading, not a big button.
    expect(screen.getByLabelText('Add a medication')).toBeTruthy();
    expect(screen.queryByText('No medications yet')).toBeNull();
    fireEvent.press(screen.getByLabelText(/^Estradiol valerate/));
    expect(router.push).toHaveBeenCalledWith('/care/medications/m1');
  });

  it('leaves out a feature that is off instead of nudging people toward it', () => {
    mockedUseModules.mockReturnValue({
      data: modules(['appointments']),
      isLoading: false,
      isError: false,
    } as never);

    renderWithProviders(<CareHomeScreen />);

    expect(screen.queryByText('Appointments')).toBeNull();
    expect(screen.queryByText('Add appointment')).toBeNull();
    expect(screen.queryByText('Turn on')).toBeNull();
    expect(screen.getByText('Add medication')).toBeTruthy();
  });

  it('has no separate injections section, because an injection is a medication', () => {
    renderWithProviders(<CareHomeScreen />);

    expect(screen.queryByText('Injections')).toBeNull();
    expect(screen.queryByText(/injection/i)).toBeNull();
  });

  it('does not repeat the switches when features are on', () => {
    renderWithProviders(<CareHomeScreen />);

    expect(screen.queryByText('Choose what shows')).toBeNull();
    expect(screen.queryByLabelText(/^Choose what shows here/)).toBeNull();
  });

  it('points to the switches only when nothing here is on', () => {
    mockedUseModules.mockReturnValue({
      data: modules(['medications', 'injections', 'appointments']),
      isLoading: false,
      isError: false,
    } as never);

    renderWithProviders(<CareHomeScreen />);

    fireEvent.press(screen.getByText('Choose what shows'));
    expect(router.push).toHaveBeenCalledWith('/you/customize');
  });
});
