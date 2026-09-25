import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { ChipSelect } from '../ChipSelect';

const OPTIONS = [
  { value: 'symptom_relief', label: 'Symptom relief' },
  { value: 'appointments', label: 'Appointments' },
];

/**
 * ChipSelect is a thin adapter over the shared PRISMChipGroup
 * (packages/ui) — this proves its own call-site contract (an array of
 * selected values, no own label, multi- or single-select) still holds
 * after that consolidation.
 */
describe('ChipSelect', () => {
  it('renders no label of its own — bare chip row', () => {
    renderWithProviders(
      <ChipSelect options={OPTIONS} selected={[]} onChange={jest.fn()} multiple />,
    );
    expect(screen.getByText('Symptom relief')).toBeTruthy();
    expect(screen.queryByText('Category')).toBeNull();
  });

  it('multi-select: adds to the selection without removing existing choices', () => {
    const onChange = jest.fn();
    renderWithProviders(
      <ChipSelect options={OPTIONS} selected={['symptom_relief']} onChange={onChange} multiple />,
    );
    fireEvent.press(screen.getByText('Appointments'));
    expect(onChange).toHaveBeenCalledWith(['symptom_relief', 'appointments']);
  });

  it('multi-select: pressing an already-selected chip removes just that one', () => {
    const onChange = jest.fn();
    renderWithProviders(
      <ChipSelect
        options={OPTIONS}
        selected={['symptom_relief', 'appointments']}
        onChange={onChange}
        multiple
      />,
    );
    fireEvent.press(screen.getByText('Symptom relief'));
    expect(onChange).toHaveBeenCalledWith(['appointments']);
  });

  it('single-select: choosing a new option replaces the prior one, radio-style', () => {
    const onChange = jest.fn();
    renderWithProviders(
      <ChipSelect
        options={OPTIONS}
        selected={['symptom_relief']}
        onChange={onChange}
        multiple={false}
      />,
    );
    fireEvent.press(screen.getByText('Appointments'));
    expect(onChange).toHaveBeenCalledWith(['appointments']);
  });
});
