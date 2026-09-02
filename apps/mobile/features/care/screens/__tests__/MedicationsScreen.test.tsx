import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import type { Medication } from '@prism/types';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { MedicationsScreen } from '../MedicationsScreen';
import { useMedications } from '../../../../lib/care/queries';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
}));

jest.mock('../../../../lib/care/queries', () => ({
  useMedications: jest.fn(),
}));

const mockedUseMedications = useMedications as jest.MockedFunction<typeof useMedications>;

function medication(overrides: Partial<Medication> = {}): Medication {
  return {
    id: 'm1',
    user_id: 'u1',
    name: 'Estradiol',
    form: 'pill',
    dosage_text: '2mg',
    frequency_type: 'daily',
    frequency_config: null,
    start_date: null,
    end_date: null,
    reminder_enabled: false,
    notes: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('MedicationsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the approved empty state with no medications', () => {
    mockedUseMedications.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as never);

    renderWithProviders(<MedicationsScreen />);

    expect(screen.getByText('No medications yet.')).toBeTruthy();
  });

  it('lists an active medication under Active', () => {
    mockedUseMedications.mockReturnValue({
      data: [medication()],
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as never);

    renderWithProviders(<MedicationsScreen />);

    expect(screen.getByText('Active')).toBeTruthy();
    expect(screen.getByText('Estradiol')).toBeTruthy();
  });

  it('lists a paused medication (past end_date) under Paused, not Active', () => {
    mockedUseMedications.mockReturnValue({
      data: [medication({ end_date: '2020-01-01' })],
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as never);

    renderWithProviders(<MedicationsScreen />);

    expect(screen.getByText('Paused')).toBeTruthy();
  });

  it('navigates to Add Medication when the header add button is pressed', () => {
    // A non-empty list, so only the header's icon button carries this
    // label — the empty state's own action button (tested above) would
    // otherwise create a second match for the same accessibility label.
    mockedUseMedications.mockReturnValue({
      data: [medication()],
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as never);

    renderWithProviders(<MedicationsScreen />);
    fireEvent.press(screen.getByLabelText('Add medication'));

    expect(router.push).toHaveBeenCalledWith('/care/medications/add');
  });
});
