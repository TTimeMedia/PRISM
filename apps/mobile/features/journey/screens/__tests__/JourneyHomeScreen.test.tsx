import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { JourneyHomeScreen } from '../JourneyHomeScreen';
import { useModules, useSetModuleEnabled } from '../../../../lib/profile/queries';
import { useJournalEntries, useMilestones } from '../../../../lib/journey/queries';
import { useTimelineEvents } from '../../../../lib/journey/timelineQuery';

// The top bar and menu have their own tests.
jest.mock('../../../../components/home/TopBar', () => ({ TopBar: () => null }));

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
}));

jest.mock('../../../../lib/profile/queries', () => ({
  useModules: jest.fn(),
  useSetModuleEnabled: jest.fn(),
}));

jest.mock('../../../../lib/journey/queries', () => ({
  useMilestones: jest.fn(),
  useJournalEntries: jest.fn(),
}));

// Photos are signed with the Supabase client, which these tests don't need.
jest.mock('../../components/EntryImage', () => ({ EntryImage: () => null }));

jest.mock('../../../../lib/journey/timelineQuery', () => ({
  useTimelineEvents: jest.fn(),
}));

const mockedUseModules = useModules as jest.MockedFunction<typeof useModules>;
const mockedUseSetModuleEnabled = useSetModuleEnabled as jest.MockedFunction<
  typeof useSetModuleEnabled
>;
const mockedUseMilestones = useMilestones as jest.MockedFunction<typeof useMilestones>;
const mockedUseJournalEntries = useJournalEntries as jest.MockedFunction<typeof useJournalEntries>;
const mockedUseTimeline = useTimelineEvents as jest.MockedFunction<typeof useTimelineEvents>;

const result = (data: unknown[]) => ({ data, isLoading: false, isError: false }) as never;
const modules = (off: string[] = []) =>
  ['medications', 'injections', 'appointments', 'milestones', 'journal'].map((module_key) => ({
    module_key,
    enabled: !off.includes(module_key),
  }));

describe('JourneyHomeScreen', () => {
  const setEnabled = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseModules.mockReturnValue({
      data: modules(),
      isLoading: false,
      isError: false,
    } as never);
    mockedUseSetModuleEnabled.mockReturnValue({ mutate: setEnabled, isPending: false } as never);
    mockedUseMilestones.mockReturnValue(result([]));
    mockedUseJournalEntries.mockReturnValue(result([]));
    mockedUseTimeline.mockReturnValue(result([]));
  });

  it('invites the first entry when there is nothing yet', () => {
    renderWithProviders(<JourneyHomeScreen />);

    expect(screen.getByText('Start your story.')).toBeTruthy();
    expect(screen.getByText('Your story starts wherever you decide.')).toBeTruthy();
    fireEvent.press(screen.getByText('Write an entry'));
    expect(router.push).toHaveBeenCalledWith('/journey/journal/add');
    fireEvent.press(screen.getByText('Add a milestone'));
    expect(router.push).toHaveBeenCalledWith('/journey/milestones/add');
  });

  it('counts moments the gentle way and shows the ones already kept', () => {
    mockedUseMilestones.mockReturnValue(result([{ id: 'ms1' }]));
    mockedUseJournalEntries.mockReturnValue(result([{ id: 'j1' }, { id: 'j2' }]));
    mockedUseTimeline.mockReturnValue(
      result([
        {
          id: 'milestone:ms1',
          moduleKey: 'milestones',
          sourceId: 'ms1',
          title: 'Told my family',
          at: '2026-09-20T12:00:00.000Z',
        },
      ]),
    );

    renderWithProviders(<JourneyHomeScreen />);

    expect(screen.getByText('3 moments recorded')).toBeTruthy();
    expect(screen.getByText('Add to your story.')).toBeTruthy();
    fireEvent.press(screen.getByLabelText(/^Told my family/));
    expect(router.push).toHaveBeenCalledWith('/journey/milestones/ms1');
  });

  it('leaves out a feature that is off instead of nudging people toward it', () => {
    mockedUseModules.mockReturnValue({
      data: modules(['journal']),
      isLoading: false,
      isError: false,
    } as never);

    renderWithProviders(<JourneyHomeScreen />);

    expect(screen.queryByText('Write an entry')).toBeNull();
    expect(screen.queryByText('Journal')).toBeNull();
    expect(screen.queryByText('Turn on')).toBeNull();
    expect(screen.getByText('Add a milestone')).toBeTruthy();
  });

  it('points to where features can be added or removed', () => {
    renderWithProviders(<JourneyHomeScreen />);

    fireEvent.press(screen.getByLabelText(/^Choose what shows here/));
    expect(router.push).toHaveBeenCalledWith('/you/customize');
  });
});
