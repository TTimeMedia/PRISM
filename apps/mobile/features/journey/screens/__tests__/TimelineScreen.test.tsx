import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { TimelineScreen, totalsSummary } from '../TimelineScreen';
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
jest.mock('../../components/PhotoBubbles', () => ({ PhotoBubbles: () => null }));

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

describe('totalsSummary', () => {
  // Sept 20, 2026, mid-afternoon on the phone.
  const today = new Date(2026, 8, 20, 15);
  const local = (day: number) => new Date(2026, 8, day, 9).toISOString();
  const dateOnly = (date: string) => `${date}T12:00:00.000Z`;

  const events = [
    { id: '1', moduleKey: 'medications', at: local(2) },
    { id: '2', moduleKey: 'medications', at: local(2) }, // same day: counts once
    { id: '3', moduleKey: 'medications', at: local(5) },
    { id: '4', moduleKey: 'journal', at: dateOnly('2026-09-05') }, // same day as a dose
    { id: '5', moduleKey: 'milestones', at: dateOnly('2026-09-10') },
    { id: '6', moduleKey: 'appointments', at: local(12) }, // not a check-in
    { id: '7', moduleKey: 'journal', at: dateOnly('2026-09-25') }, // future day: not a check-in
    { id: '8', moduleKey: 'journal', at: dateOnly('2026-08-31') }, // last month: still counts
  ] as never[];

  it('counts every day checked in, entry written and moment kept, not just this month', () => {
    expect(totalsSummary(events, today)).toEqual({ checkedInDays: 4, entries: 3, moments: 1 });
  });

  it('is all zeros with nothing logged', () => {
    expect(totalsSummary([], today)).toEqual({ checkedInDays: 0, entries: 0, moments: 0 });
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

  it('sums up everything so far in plain counts, never a score', () => {
    renderWithProviders(<TimelineScreen />);

    expect(screen.getByText('All time')).toBeTruthy();
    expect(screen.getByText(/^days? checked in$/)).toBeTruthy();
    expect(screen.getByText('entry written')).toBeTruthy();
    // Last year's milestone counts too: these are all-time totals.
    expect(screen.getByText('moment kept')).toBeTruthy();
    expect(screen.queryByText('doses logged')).toBeNull();
    expect(screen.queryByText('appointments')).toBeNull();
  });

  it('shows every kind of thing in one list, with no filters', () => {
    renderWithProviders(<TimelineScreen />);

    expect(screen.getAllByText('Estradiol').length).toBe(2);
    expect(screen.getByText('Feeling steady')).toBeTruthy();
    expect(screen.getByText('Chose my name')).toBeTruthy();
    expect(screen.queryByText('Moments')).toBeNull();
    expect(screen.queryByText('Doses')).toBeNull();
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
