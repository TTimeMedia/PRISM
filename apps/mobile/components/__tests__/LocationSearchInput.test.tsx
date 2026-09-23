import React, { useState } from 'react';
import { act, fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../test-utils/renderWithProviders';
import { LocationSearchInput } from '../LocationSearchInput';
import { searchLocations } from '../../modules/prism-location-search';

jest.mock('../../modules/prism-location-search', () => ({
  isLocationSearchAvailable: true,
  searchLocations: jest.fn(),
}));

const mockedSearch = searchLocations as jest.MockedFunction<typeof searchLocations>;

function Harness({ onChange }: { onChange: (value: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <LocationSearchInput
      value={value}
      onChangeText={(next) => {
        setValue(next);
        onChange(next);
      }}
    />
  );
}

describe('LocationSearchInput', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockedSearch.mockReset();
    mockedSearch.mockResolvedValue([
      { title: 'Rivera Endocrinology', subtitle: '12 Main St, Portland, OR' },
    ]);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('suggests places as you type and fills the field with the one you pick', async () => {
    const onChange = jest.fn();
    renderWithProviders(<Harness onChange={onChange} />);

    const input = screen.getByLabelText('Location');
    fireEvent(input, 'focus');
    fireEvent.changeText(input, 'Rivera');
    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    expect(mockedSearch).toHaveBeenCalledWith('Rivera');
    fireEvent.press(screen.getByLabelText('Rivera Endocrinology, 12 Main St, Portland, OR'));

    expect(onChange).toHaveBeenLastCalledWith('Rivera Endocrinology, 12 Main St, Portland, OR');
    expect(screen.queryByLabelText('Rivera Endocrinology, 12 Main St, Portland, OR')).toBeNull();
  });

  it("doesn't search until there are at least three characters", async () => {
    renderWithProviders(<Harness onChange={jest.fn()} />);

    const input = screen.getByLabelText('Location');
    fireEvent(input, 'focus');
    fireEvent.changeText(input, 'Ri');
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    expect(mockedSearch).not.toHaveBeenCalled();
  });
});
