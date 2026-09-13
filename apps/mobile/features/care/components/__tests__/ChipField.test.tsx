import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { ChipField } from '../ChipField';

const OPTIONS = [
  { value: 'pill', label: 'Pill' },
  { value: 'injection', label: 'Injection' },
];

/**
 * ChipField is a thin adapter over the shared PRISMChipGroup
 * (packages/ui) — this proves its own call-site contract (a single
 * nullable value, always renders its label) still holds after that
 * consolidation.
 */
describe('ChipField', () => {
  it('renders its own label', () => {
    renderWithProviders(
      <ChipField label="Form" options={OPTIONS} value={null} onChange={jest.fn()} />,
    );
    expect(screen.getByText('Form')).toBeTruthy();
  });

  it('selects an option, calling onChange with its value', () => {
    const onChange = jest.fn();
    renderWithProviders(
      <ChipField label="Form" options={OPTIONS} value={null} onChange={onChange} />,
    );
    fireEvent.press(screen.getByText('Pill'));
    expect(onChange).toHaveBeenCalledWith('pill');
  });

  it('deselects the currently-selected option back to null on a second press', () => {
    const onChange = jest.fn();
    renderWithProviders(
      <ChipField label="Form" options={OPTIONS} value="pill" onChange={onChange} />,
    );
    fireEvent.press(screen.getByText('Pill'));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('selecting a different option replaces the previous single selection', () => {
    const onChange = jest.fn();
    renderWithProviders(
      <ChipField label="Form" options={OPTIONS} value="pill" onChange={onChange} />,
    );
    fireEvent.press(screen.getByText('Injection'));
    expect(onChange).toHaveBeenCalledWith('injection');
  });
});
