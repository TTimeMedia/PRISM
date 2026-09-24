import React, { useState } from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../test-utils/renderWithProviders';
import { ListPickerField } from '../ListPickerField';

function Harness({ searchable = false }: { searchable?: boolean }) {
  const [value, setValue] = useState('');
  return (
    <ListPickerField
      label="Pronouns"
      value={value}
      onChange={setValue}
      options={['she/her', 'he/him', 'they/them']}
      searchable={searchable}
    />
  );
}

describe('ListPickerField', () => {
  it('opens a list and picks an option', () => {
    renderWithProviders(<Harness />);
    fireEvent.press(screen.getByLabelText('Pronouns: Choose'));
    fireEvent.press(screen.getByLabelText('they/them'));
    expect(screen.getByLabelText('Pronouns: they/them')).toBeTruthy();
  });

  it('lets people write their own answer from the list', () => {
    renderWithProviders(<Harness />);
    fireEvent.press(screen.getByLabelText('Pronouns: Choose'));
    fireEvent.press(screen.getByLabelText('Write your own'));
    fireEvent.changeText(screen.getByLabelText('Write your own'), 'xe/xem');
    fireEvent.press(screen.getByText('Use this'));
    expect(screen.getByLabelText('Pronouns: xe/xem')).toBeTruthy();
  });

  it('searchable lists filter and offer to use what was typed', () => {
    renderWithProviders(<Harness searchable />);
    fireEvent.press(screen.getByLabelText('Pronouns: Choose'));
    fireEvent.changeText(screen.getByLabelText('Search Pronouns'), 'ze');
    expect(screen.queryByLabelText('she/her')).toBeNull();
    fireEvent.press(screen.getByLabelText('Add "ze"'));
    expect(screen.getByLabelText('Pronouns: ze')).toBeTruthy();
  });

  it('can clear a chosen value', () => {
    renderWithProviders(<Harness />);
    fireEvent.press(screen.getByLabelText('Pronouns: Choose'));
    fireEvent.press(screen.getByLabelText('he/him'));
    fireEvent.press(screen.getByLabelText('Pronouns: he/him'));
    fireEvent.press(screen.getByText('Clear'));
    expect(screen.getByLabelText('Pronouns: Choose')).toBeTruthy();
  });
});
