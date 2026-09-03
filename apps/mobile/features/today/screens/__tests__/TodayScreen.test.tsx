import React from 'react';
import { screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { TodayScreen } from '../TodayScreen';
import { useProfile } from '../../../../lib/profile/queries';
import { useTodayItems } from '../../../../lib/today/queries';

jest.mock('../../../../lib/profile/queries', () => ({
  useProfile: jest.fn(),
}));

jest.mock('../../../../lib/today/queries', () => ({
  useTodayItems: jest.fn(),
}));

const mockedUseProfile = useProfile as jest.MockedFunction<typeof useProfile>;
const mockedUseTodayItems = useTodayItems as jest.MockedFunction<typeof useTodayItems>;

describe('TodayScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseProfile.mockReturnValue({ data: undefined } as never);
  });

  it('renders the approved empty-state copy rather than manufactured content when there is nothing to show', () => {
    // "Do not manufacture content when the user has nothing to show." —
    // docs/MASTER_BUILD_SPEC.md §31, Non-Negotiable Rule 11.
    mockedUseTodayItems.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as never);

    renderWithProviders(<TodayScreen />);

    expect(screen.getByText('Nothing urgent today.')).toBeTruthy();
    expect(screen.getByText('Your PRISM is here whenever you need it.')).toBeTruthy();
  });

  it('greets the user by name when a display name is set', () => {
    mockedUseProfile.mockReturnValue({ data: { display_name: 'Alex' } } as never);
    mockedUseTodayItems.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as never);

    renderWithProviders(<TodayScreen />);

    expect(screen.getByText(/, Alex\.$/)).toBeTruthy();
  });

  it('renders real personalized items as cards, not a fixed layout', () => {
    mockedUseTodayItems.mockReturnValue({
      data: [
        {
          id: 'appointment-1',
          moduleKey: 'appointments',
          bucket: 'upcoming',
          sourceId: '1',
          title: 'Endocrinology',
          subtitle: 'Dr. Rivera',
          at: new Date().toISOString(),
        },
      ],
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as never);

    renderWithProviders(<TodayScreen />);

    expect(screen.getByText('Endocrinology')).toBeTruthy();
    expect(screen.getByText('Dr. Rivera')).toBeTruthy();
    expect(screen.queryByText('Nothing urgent today.')).toBeNull();
  });

  it('shows the approved error state, not a raw error, when the query fails', () => {
    mockedUseTodayItems.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: jest.fn(),
    } as never);

    renderWithProviders(<TodayScreen />);

    expect(screen.getByText("Something went wrong. Your information wasn't changed.")).toBeTruthy();
  });
});
