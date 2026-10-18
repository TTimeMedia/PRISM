import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWatchSync } from '../useWatchSync';

const mockUpdate = jest.fn();
let mockPending: string[] = [];
const mockMutate = jest.fn();
let mockSession: { user: { id: string } } | null = { user: { id: 'u1' } };
let mockInstalled = false;
const mockGetToken = jest.fn();
const mockReplaceToken = jest.fn();

jest.mock('../../../modules/prism-watch', () => ({
  isWatchSupported: true,
  isWatchAppInstalled: () => mockInstalled,
  updateWatchContext: (json: string) => mockUpdate(json),
  takeWatchActions: () => {
    const taken = mockPending;
    mockPending = [];
    return taken;
  },
  addWatchActionListener: () => ({ remove: jest.fn() }),
}));

jest.mock('../watchToken', () => ({
  getOrCreateWatchToken: (userId: string) => mockGetToken(userId),
  replaceWatchToken: (userId: string) => mockReplaceToken(userId),
  watchServerUrl: () => 'https://example.supabase.co/functions/v1/watch',
}));

jest.mock('../../auth/AuthProvider', () => ({
  useSession: () => ({ session: mockSession }),
}));

jest.mock('../../profile/queries', () => ({
  useModules: () => ({
    data: [
      { module_key: 'medications', enabled: true },
      { module_key: 'appointments', enabled: true },
    ],
  }),
  useSettings: () => ({ data: { notification_privacy: true } }),
}));

jest.mock('../../care/queries', () => ({
  useMedications: () => ({
    data: [
      {
        id: 'm1',
        name: 'Estradiol',
        frequency_type: 'daily',
        frequency_config: { time_of_day: '23:59' },
        start_date: null,
        end_date: null,
      },
    ],
  }),
  useAppointments: () => ({ data: [] }),
}));

jest.mock('../../care/mutations', () => ({
  useCreateMedicationLog: () => ({ mutateAsync: (input: unknown) => mockMutate(input) }),
}));

jest.mock('../../supabase/client', () => {
  const chain = {
    select: () => chain,
    gte: () => chain,
    lt: () => Promise.resolve({ data: [], error: null }),
  };
  return { supabase: { from: () => chain } };
});

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockPending = [];
  mockSession = { user: { id: 'u1' } };
  mockInstalled = false;
  mockMutate.mockResolvedValue({});
  mockGetToken.mockResolvedValue('key-1');
  mockReplaceToken.mockResolvedValue('key-2');
});

describe('useWatchSync', () => {
  it("sends today's doses to the watch, privately", async () => {
    renderHook(() => useWatchSync(true), { wrapper });

    await waitFor(() => expect(mockUpdate).toHaveBeenCalled());
    const sent = JSON.parse(mockUpdate.mock.calls[0][0]);
    expect(sent).toMatchObject({ signedIn: true, private: true });
    expect(sent.doses).toHaveLength(1);
    expect(sent.doses[0]).toMatchObject({ medicationId: 'm1', label: 'Dose', taken: false });
    expect(JSON.stringify(sent)).not.toContain('Estradiol');
  });

  it('saves a dose logged on the watch once, as a completed log', async () => {
    const action = JSON.stringify({
      type: 'logDose',
      id: 'w1',
      medicationId: 'm1',
      at: '2026-10-05T17:00:00.000Z',
    });
    mockPending = [action, action];

    renderHook(() => useWatchSync(true), { wrapper });

    await waitFor(() => expect(mockMutate).toHaveBeenCalled());
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate.mock.calls[0][0]).toMatchObject({
      medication_id: 'm1',
      scheduled_at: '2026-10-05T17:00:00.000Z',
      status: 'completed',
    });
  });

  it('gives the watch its key once Prism is on the watch', async () => {
    mockInstalled = true;
    renderHook(() => useWatchSync(true), { wrapper });

    await waitFor(() =>
      expect(mockUpdate.mock.calls.some(([json]) => JSON.parse(json).server)).toBe(true),
    );
    const sent = JSON.parse(mockUpdate.mock.calls.at(-1)![0]);
    expect(sent.server).toEqual({
      url: 'https://example.supabase.co/functions/v1/watch',
      token: 'key-1',
    });
    expect(mockGetToken).toHaveBeenCalledWith('u1');
    // Two weeks ahead, so the watch moves on to a new day by itself.
    expect(sent.schedule.length).toBeGreaterThanOrEqual(13);
  });

  it('makes no key when there is no watch app', async () => {
    renderHook(() => useWatchSync(true), { wrapper });

    await waitFor(() => expect(mockUpdate).toHaveBeenCalled());
    expect(mockGetToken).not.toHaveBeenCalled();
    expect(JSON.parse(mockUpdate.mock.calls[0][0]).server).toBeUndefined();
  });

  it('replaces the key when the watch says it stopped working', async () => {
    mockInstalled = true;
    mockPending = [JSON.stringify({ type: 'needKey' })];
    renderHook(() => useWatchSync(true), { wrapper });

    await waitFor(() =>
      expect(
        mockUpdate.mock.calls.some(([json]) => JSON.parse(json).server?.token === 'key-2'),
      ).toBe(true),
    );
    expect(mockReplaceToken).toHaveBeenCalledWith('u1');
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('clears the watch after signing out', async () => {
    mockSession = null;
    renderHook(() => useWatchSync(false), { wrapper });

    await waitFor(() => expect(mockUpdate).toHaveBeenCalled());
    expect(JSON.parse(mockUpdate.mock.calls[0][0])).toMatchObject({ signedIn: false, doses: [] });
  });
});
