import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import type { Milestone } from '@prism/types';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { MilestonesScreen } from '../MilestonesScreen';
import { useMilestones } from '../../../../lib/journey/queries';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
}));

jest.mock('../../../../lib/journey/queries', () => ({
  useMilestones: jest.fn(),
}));

const mockedUseMilestones = useMilestones as jest.MockedFunction<typeof useMilestones>;

function milestone(overrides: Partial<Milestone> = {}): Milestone {
  return {
    id: 'm1',
    user_id: 'u1',
    title: 'Started HRT',
    description: null,
    date: '2026-06-01',
    category: null,
    icon: 'sparkles',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('MilestonesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the approved empty state with no milestones', () => {
    mockedUseMilestones.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as never);

    renderWithProviders(<MilestonesScreen />);

    expect(screen.getByText('No milestones yet.')).toBeTruthy();
  });

  it('lists a milestone by title', () => {
    mockedUseMilestones.mockReturnValue({
      data: [milestone()],
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as never);

    renderWithProviders(<MilestonesScreen />);

    expect(screen.getByText('Started HRT')).toBeTruthy();
  });

  it('navigates to Milestone Detail when a milestone is pressed', () => {
    mockedUseMilestones.mockReturnValue({
      data: [milestone()],
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as never);

    renderWithProviders(<MilestonesScreen />);
    fireEvent.press(screen.getByText('Started HRT'));

    expect(router.push).toHaveBeenCalledWith('/journey/milestones/m1');
  });

  it('navigates to Add Milestone when the header add button is pressed', () => {
    mockedUseMilestones.mockReturnValue({
      data: [milestone()],
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as never);

    renderWithProviders(<MilestonesScreen />);
    fireEvent.press(screen.getByLabelText('Add milestone'));

    expect(router.push).toHaveBeenCalledWith('/journey/milestones/add');
  });
});
