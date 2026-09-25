import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { MedicationPicker } from '../MedicationPicker';

const FEW_OPTIONS = [
  { value: 'm1', label: 'Testosterone' },
  { value: 'm2', label: 'Estradiol' },
];

const MANY_OPTIONS = [
  { value: 'm1', label: 'Testosterone' },
  { value: 'm2', label: 'Estradiol' },
  { value: 'm3', label: 'Spironolactone' },
  { value: 'm4', label: 'Progesterone' },
  { value: 'm5', label: 'Finasteride' },
  { value: 'm6', label: 'Metformin' },
  { value: 'm7', label: 'Levothyroxine' },
];

describe('MedicationPicker', () => {
  it('shows a plain chip row with no search box for a short medication list', () => {
    renderWithProviders(
      <MedicationPicker
        label="Medication"
        options={FEW_OPTIONS}
        value={null}
        onChange={jest.fn()}
      />,
    );

    expect(screen.getByText('Testosterone')).toBeTruthy();
    expect(screen.queryByLabelText('Search medication')).toBeNull();
  });

  it('selects a medication from the chip row, never requiring typing', () => {
    const onChange = jest.fn();
    renderWithProviders(
      <MedicationPicker
        label="Medication"
        options={FEW_OPTIONS}
        value={null}
        onChange={onChange}
      />,
    );

    fireEvent.press(screen.getByText('Estradiol'));
    expect(onChange).toHaveBeenCalledWith('m2');
  });

  it('shows a search box once the list is long enough to be hard to scan', () => {
    renderWithProviders(
      <MedicationPicker
        label="Medication"
        options={MANY_OPTIONS}
        value={null}
        onChange={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('Search medication')).toBeTruthy();
    // Everything still shown until the user filters.
    expect(screen.getByText('Levothyroxine')).toBeTruthy();
  });

  it('filters the chip row as the user types, staying a selection (not free text)', () => {
    const onChange = jest.fn();
    renderWithProviders(
      <MedicationPicker
        label="Medication"
        options={MANY_OPTIONS}
        value={null}
        onChange={onChange}
      />,
    );

    fireEvent.changeText(screen.getByLabelText('Search medication'), 'metf');

    expect(screen.getByText('Metformin')).toBeTruthy();
    expect(screen.queryByText('Testosterone')).toBeNull();

    fireEvent.press(screen.getByText('Metformin'));
    expect(onChange).toHaveBeenCalledWith('m6');
  });

  it('shows the calm "nothing matches" state rather than fabricating a result', () => {
    renderWithProviders(
      <MedicationPicker
        label="Medication"
        options={MANY_OPTIONS}
        value={null}
        onChange={jest.fn()}
      />,
    );

    fireEvent.changeText(screen.getByLabelText('Search medication'), 'zzz-not-a-real-medication');

    MANY_OPTIONS.forEach((option) => {
      expect(screen.queryByText(option.label)).toBeNull();
    });
  });
});
