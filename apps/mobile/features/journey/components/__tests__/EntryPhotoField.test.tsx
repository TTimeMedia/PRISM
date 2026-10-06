import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { EntryPhotoField } from '../EntryPhotoField';

jest.mock('../../../../lib/journey/useSignedEntryImageUrl', () => ({
  useSignedEntryImageUrl: () => ({ data: 'https://example.com/photo.jpg' }),
}));

const asset = (name: string) => ({ uri: `file:///${name}.jpg` }) as never;

function setup(kept: string[], added: never[] = []) {
  const handlers = { onAdd: jest.fn(), onRemoveKept: jest.fn(), onRemoveAdded: jest.fn() };
  renderWithProviders(<EntryPhotoField kept={kept} added={added} {...handlers} />);
  return handlers;
}

describe('EntryPhotoField', () => {
  it('offers to add photos when there are none', () => {
    const { onAdd } = setup([]);
    fireEvent.press(screen.getByText('Add photos'));
    expect(onAdd).toHaveBeenCalled();
  });

  it('shows saved and new photos together, each removable', () => {
    const handlers = setup(['u1/journal/a.jpg'], [asset('b')]);

    expect(screen.getByText('Photos (2 of 5)')).toBeTruthy();
    expect(screen.getByText('Add more (up to 3)')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Remove photo 1'));
    fireEvent.press(screen.getByLabelText('Remove photo 2'));
    expect(handlers.onRemoveKept).toHaveBeenCalledWith('u1/journal/a.jpg');
    expect(handlers.onRemoveAdded).toHaveBeenCalledWith(asset('b'));
  });

  it('stops offering more at five', () => {
    setup(['1', '2', '3'], [asset('4'), asset('5')]);

    expect(screen.queryByText(/^Add/)).toBeNull();
    expect(screen.getByText(/most for one entry/)).toBeTruthy();
  });
});
