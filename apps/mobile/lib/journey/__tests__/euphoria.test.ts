import type { EuphoriaMoment } from '@prism/types';
import { pickMoment } from '../euphoria';

jest.mock('../../supabase/client', () => ({ supabase: {} }));
jest.mock('../../auth/AuthProvider', () => ({ useSession: () => ({ session: null }) }));

const m = (id: string) => ({ id, text: id }) as EuphoriaMoment;

describe('shaking the jar', () => {
  it('returns nothing from an empty jar', () => {
    expect(pickMoment([], null)).toBeNull();
  });

  it('returns the only moment, even twice in a row', () => {
    expect(pickMoment([m('a')], 'a')?.id).toBe('a');
  });

  it('never repeats the moment just shown', () => {
    const moments = [m('a'), m('b'), m('c')];
    for (const r of [0, 0.5, 0.99]) {
      expect(pickMoment(moments, 'b', () => r)?.id).not.toBe('b');
    }
  });
});
