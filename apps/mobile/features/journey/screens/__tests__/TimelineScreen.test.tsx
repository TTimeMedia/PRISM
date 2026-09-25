import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { TimelineScreen, monthSummary } from '../TimelineScreen';
import { useProfile } from '../../../../lib/profile/queries';
import { useTimelineEvents } from '../../../../lib/journey/timelineQuery';

// The top bar and menu have their own tests.
jest.mock('../../../../components/home/TopBar', () => ({ TopBar: () => null }));

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
}));

jest.mock('../../../../lib/profile/queries', () => ({
  useProfile: jest.fn(),
  useModules: jest.fn(() => ({ data: [] })),
}));

jest.mock('../../../../lib/you/useSignedProfilePhotoUrl', () => ({
  useSignedProfilePhotoUrl: () => ({ data: undefined }),
}));

jest.mock('../../../../lib/journey/timelineQuery', () => ({
  useTimelineEvents: jest.fn(),
}));

// Photos are signed with the Supabase client, which these tests don't need.
jest.mock('../../components/EntryImage', () => ({ EntryImage: () => null }));

const mockedUseProfile = useProfile as jest.MockedFunction<typeof useProfile>;
const mockedUseTimeline = useTimelineEvents as jest.MockedFunction<typeof useTimelineEvents>;

const NOW = new Date();
const thisMonth = (day: number) =>
  new Date(NOW.getFullYear(), NOW.getMonth(), day, 12).toISOString();
const lastYear = new Date(NOW.getFullYear() - 1, NOW.getMonth(), 10, 12).toISOString();

const EVENTS = [
  {
    id: 'a',
    moduleKey: 'medications',
    sourceId: 'm1',
    title: 'Estradiol',
    subtitle: 'Completed',
    at: thisMonth(2),
  },
  {
    id: 'b',
    moduleKey: 'medications',
    sourceId: 'm1',
    title: 'Estradiol',
    subtitle: 'Completed',
    at: thisMonth(1),
  },
  { id: 'c', moduleKey: 'appointments', sourceId: 'a1', title: 'Endocrinology', at: thisMonth(1) },
  { id: 'd', moduleKey: 'journal', sourceId: 'j1', title: 'Feeling steady', at: thisMonth(1) },
  { id: 'e', moduleKey: 'milestones', sourceId: 'ms1', title: 'Chose my name', at: lastYear },
] as never[];

const timeline = (data: unknown[]) =>
  mockedUseTimeline.mockReturnValue({
    data,
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  } as never);

describe('monthSummary', () => {
  it('counts this month by kind and ignores other months', () => {
    expect(monthSummary(EVENTS, NOW)).toEqual({ doses: 2, appointments: 1, moments: 1 });
  });
});

describe('TimelineScreen (the YOU tab)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseProfile.mockReturnValue({
      data: { display_name: 'Dominic Perignon', created_at: '2026-09-01T00:00:00Z' },
    } as never);
    timeline(EVENTS);
  });

  it('shows who you are, and how long you have been here', () => {
    renderWithProviders(<TimelineScreen />);

    expect(screen.getByText('Dominic Perignon')).toBeTruthy();
    expect(screen.getByText(/^With Prism since /)).toBeTruthy();
    expect(screen.getByText('DP')).toBeTruthy();
  });

  it('opens the profile and settings from your card', () => {
    renderWithProviders(<TimelineScreen />);

    fireEvent.press(screen.getByText('Profile'));
    expect(router.push).toHaveBeenCalledWith('/you/profile');
    fireEvent.press(screen.getByText('Settings'));
    expect(router.push).toHaveBeenCalledWith('/you/settings');
  });

  it('sums up the month in plain counts, never a score', () => {
    renderWithProviders(<TimelineScreen />);

    expect(screen.getByText('This month')).toBeTruthy();
    expect(screen.getByText('doses logged')).toBeTruthy();
    expect(screen.getByText('appointments')).toBeTruthy();
    expect(screen.getByText('moments kept')).toBeTruthy();
  });

  it('filters the timeline to one kind of thing', () => {
    renderWithProviders(<TimelineScreen />);

    expect(screen.getAllByText('Estradiol').length).toBe(2);
    fireEvent.press(screen.getByText('Moments'));
    expect(screen.queryByText('Estradiol')).toBeNull();
    expect(screen.getByText('Feeling steady')).toBeTruthy();
    expect(screen.getByText('Chose my name')).toBeTruthy();
  });

  it('opens the original record when an event is tapped', () => {
    renderWithProviders(<TimelineScreen />);

    fireEvent.press(screen.getByLabelText(/^Endocrinology/));
    expect(router.push).toHaveBeenCalledWith('/care/appointments/a1');
  });

  it('still shows who you are, and how to begin, when nothing has been added yet', () => {
    timeline([]);

    renderWithProviders(<TimelineScreen />);

    expect(screen.getByText('Dominic Perignon')).toBeTruthy();
    expect(screen.getByText(/land here, in order/)).toBeTruthy();
  });
});
