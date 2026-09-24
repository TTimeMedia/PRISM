import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { MedicationSetupScreen } from '../MedicationSetupScreen';
import { useModules, useProfile, useUpdateProfile } from '../../../../lib/profile/queries';
import { useCreateMedication } from '../../../../lib/care/mutations';

jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
}));

jest.mock('../../../../lib/profile/queries', () => ({
  useProfile: jest.fn(),
  useModules: jest.fn(),
  useUpdateProfile: jest.fn(),
}));

jest.mock('../../../../lib/care/mutations', () => ({
  useCreateMedication: jest.fn(),
}));

const mockedUseProfile = useProfile as jest.MockedFunction<typeof useProfile>;
const mockedUseModules = useModules as jest.MockedFunction<typeof useModules>;
const mockedUseUpdateProfile = useUpdateProfile as jest.MockedFunction<typeof useUpdateProfile>;
const mockedUseCreateMedication = useCreateMedication as jest.MockedFunction<
  typeof useCreateMedication
>;

/** Picks a medication from the list. */
function pickMedication(name: string) {
  fireEvent.press(screen.getByLabelText('Medication name: Choose or search'));
  fireEvent.press(screen.getByLabelText(name));
}

describe('MedicationSetupScreen — schedule', () => {
  const createMutateAsync = jest.fn().mockResolvedValue(undefined);
  const updateProfileMutateAsync = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseProfile.mockReturnValue({ data: { intent: [] } } as never);
    mockedUseModules.mockReturnValue({ data: [] } as never);
    mockedUseUpdateProfile.mockReturnValue({ mutateAsync: updateProfileMutateAsync } as never);
    mockedUseCreateMedication.mockReturnValue({ mutateAsync: createMutateAsync } as never);
    createMutateAsync.mockResolvedValue(undefined);
    updateProfileMutateAsync.mockResolvedValue(undefined);
  });

  it('lets people pick the days for a weekly medication, and saves them', async () => {
    renderWithProviders(<MedicationSetupScreen />);

    pickMedication('Estradiol valerate');
    fireEvent.press(screen.getByText('Weekly'));
    fireEvent.press(screen.getByText('Mon'));
    fireEvent.press(screen.getByText('Thu'));
    fireEvent.press(screen.getByText('Save medication'));

    await waitFor(() =>
      expect(createMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Estradiol valerate',
          frequency_type: 'weekly',
          frequency_config: expect.objectContaining({ days_of_week: [1, 4] }),
        }),
      ),
    );
    expect(router.replace).toHaveBeenCalled();
  });

  it('asks for a day instead of saving a weekly medication that would never come up', async () => {
    renderWithProviders(<MedicationSetupScreen />);

    pickMedication('Estradiol valerate');
    fireEvent.press(screen.getByText('Weekly'));
    fireEvent.press(screen.getByText('Save medication'));

    expect(
      await screen.findByText('Pick at least one day so your reminders can be set.'),
    ).toBeTruthy();
    expect(createMutateAsync).not.toHaveBeenCalled();
  });

  it('offers a time of day once a frequency is chosen', () => {
    renderWithProviders(<MedicationSetupScreen />);

    expect(screen.queryByText('Time of day')).toBeNull();
    fireEvent.press(screen.getByText('Daily'));
    expect(screen.getByText('Time of day')).toBeTruthy();
  });
});
