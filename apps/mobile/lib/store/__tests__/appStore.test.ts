import { useAppStore } from '../appStore';

describe('useAppStore', () => {
  it('defaults themePreference to "system"', () => {
    expect(useAppStore.getState().themePreference).toBe('system');
  });

  it('setThemePreference updates state', () => {
    useAppStore.getState().setThemePreference('dark');
    expect(useAppStore.getState().themePreference).toBe('dark');

    // Reset for other tests.
    useAppStore.getState().setThemePreference('system');
  });
});
