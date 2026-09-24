import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';
import { TodayScreen } from '../TodayScreen';
import { useProfile } from '../../../../lib/profile/queries';
import { useTodayItems } from '../../../../lib/today/queries';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
}));

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
    expect(screen.getByText('Your Prism is here whenever you need it.')).toBeTruthy();
  });

  it('renders the full base UI — greeting, empty state, Quick actions, and Coming up — for a brand-new user with zero data, never a blank screen', () => {
    mockedUseTodayItems.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as never);

    renderWithProviders(<TodayScreen />);

    expect(screen.getByText(/^Good (morning|afternoon|evening)\.$/)).toBeTruthy();
    expect(screen.getByText('Nothing urgent today.')).toBeTruthy();
    expect(screen.getByText('+ Log medication')).toBeTruthy();
    expect(screen.getByText('+ Log injection')).toBeTruthy();
    expect(screen.getByText('+ Journal')).toBeTruthy();
    expect(screen.getByText('+ Milestone')).toBeTruthy();
    expect(screen.getByText('Nothing scheduled.')).toBeTruthy();
  });

  it('renders the same full base UI while useTodayItems is disabled (data undefined, not yet an array) — the pre-first-fetch state for a new session', () => {
    mockedUseTodayItems.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as never);

    renderWithProviders(<TodayScreen />);

    expect(screen.getByText('Nothing urgent today.')).toBeTruthy();
    expect(screen.getByText('+ Log medication')).toBeTruthy();
    expect(screen.getByText('Nothing scheduled.')).toBeTruthy();
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
      // 'meaningful' rather than 'upcoming'/'due_today' so this item is
      // only in the main feed, not also duplicated into Coming Up below —
      // this test is about the main feed rendering real data, not about
      // Coming Up (see the "Coming up" describe block for that).
      data: [
        {
          id: 'milestone-1',
          moduleKey: 'milestones',
          bucket: 'meaningful',
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

  it('opens the record when a card is pressed, and never shows medications as cards', () => {
    mockedUseTodayItems.mockReturnValue({
      data: [
        {
          id: 'milestone-1',
          moduleKey: 'milestones',
          bucket: 'meaningful',
          sourceId: '1',
          title: 'Started HRT',
          at: new Date().toISOString(),
        },
        {
          id: 'medication-9',
          moduleKey: 'medications',
          bucket: 'recent',
          sourceId: '9',
          title: 'Testosterone',
          at: new Date().toISOString(),
        },
      ],
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    } as never);

    renderWithProviders(<TodayScreen />);

    expect(screen.queryByText('Testosterone')).toBeNull();
    fireEvent.press(screen.getByText('Started HRT'));
    expect(router.push).toHaveBeenCalledWith('/journey/milestones/1');
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

  describe('Quick actions', () => {
    beforeEach(() => {
      mockedUseTodayItems.mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      } as never);
    });

    it('navigates to the Medications list when "Log medication" is pressed', () => {
      renderWithProviders(<TodayScreen />);
      fireEvent.press(screen.getByText('+ Log medication'));
      expect(router.push).toHaveBeenCalledWith('/care/medications');
    });

    it('navigates to Log Injection when "Log injection" is pressed', () => {
      renderWithProviders(<TodayScreen />);
      fireEvent.press(screen.getByText('+ Log injection'));
      expect(router.push).toHaveBeenCalledWith('/care/injections/add');
    });

    it('navigates to New Journal Entry when "Journal" is pressed', () => {
      renderWithProviders(<TodayScreen />);
      fireEvent.press(screen.getByText('+ Journal'));
      expect(router.push).toHaveBeenCalledWith('/journey/journal/add');
    });

    it('navigates to Add Milestone when "Milestone" is pressed', () => {
      renderWithProviders(<TodayScreen />);
      fireEvent.press(screen.getByText('+ Milestone'));
      expect(router.push).toHaveBeenCalledWith('/journey/milestones/add');
    });

    it('renders all four quick actions even when nothing is scheduled — they never depend on Coming Up data', () => {
      renderWithProviders(<TodayScreen />);
      expect(screen.getByText('+ Log medication')).toBeTruthy();
      expect(screen.getByText('+ Log injection')).toBeTruthy();
      expect(screen.getByText('+ Journal')).toBeTruthy();
      expect(screen.getByText('+ Milestone')).toBeTruthy();
    });
  });

  describe('Coming up', () => {
    it('shows the calm empty-state copy when nothing is due today or upcoming', () => {
      mockedUseTodayItems.mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      } as never);

      renderWithProviders(<TodayScreen />);

      expect(screen.getByText('Nothing scheduled.')).toBeTruthy();
    });

    it('lists only due_today/upcoming items, in chronological order, with real date/time context', () => {
      mockedUseTodayItems.mockReturnValue({
        data: [
          {
            id: 'medication-1',
            moduleKey: 'medications',
            bucket: 'due_today',
            sourceId: 'm1',
            title: 'Testosterone',
            subtitle: '50mg',
            at: '2026-06-15T09:00:00',
          },
          {
            id: 'appointment-1',
            moduleKey: 'appointments',
            bucket: 'upcoming',
            sourceId: 'a1',
            title: 'Endocrinology',
            subtitle: 'Dr. Rivera',
            at: '2026-06-20T14:00:00',
          },
          {
            id: 'milestone-1',
            moduleKey: 'milestones',
            bucket: 'meaningful',
            sourceId: 'mi1',
            title: 'Started HRT',
            at: '2026-05-01',
          },
        ],
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      } as never);

      renderWithProviders(<TodayScreen />);

      // Due-today/upcoming items appear (also in the main feed above,
      // which is expected — Coming Up is a display-side slice of the
      // same data, not a separate fetch).
      expect(screen.getAllByText('Testosterone').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Endocrinology').length).toBeGreaterThan(0);
      // A 'meaningful' (past) item legitimately appears once — in the
      // main feed above, which renders every item regardless of bucket
      // — but selectComingUpItems itself excludes it from Coming Up (see
      // lib/today/__tests__/comingUp.test.ts); it must never appear a
      // second time as a fabricated "coming up" row.
      expect(screen.getAllByText('Started HRT')).toHaveLength(1);
      // Real, human date/time context — never the raw ISO string.
      // formatComingUpWhen's exact "Today/Tomorrow/weekday" logic is
      // covered by lib/today/__tests__/comingUp.test.ts (this test's
      // "at" values are fixed, so they aren't "today" relative to
      // whenever this suite actually runs).
      expect(screen.queryByText('2026-06-15T09:00:00')).toBeNull();
      expect(screen.getAllByText(/Jun/).length).toBeGreaterThan(0);
      // Chronological ordering itself is proven exhaustively in
      // lib/today/__tests__/comingUp.test.ts.
    });

    it('navigates to Timeline when "View all" is pressed', () => {
      mockedUseTodayItems.mockReturnValue({
        data: [
          {
            id: 'appointment-1',
            moduleKey: 'appointments',
            bucket: 'upcoming',
            sourceId: 'a1',
            title: 'Endocrinology',
            at: '2026-06-20T14:00:00',
          },
        ],
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      } as never);

      renderWithProviders(<TodayScreen />);
      fireEvent.press(screen.getByText('View all'));
      expect(router.push).toHaveBeenCalledWith('/journey/timeline');
    });

    it("navigates to the item's own record when a Coming Up row is pressed", () => {
      mockedUseTodayItems.mockReturnValue({
        data: [
          {
            id: 'medication-1',
            moduleKey: 'medications',
            bucket: 'due_today',
            sourceId: 'm1',
            title: 'Testosterone',
            at: '2026-06-15T09:00:00',
          },
        ],
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
      } as never);

      renderWithProviders(<TodayScreen />);
      // "Testosterone" renders twice — once in the main feed's card
      // (not pressable there) and once as the Coming Up row (is). Press
      // the Coming Up one specifically.
      const matches = screen.getAllByText('Testosterone');
      fireEvent.press(matches[matches.length - 1]);
      expect(router.push).toHaveBeenCalledWith('/care/medications/m1');
    });
  });
});
