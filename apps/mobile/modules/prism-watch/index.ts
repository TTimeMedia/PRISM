import { requireOptionalNativeModule } from 'expo';

interface EventSubscription {
  remove(): void;
}

interface PrismWatchNativeModule {
  isSupported(): boolean;
  isWatchAppInstalled(): boolean;
  updateContext(json: string): void;
  takePendingActions(): string[];
  addListener(event: 'onWatchAction', listener: () => void): EventSubscription;
}

// Null where the native module isn't compiled in (Android, web, builds before
// the watch app) — the watch sync then does nothing.
const NativeModule = requireOptionalNativeModule<PrismWatchNativeModule>('PrismWatch');

export const isWatchSupported = NativeModule?.isSupported() ?? false;

export function updateWatchContext(json: string): void {
  NativeModule?.updateContext(json);
}

/** Things done on the watch since the last call, oldest first, as JSON strings. */
export function takeWatchActions(): string[] {
  return NativeModule?.takePendingActions() ?? [];
}

export function addWatchActionListener(listener: () => void): EventSubscription | null {
  return NativeModule?.addListener('onWatchAction', listener) ?? null;
}
