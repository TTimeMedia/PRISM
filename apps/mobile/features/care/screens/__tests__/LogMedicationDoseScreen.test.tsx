import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { LogMedicationDoseScreen } from '../LogMedicationDoseScreen';
import { useMedication } from '../../../../lib/care/queries';
import { useCreateMedicationLog } from '../../../../lib/care/mutations';

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn() },
  useLocalSearchParams: () => ({ id: '11111111-1111-4111-8111-111111111111' }),
}));

jest.mock('../../../../lib/care/queries', () => ({
  useMedication: jest.fn(),
}));

jest.mock('../../../../lib/care/mutations', () => ({
  useCreateMedicationLog: jest.fn(),
}));

const mockedUseMedication = useMedication as jest.MockedFunction<typeof useMedication>;
const mockedUseCreateLog = useCreateMedicationLog as jest.MockedFunction<
  typeof useCreateMedicationLog
>;

describe('LogMedicationDoseScreen — injection site', () => {
  const mutateAsync = jest.fn().mockResolvedValue({});

  beforeEach(() => {
    jest.clearAllMocks();
    mutateAsync.mockResolvedValue({});
    mockedUseCreateLog.mockReturnValue({ mutateAsync, isPending: false } as never);
  });

  it('asks where an injectable dose went in, and saves it with the dose', async () => {
    mockedUseMedication.mockReturnValue({ data: { id: 'm1', form: 'injection' } } as never);

    renderWithProviders(<LogMedicationDoseScreen />);

    expect(screen.getByText('Where (optional)')).toBeTruthy();
    fireEvent.press(screen.getByText('Left thigh'));
    fireEvent.press(screen.getByText('Save entry'));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'completed', site: 'left_thigh' }),
      ),
    );
  });

  it('lets the site be skipped', async () => {
    mockedUseMedication.mockReturnValue({ data: { id: 'm1', form: 'injection' } } as never);

    renderWithProviders(<LogMedicationDoseScreen />);
    fireEvent.press(screen.getByText('Save entry'));

    await waitFor(() => expect(mutateAsync).toHaveBeenCalled());
    expect(mutateAsync.mock.calls[0]?.[0].site ?? null).toBeNull();
  });

  it('does not ask about a site for a medication that is not injectable', async () => {
    mockedUseMedication.mockReturnValue({ data: { id: 'm1', form: 'pill' } } as never);

    renderWithProviders(<LogMedicationDoseScreen />);

    expect(screen.queryByText('Where (optional)')).toBeNull();
    fireEvent.press(screen.getByText('Save entry'));
    await waitFor(() => expect(mutateAsync).toHaveBeenCalled());
    expect(mutateAsync.mock.calls[0]?.[0].site ?? null).toBeNull();
  });
});
