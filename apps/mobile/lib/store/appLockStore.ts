import { create } from 'zustand';

/**
 * Transient (non-persisted) app-lock state — Screen 78 (App Lock Screen).
 * Deliberately not part of `appStore.ts`'s persisted preferences: whether
 * the app is *currently* locked must reset to `true` on every fresh
 * process start (never remembered across a full app relaunch) and
 * re-arm whenever the app is backgrounded, which is exactly what
 * "unpersisted" gives for free.
 */
interface AppLockState {
  isLocked: boolean;
  lock: () => void;
  unlock: () => void;
}

export const useAppLockStore = create<AppLockState>((set) => ({
  isLocked: false,
  lock: () => set({ isLocked: true }),
  unlock: () => set({ isLocked: false }),
}));
