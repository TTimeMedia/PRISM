import type { QueryClient, QueryKey } from '@tanstack/react-query';

/**
 * Making a change show up everywhere at once.
 *
 * Every list Prism shows for an account is cached under a key whose second
 * part is the account's id (['milestones', userId], ['today-items', userId,
 * …], ['timeline-events', userId, …] and so on). Several screens build their
 * view from more than one table (Today, the Timeline, the You stats), so
 * refreshing only the table that changed left those showing old data until
 * their cache ran out. After any save, edit or delete:
 *
 * 1. putInList / removeFromList change the list being returned to straight
 *    away, so the new or edited item is there the moment the form closes.
 * 2. refreshAfterSave refetches everything for the account, including screens
 *    not open right now, and the save waits for it (up to MAX_WAIT_MS), so
 *    whichever screen is opened next is already up to date.
 */

/** Longest a save waits for the refresh. A slow connection still saves; screens catch up after. */
const MAX_WAIT_MS = 4000;

export async function refreshAfterSave(
  queryClient: QueryClient,
  userId: string | undefined,
): Promise<void> {
  if (!userId) return;
  const refresh = queryClient
    .invalidateQueries({
      predicate: (query) => query.queryKey[1] === userId,
      refetchType: 'all',
    })
    .catch(() => undefined);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<void>((resolve) => {
    timer = setTimeout(resolve, MAX_WAIT_MS);
  });
  await Promise.race([refresh, timeout]);
  clearTimeout(timer);
}

/** Adds or replaces a saved row in a cached list, keeping the list's order. */
export function putInList<T extends { id: string }>(
  queryClient: QueryClient,
  key: QueryKey,
  row: T,
  compare?: (a: T, b: T) => number,
): void {
  queryClient.setQueryData<T[]>(key, (list) => {
    if (!list) return list;
    const next = [...list.filter((item) => item.id !== row.id), row];
    return compare ? next.sort(compare) : next;
  });
}

/** Takes a deleted row out of a cached list. */
export function removeFromList<T extends { id: string }>(
  queryClient: QueryClient,
  key: QueryKey,
  id: string,
): void {
  queryClient.setQueryData<T[]>(key, (list) => list?.filter((item) => item.id !== id));
}

/** Newest first, by a `date` (YYYY-MM-DD) column, as the Journey lists are fetched. */
export const byDateNewestFirst = (a: { date: string }, b: { date: string }) =>
  b.date.localeCompare(a.date);
