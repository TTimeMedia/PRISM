import { renderHook } from '@testing-library/react-native';
import { useAppearanceSync } from '../useAppearanceSync';
import { useAppStore } from '../../store/appStore';

describe('useAppearanceSync', () => {
  beforeEach(() => {
    useAppStore.setState({ accentColor: 'cyan', themePreference: 'system' });
  });

  it("adopts the account's theme and accent when the server values are valid", () => {
    renderHook(() => useAppearanceSync('dark', 'coral'));
    expect(useAppStore.getState().themePreference).toBe('dark');
    expect(useAppStore.getState().accentColor).toBe('coral');
  });

  it('follows a change made on another device', () => {
    let theme: string | undefined = 'dark';
    let accent: string | undefined = 'coral';
    const { rerender } = renderHook(() => useAppearanceSync(theme, accent));
    theme = 'light';
    accent = 'violet';
    rerender({});
    expect(useAppStore.getState().themePreference).toBe('light');
    expect(useAppStore.getState().accentColor).toBe('violet');
  });

  it('ignores unknown or missing values instead of breaking the theme', () => {
    useAppStore.setState({ accentColor: 'mint', themePreference: 'dark' });
    renderHook(() => useAppearanceSync('sepia', 'not-a-real-theme'));
    renderHook(() => useAppearanceSync(undefined, undefined));
    expect(useAppStore.getState().themePreference).toBe('dark');
    expect(useAppStore.getState().accentColor).toBe('mint');
  });
});
