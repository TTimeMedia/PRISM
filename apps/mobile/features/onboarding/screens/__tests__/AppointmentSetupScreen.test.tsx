import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { AppointmentSetupScreen } from '../AppointmentSetupScreen';
import { useProfile, useSetModuleEnabled, useUpdateProfile } from '../../../../lib/profile/queries';
import { useCreateAppointment } from '../../../../lib/care/mutations';

jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
}));

jest.mock('../../../../lib/profile/queries', () => ({
  useProfile: jest.fn(),
  useUpdateProfile: jest.fn(),
  useSetModuleEnabled: jest.fn(),
}));

jest.mock('../../../../lib/care/mutations', () => ({
  useCreateAppointment: jest.fn(),
}));

const mockedUseProfile = useProfile as jest.MockedFunction<typeof useProfile>;
const mockedUseUpdateProfile = useUpdateProfile as jest.MockedFunction<typeof useUpdateProfile>;
const mockedUseSetModuleEnabled = useSetModuleEnabled as jest.MockedFunction<
  typeof useSetModuleEnabled
>;
const mockedUseCreateAppointment = useCreateAppointment as jest.MockedFunction<
  typeof useCreateAppointment
>;

/**
 * Regression coverage for converting "Appointment type" from free text to
 * the existing selectable-chip pattern (the same
 * SUGGESTED_APPOINTMENT_CATEGORY_OPTIONS AppointmentForm already uses in
 * CARE) — a user selects a category, never types one.
 */
describe('AppointmentSetupScreen — Appointment type', () => {
  const updateProfileMutateAsync = jest.fn().mockResolvedValue(undefined);
  const setModuleEnabledMutateAsync = jest.fn().mockResolvedValue(undefined);
  const createAppointmentMutateAsync = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseProfile.mockReturnValue({ data: { intent: [] } } as never);
    mockedUseUpdateProfile.mockReturnValue({ mutateAsync: updateProfileMutateAsync } as never);
    mockedUseSetModuleEnabled.mockReturnValue({
      mutateAsync: setModuleEnabledMutateAsync,
    } as never);
    mockedUseCreateAppointment.mockReturnValue({
      mutateAsync: createAppointmentMutateAsync,
    } as never);
    updateProfileMutateAsync.mockResolvedValue(undefined);
    setModuleEnabledMutateAsync.mockResolvedValue(undefined);
    createAppointmentMutateAsync.mockResolvedValue(undefined);
  });

  it('offers the same suggested categories as CARE’s Appointment form, as selectable chips', () => {
    renderWithProviders(<AppointmentSetupScreen />);

    expect(screen.getByText('Primary care')).toBeTruthy();
    expect(screen.getByText('Endocrinology')).toBeTruthy();
    expect(screen.getByText('Mental health')).toBeTruthy();
    // Never a free-text field for this anymore.
    expect(screen.queryByLabelText('Appointment type')).toBeNull();
  });

  it('creates the appointment with the selected category, never a typed string', async () => {
    renderWithProviders(<AppointmentSetupScreen />);

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
});
