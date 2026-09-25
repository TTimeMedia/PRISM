import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { AppointmentSetupScreen } from '../AppointmentSetupScreen';
import {
  useProfile,
  useSetModuleEnabled,
  useUpdateProfile,
  useUpdateSettings,
} from '../../../../lib/profile/queries';
import { useCreateAppointment } from '../../../../lib/care/mutations';
import { calendarProvider } from '../../../../lib/calendar';

jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
}));

jest.mock('../../../../lib/profile/queries', () => ({
  useProfile: jest.fn(),
  useUpdateProfile: jest.fn(),
  useSetModuleEnabled: jest.fn(),
  useUpdateSettings: jest.fn(),
}));

jest.mock('../../../../lib/care/queries', () => ({
  useAppointments: () => ({ data: [] }),
}));

jest.mock('../../../../lib/care/mutations', () => ({
  useCreateAppointment: jest.fn(),
}));

jest.mock('../../../../lib/calendar', () => ({
  calendarProvider: {
    requestPermission: jest.fn(),
    addAppointment: jest.fn(),
  },
}));

const mockedUseProfile = useProfile as jest.MockedFunction<typeof useProfile>;
const mockedUseUpdateProfile = useUpdateProfile as jest.MockedFunction<typeof useUpdateProfile>;
const mockedUseUpdateSettings = useUpdateSettings as jest.MockedFunction<typeof useUpdateSettings>;
const mockedUseSetModuleEnabled = useSetModuleEnabled as jest.MockedFunction<
  typeof useSetModuleEnabled
>;
const mockedUseCreateAppointment = useCreateAppointment as jest.MockedFunction<
  typeof useCreateAppointment
>;
const mockedProvider = calendarProvider as jest.Mocked<typeof calendarProvider>;

describe('AppointmentSetupScreen', () => {
  const updateProfileMutateAsync = jest.fn().mockResolvedValue(undefined);
  const updateSettingsMutateAsync = jest.fn().mockResolvedValue(undefined);
  const setModuleEnabledMutateAsync = jest.fn().mockResolvedValue(undefined);
  const createAppointmentMutateAsync = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseProfile.mockReturnValue({ data: { intent: [] } } as never);
    mockedUseUpdateProfile.mockReturnValue({ mutateAsync: updateProfileMutateAsync } as never);
    mockedUseUpdateSettings.mockReturnValue({ mutateAsync: updateSettingsMutateAsync } as never);
    mockedUseSetModuleEnabled.mockReturnValue({
      mutateAsync: setModuleEnabledMutateAsync,
    } as never);
    mockedUseCreateAppointment.mockReturnValue({
      mutateAsync: createAppointmentMutateAsync,
    } as never);
    updateProfileMutateAsync.mockResolvedValue(undefined);
    updateSettingsMutateAsync.mockResolvedValue(undefined);
    setModuleEnabledMutateAsync.mockResolvedValue(undefined);
    createAppointmentMutateAsync.mockResolvedValue(undefined);
    mockedProvider.requestPermission.mockResolvedValue(true);
    mockedProvider.addAppointment.mockResolvedValue('event-1');
  });

  it('asks whether to include appointments before showing anything else', () => {
    renderWithProviders(<AppointmentSetupScreen />);

    expect(screen.getByText('Include your appointments?')).toBeTruthy();
    expect(screen.getByText('Yes, include them')).toBeTruthy();
    expect(screen.getByText('Not right now')).toBeTruthy();
    expect(screen.queryByText('Sync with my calendar')).toBeNull();
    expect(screen.queryByText('Primary care')).toBeNull();
  });

  it('"Not right now" continues without turning appointments on', async () => {
    renderWithProviders(<AppointmentSetupScreen />);

    fireEvent.press(screen.getByText('Not right now'));
    fireEvent.press(screen.getByText('Continue'));

    await waitFor(() => expect(router.replace).toHaveBeenCalled());
    expect(setModuleEnabledMutateAsync).not.toHaveBeenCalled();
    expect(createAppointmentMutateAsync).not.toHaveBeenCalled();
    expect(updateSettingsMutateAsync).not.toHaveBeenCalled();
  });

  it('"Yes" turns appointments on and offers calendar sync, off by default', async () => {
    renderWithProviders(<AppointmentSetupScreen />);

    fireEvent.press(screen.getByText('Yes, include them'));
    expect(screen.getByText('Sync with my calendar')).toBeTruthy();
    // Nothing is requested until the switch is turned on.
    expect(mockedProvider.requestPermission).not.toHaveBeenCalled();

    fireEvent.press(screen.getByText('Continue'));

    await waitFor(() =>
      expect(setModuleEnabledMutateAsync).toHaveBeenCalledWith({
        moduleKey: 'appointments',
        enabled: true,
      }),
    );
    expect(updateSettingsMutateAsync).not.toHaveBeenCalled();
    expect(createAppointmentMutateAsync).not.toHaveBeenCalled();
  });

  it('asks for calendar access only when sync is turned on, then saves the setting', async () => {
    renderWithProviders(<AppointmentSetupScreen />);

    fireEvent.press(screen.getByText('Yes, include them'));
    fireEvent(screen.getByLabelText('Sync with my calendar'), 'valueChange', true);
    await waitFor(() => expect(mockedProvider.requestPermission).toHaveBeenCalledTimes(1));

    fireEvent.press(screen.getByText('Continue'));
    await waitFor(() =>
      expect(updateSettingsMutateAsync).toHaveBeenCalledWith({ calendar_sync_enabled: true }),
    );
  });

  it('does not turn sync on when calendar access is refused', async () => {
    mockedProvider.requestPermission.mockResolvedValue(false);
    renderWithProviders(<AppointmentSetupScreen />);

    fireEvent.press(screen.getByText('Yes, include them'));
    fireEvent(screen.getByLabelText('Sync with my calendar'), 'valueChange', true);
    await waitFor(() => expect(mockedProvider.requestPermission).toHaveBeenCalled());

    fireEvent.press(screen.getByText('Continue'));
    await waitFor(() => expect(router.replace).toHaveBeenCalled());
    expect(updateSettingsMutateAsync).not.toHaveBeenCalled();
  });

  it('offers the same suggested categories as the Care appointment form, as selectable chips', () => {
    renderWithProviders(<AppointmentSetupScreen />);

    fireEvent.press(screen.getByText('Yes, include them'));
    fireEvent.press(screen.getByText('Add my next appointment now'));

    expect(screen.getByText('Primary care')).toBeTruthy();
    expect(screen.getByText('Endocrinology')).toBeTruthy();
    expect(screen.getByText('Mental health')).toBeTruthy();
    // Never a free-text field for this.
    expect(screen.queryByLabelText('Appointment type')).toBeNull();
  });

  it('creates the appointment with the selected category, never a typed string', async () => {
    renderWithProviders(<AppointmentSetupScreen />);

    fireEvent.press(screen.getByText('Yes, include them'));
    fireEvent.press(screen.getByText('Add my next appointment now'));
    fireEvent.press(screen.getByText('Endocrinology'));
    fireEvent.press(screen.getByLabelText('Date'));
    fireEvent.press(screen.getByTestId('mock-datetimepicker-confirm'));
    fireEvent.press(screen.getByText('Done'));
    fireEvent.press(screen.getByText('Continue'));

    await waitFor(() =>
      expect(createAppointmentMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'Endocrinology', title: 'Endocrinology' }),
      ),
    );
    expect(router.replace).toHaveBeenCalled();
  });

  it('also adds the appointment to the calendar when sync is on', async () => {
    renderWithProviders(<AppointmentSetupScreen />);

    fireEvent.press(screen.getByText('Yes, include them'));
    fireEvent(screen.getByLabelText('Sync with my calendar'), 'valueChange', true);
    await waitFor(() => expect(mockedProvider.requestPermission).toHaveBeenCalled());
    fireEvent.press(screen.getByText('Add my next appointment now'));
    fireEvent.press(screen.getByText('Endocrinology'));
    fireEvent.press(screen.getByLabelText('Date'));
    fireEvent.press(screen.getByTestId('mock-datetimepicker-confirm'));
    fireEvent.press(screen.getByText('Done'));
    fireEvent.press(screen.getByText('Continue'));

    await waitFor(() =>
      expect(mockedProvider.addAppointment).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Endocrinology' }),
      ),
    );
  });
});
