import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { JourneyHomeScreen } from '../JourneyHomeScreen';
import { useModules } from '../../../../lib/profile/queries';
import { useJournalEntries, useMilestones } from '../../../../lib/journey/queries';

// The top bar and menu have their own tests.
jest.mock('../../../../components/home/TopBar', () => ({ TopBar: () => null }));

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
}));

jest.mock('../../../../lib/profile/queries', () => ({
  useModules: jest.fn(),
}));

jest.mock('../../../../lib/journey/queries', () => ({
  useMilestones: jest.fn(),
  useJournalEntries: jest.fn(),
}));

// Photos are signed with the Supabase client, which these tests don't need.
jest.mock('../../components/EntryImage', () => ({ EntryImage: () => null }));

const mockedUseModules = useModules as jest.MockedFunction<typeof useModules>;
const mockedUseMilestones = useMilestones as jest.MockedFunction<typeof useMilestones>;
const mockedUseJournalEntries = useJournalEntries as jest.MockedFunction<typeof useJournalEntries>;

const result = (data: unknown[]) => ({ data, isLoading: false, isError: false }) as never;
const modules = (off: string[] = []) =>
  ['medications', 'appointments', 'milestones', 'journal'].map((module_key) => ({
    module_key,
    enabled: !off.includes(module_key),
  }));

describe('JourneyHomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseModules.mockReturnValue({
      data: modules(),
      isLoading: false,
      isError: false,
    } as never);
    mockedUseMilestones.mockReturnValue(result([]));
    mockedUseJournalEntries.mockReturnValue(result([]));
  });

  it('invites the first entry and the first milestone when there is nothing yet', () => {
    renderWithProviders(<JourneyHomeScreen />);

    expect(screen.getByText('Your story starts wherever you decide.')).toBeTruthy();
    expect(screen.getByText('Nothing written yet')).toBeTruthy();
    expect(screen.getByText('No milestones yet')).toBeTruthy();
    fireEvent.press(screen.getAllByText('Write an entry')[0] as never);
    expect(router.push).toHaveBeenCalledWith('/journey/journal/add');
    fireEvent.press(screen.getByText('Add a milestone'));
    expect(router.push).toHaveBeenCalledWith('/journey/milestones/add');
  });

  it('starts an entry from a mood, with that word already filled in', () => {
    renderWithProviders(<JourneyHomeScreen />);

    expect(screen.getByText('How are you today?')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Start an entry feeling hopeful'));
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/journey/journal/add',
      params: { mood: 'Hopeful' },
    });
  });

  it('shows recent entries with a taste of what was written, and opens one', () => {
    mockedUseJournalEntries.mockReturnValue(
      result([
        {
          id: 'j1',
          title: 'Feeling steady today',
          content: 'Woke up calm and took a long walk before work.',
          mood: 'Steady',
          date: '2026-09-23',
        },
      ]),
    );

    renderWithProviders(<JourneyHomeScreen />);

    expect(screen.getByText('Feeling steady today')).toBeTruthy();
    expect(screen.getByText('Woke up calm and took a long walk before work.')).toBeTruthy();
    fireEvent.press(screen.getByLabelText(/^Feeling steady today/));
    expect(router.push).toHaveBeenCalledWith('/journey/journal/j1');
  });

  it('counts moments the gentle way and shows the milestones already kept', () => {
    mockedUseMilestones.mockReturnValue(
      result([{ id: 'ms1', title: 'Told my family', date: '2026-09-20', image_path: null }]),
    );
    mockedUseJournalEntries.mockReturnValue(
      result([
        { id: 'j1', title: null, content: 'a', mood: null, date: '2026-09-21' },
        { id: 'j2', title: null, content: 'b', mood: null, date: '2026-09-22' },
      ]),
    );

    renderWithProviders(<JourneyHomeScreen />);

    expect(screen.getByText('3 moments recorded')).toBeTruthy();
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

    expect(screen.queryByText('How are you today?')).toBeNull();
    expect(screen.queryByText('Recent entries')).toBeNull();
    expect(screen.queryByText('Turn on')).toBeNull();
    expect(screen.getByText('Keep a moment.')).toBeTruthy();
  });

  it('does not repeat the switches when features are on', () => {
    renderWithProviders(<JourneyHomeScreen />);

    expect(screen.queryByText('Choose what shows')).toBeNull();
  });

  it('points to the switches only when nothing here is on', () => {
    mockedUseModules.mockReturnValue({
      data: modules(['milestones', 'journal']),
      isLoading: false,
      isError: false,
    } as never);

    renderWithProviders(<JourneyHomeScreen />);

    fireEvent.press(screen.getByText('Choose what shows'));
    expect(router.push).toHaveBeenCalledWith('/you/customize');
  });
});
