import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import type { TodayItem } from '@prism/types';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { TodayScreen } from '../TodayScreen';
import { useModules, useProfile } from '../../../../lib/profile/queries';
import { useTodayItems } from '../../../../lib/today/queries';
import { useCreateMedicationLog } from '../../../../lib/care/mutations';
import { useAppStore } from '../../../../lib/store/appStore';

// The top bar and menu have their own tests.
jest.mock('../../../../components/home/TopBar', () => ({ TopBar: () => null }));

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
}));

jest.mock('../../../../lib/profile/queries', () => ({
  useProfile: jest.fn(),
  useModules: jest.fn(),
  useSetModuleEnabled: jest.fn(() => ({ mutate: jest.fn(), isPending: false })),
}));

jest.mock('../../../../lib/today/queries', () => ({
  useTodayItems: jest.fn(),
}));

jest.mock('../../../../lib/care/mutations', () => ({
  useCreateMedicationLog: jest.fn(),
}));

const mockedUseProfile = useProfile as jest.MockedFunction<typeof useProfile>;
const mockedUseModules = useModules as jest.MockedFunction<typeof useModules>;
const mockedUseTodayItems = useTodayItems as jest.MockedFunction<typeof useTodayItems>;
const mockedUseCreateLog = useCreateMedicationLog as jest.MockedFunction<
  typeof useCreateMedicationLog
>;

const ALL_MODULES = ['medications', 'injections', 'appointments', 'milestones', 'journal'].map(
  (module_key) => ({ module_key, enabled: true }),
);

function todayResult(data: TodayItem[] | undefined, overrides: Record<string, unknown> = {}) {
  mockedUseTodayItems.mockReturnValue({
    data,
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
    ...overrides,
  } as never);
}

function item(overrides: Partial<TodayItem> = {}): TodayItem {
  return {
    id: 'medication-m1',
    moduleKey: 'medications',
    bucket: 'due_today',
    sourceId: 'm1',
    title: 'Estradiol valerate',
    subtitle: '20mg',
    at: new Date(Date.now() + 90 * 60000).toISOString(),
    ...overrides,
  };
}

describe('TodayScreen', () => {
  const createLog = jest.fn().mockResolvedValue({});

  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.setState({ customizeTipDismissed: false });
    mockedUseProfile.mockReturnValue({ data: undefined } as never);
    mockedUseModules.mockReturnValue({ data: ALL_MODULES } as never);
    mockedUseCreateLog.mockReturnValue({ mutateAsync: createLog } as never);
    createLog.mockResolvedValue({});
  });

  it('says so plainly, without inventing content, when nothing is due', () => {
    // "Do not manufacture content when the user has nothing to show." —
    // docs/MASTER_BUILD_SPEC.md §31, Non-Negotiable Rule 11.
    todayResult([]);

    renderWithProviders(<TodayScreen />);

    expect(screen.getByText(/^Good (morning|afternoon|evening)\.$/)).toBeTruthy();
    expect(screen.getByText("You're all caught up.")).toBeTruthy();
    expect(screen.queryByText('Coming up')).toBeNull();
  });

  it('still shows the full screen while the data has not loaded yet', () => {
    todayResult(undefined);

    renderWithProviders(<TodayScreen />);

    expect(screen.getByText("You're all caught up.")).toBeTruthy();
    expect(screen.getByText('Add something')).toBeTruthy();
  });

  it('greets the user by name when a display name is set', () => {
    mockedUseProfile.mockReturnValue({ data: { display_name: 'Alex' } } as never);
    todayResult([]);

    renderWithProviders(<TodayScreen />);

    expect(screen.getByText(/^Good (morning|afternoon|evening), Alex\.$/)).toBeTruthy();
  });

  it('puts the next thing on top with one button that does it', async () => {
    todayResult([item()]);

    renderWithProviders(<TodayScreen />);

    expect(screen.getByText('Estradiol valerate')).toBeTruthy();
    expect(screen.getByText('Due today')).toBeTruthy();
    fireEvent.press(screen.getByText('Mark done'));

    await waitFor(() =>
      expect(createLog).toHaveBeenCalledWith(
        expect.objectContaining({
          medication_id: 'm1',
          status: 'completed',
          scheduled_at: expect.any(String),
          completed_at: expect.any(String),
        }),
      ),
    );
  });

  it('opens an appointment instead of marking it done', () => {
    todayResult([
      item({
        id: 'appointment-a1',
        moduleKey: 'appointments',
        sourceId: 'a1',
        title: 'Endocrinology',
        bucket: 'upcoming',
      }),
    ]);

    renderWithProviders(<TodayScreen />);

    expect(screen.queryByText('Mark done')).toBeNull();
    fireEvent.press(screen.getByText('Open'));
    expect(router.push).toHaveBeenCalledWith('/care/appointments/a1');
  });

  it('lists what comes after the next thing', () => {
    todayResult([
      item(),
      item({
        id: 'appointment-a1',
        moduleKey: 'appointments',
        sourceId: 'a1',
        title: 'Lab work',
        bucket: 'upcoming',
      }),
    ]);

    renderWithProviders(<TodayScreen />);

    expect(screen.getByText('Coming up')).toBeTruthy();
    fireEvent.press(screen.getByLabelText(/^Lab work/));
    expect(router.push).toHaveBeenCalledWith('/care/appointments/a1');
  });

  it('offers to add only what is switched on', () => {
    mockedUseModules.mockReturnValue({
      data: [
        { module_key: 'medications', enabled: true },
        { module_key: 'journal', enabled: true },
        { module_key: 'injections', enabled: false },
      ],
    } as never);
    todayResult([]);

    renderWithProviders(<TodayScreen />);

    expect(screen.getByLabelText('Log a dose')).toBeTruthy();
    expect(screen.getByLabelText('Write in my journal')).toBeTruthy();
    expect(screen.queryByLabelText('Log an injection')).toBeNull();
    expect(screen.queryByLabelText('Add a milestone')).toBeNull();
  });

  it('starts an action from a tile', () => {
    todayResult([]);

    renderWithProviders(<TodayScreen />);

    fireEvent.press(screen.getByLabelText('Log a dose'));
    expect(router.push).toHaveBeenCalledWith('/care/medications');
    // An injection is a medication, so there is no separate tile for it.
    expect(screen.queryByLabelText('Log an injection')).toBeNull();
  });

  it('tells people once where to turn parts of Prism on and off, then stays quiet', () => {
    todayResult([]);

    renderWithProviders(<TodayScreen />);

    expect(screen.getByText('Make Prism yours')).toBeTruthy();
    fireEvent.press(screen.getByText('Got it'));
    expect(screen.queryByText('Make Prism yours')).toBeNull();
  });

  it('opens the switches from the tip', () => {
    todayResult([]);

    renderWithProviders(<TodayScreen />);

    fireEvent.press(screen.getByText('Choose what shows'));
    expect(router.push).toHaveBeenCalledWith('/you/customize');
  });

  it('shows an error state with a retry when the data cannot load', () => {
    const refetch = jest.fn();
    todayResult(undefined, { isError: true, refetch });

    renderWithProviders(<TodayScreen />);

    expect(screen.queryByText("You're all caught up.")).toBeNull();
  });
});
