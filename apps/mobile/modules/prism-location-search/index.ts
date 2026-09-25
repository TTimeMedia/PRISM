import { requireOptionalNativeModule } from 'expo';

export interface LocationSuggestion {
  title: string;
  subtitle: string;
}

interface PrismLocationSearchNativeModule {
  search(query: string): Promise<LocationSuggestion[]>;
}

// Null where the native module isn't compiled in (Android, Expo Go, web) —
// callers fall back to a plain text field.
const NativeModule = requireOptionalNativeModule<PrismLocationSearchNativeModule>(
  'PrismLocationSearch',
);

export const isLocationSearchAvailable = NativeModule !== null;

export async function searchLocations(query: string): Promise<LocationSuggestion[]> {
  if (!NativeModule) return [];
  return NativeModule.search(query);
}
