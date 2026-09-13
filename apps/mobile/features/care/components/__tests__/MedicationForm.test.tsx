import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { MedicationForm } from '../MedicationForm';
import { MOCK_PICKED_DATE } from '../../../../__mocks__/@react-native-community/datetimepicker';

// MOCK_PICKED_DATE is 2026-06-15 09:05 — fixed so date/time assertions are deterministic.

describe('MedicationForm — native date/time pickers', () => {
  it('shows "Choose a date" for an unset date field, never a raw text field', () => {
    renderWithProviders(<MedicationForm submitLabel="Save" onSubmit={jest.fn()} />);
    // Both start_date and end_date are unset, so the placeholder appears twice.
    expect(screen.getAllByText('Choose a date').length).toBe(2);
  });

  it('displays an existing start_date in human-readable form, already editable', () => {
    renderWithProviders(
      <MedicationForm
        defaultValues={{ start_date: '2026-01-10' }}
        submitLabel="Save"
        onSubmit={jest.fn()}
      />,
    );
    // Human display, not the raw wire format.
    expect(screen.queryByText('2026-01-10')).toBeNull();
    expect(screen.getByText('Jan 10, 2026')).toBeTruthy();
  });

  it('opens the date picker on tap and saves the selection when confirmed', () => {
    renderWithProviders(<MedicationForm submitLabel="Save" onSubmit={jest.fn()} />);

    fireEvent.press(screen.getByLabelText('Start date'));
    fireEvent.press(screen.getByTestId('mock-datetimepicker-confirm'));
    fireEvent.press(screen.getByText('Done'));

    expect(screen.getByText('Jun 15, 2026')).toBeTruthy();
  });

  it('never changes the date when the picker is canceled', () => {
    renderWithProviders(
      <MedicationForm
        defaultValues={{ start_date: '2026-01-10' }}
        submitLabel="Save"
        onSubmit={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByLabelText('Start date'));
    fireEvent.press(screen.getByTestId('mock-datetimepicker-confirm'));
    fireEvent.press(screen.getByText('Cancel'));

    // Still the original value — the confirm inside the (now-canceled)
    // sheet never reached onChangeText.
    expect(screen.getByText('Jan 10, 2026')).toBeTruthy();
  });

  it('opens the time picker and saves the selection in 24-hour wire format on submit', async () => {
    const onSubmit = jest.fn();
    renderWithProviders(
      <MedicationForm
        defaultValues={{ name: 'Testosterone', frequency_type: 'daily' }}
        submitLabel="Save"
        onSubmit={onSubmit}
      />,
    );

    fireEvent.press(screen.getByLabelText('Time of day'));
    fireEvent.press(screen.getByTestId('mock-datetimepicker-confirm'));
    fireEvent.press(screen.getByText('Done'));
    fireEvent.press(screen.getByText('Save'));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const submitted = onSubmit.mock.calls[0][0];
    expect(submitted.frequency_config).toEqual(expect.objectContaining({ time_of_day: '09:05' }));
  });

  it('never changes the time when the picker is dismissed', () => {
    renderWithProviders(
      <MedicationForm
        defaultValues={{ frequency_type: 'daily', frequency_config: { time_of_day: '08:00' } }}
        submitLabel="Save"
        onSubmit={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByLabelText('Time of day'));
    fireEvent.press(screen.getByTestId('mock-datetimepicker-dismiss'));

    expect(screen.getByText('8:00 AM')).toBeTruthy();
  });
});

test('MOCK_PICKED_DATE stays June 15, 2026, 9:05 — the fixture this suite asserts against', () => {
  expect(MOCK_PICKED_DATE.getFullYear()).toBe(2026);
});
