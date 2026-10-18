import { QueryClient } from '@tanstack/react-query';
import { putInList, refreshAfterSave, removeFromList } from '../refreshAfterSave';

function client() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

describe('putInList / removeFromList', () => {
  it('puts a new item in its place in the cached list straight away', () => {
    const queryClient = client();
    queryClient.setQueryData(
      ['milestones', 'u1'],
      [
        { id: 'a', date: '2026-10-10' },
        { id: 'b', date: '2026-10-01' },
      ],
    );

    putInList(queryClient, ['milestones', 'u1'], { id: 'c', date: '2026-10-05' }, (x, y) =>
      y.date.localeCompare(x.date),
    );

    expect(
      queryClient.getQueryData<{ id: string }[]>(['milestones', 'u1'])!.map((m) => m.id),
    ).toEqual(['a', 'c', 'b']);
  });

  it('replaces an edited item instead of adding it twice', () => {
    const queryClient = client();
    queryClient.setQueryData(['medications', 'u1'], [{ id: 'm1', name: 'Old' }]);

    putInList(queryClient, ['medications', 'u1'], { id: 'm1', name: 'New' });

    expect(queryClient.getQueryData(['medications', 'u1'])).toEqual([{ id: 'm1', name: 'New' }]);
  });

  it('takes a deleted item out', () => {
    const queryClient = client();
    queryClient.setQueryData(['appointments', 'u1'], [{ id: 'a1' }, { id: 'a2' }]);

    removeFromList(queryClient, ['appointments', 'u1'], 'a1');

    expect(queryClient.getQueryData(['appointments', 'u1'])).toEqual([{ id: 'a2' }]);
  });
});

describe('refreshAfterSave', () => {
  it("refetches every view of the account, even screens that aren't open", async () => {
    const queryClient = client();
    const timeline = jest.fn().mockResolvedValue(['fresh']);
    const today = jest.fn().mockResolvedValue(['fresh']);
    const otherAccount = jest.fn().mockResolvedValue(['other']);
    const signedUrl = jest.fn().mockResolvedValue('url');
    await queryClient.prefetchQuery({
      queryKey: ['timeline-events', 'u1', 'x'],
      queryFn: timeline,
    });
    await queryClient.prefetchQuery({ queryKey: ['today-items', 'u1', 'x'], queryFn: today });
    await queryClient.prefetchQuery({ queryKey: ['milestones', 'u2'], queryFn: otherAccount });
    await queryClient.prefetchQuery({
      queryKey: ['entry-image-signed-url', 'p'],
      queryFn: signedUrl,
    });

    await refreshAfterSave(queryClient, 'u1');

    expect(timeline).toHaveBeenCalledTimes(2);
    expect(today).toHaveBeenCalledTimes(2);
    expect(otherAccount).toHaveBeenCalledTimes(1);
    expect(signedUrl).toHaveBeenCalledTimes(1);
  });

  it('does not hold up a save forever on a slow connection', async () => {
    jest.useFakeTimers();
    const queryClient = client();
    jest.spyOn(queryClient, 'invalidateQueries').mockReturnValue(new Promise(() => undefined));

    let done = false;
    const saving = refreshAfterSave(queryClient, 'u1').then(() => {
      done = true;
    });
    await jest.advanceTimersByTimeAsync(4000);
    await saving;

    expect(done).toBe(true);
    jest.useRealTimers();
  });
});
