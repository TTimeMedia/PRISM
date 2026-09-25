import { renderHook } from '@testing-library/react-native';
import { useAppearanceSync } from '../useAppearanceSync';
import { useAppStore } from '../../store/appStore';

describe('useAppearanceSync', () => {
  beforeEach(() => {
    useAppStore.setState({ palette: 'slate', themePreference: 'system' });
  });

  it("adopts the account's theme and palette when the server values are valid", () => {
    renderHook(() => useAppearanceSync('dark', 'ember'));
    expect(useAppStore.getState().themePreference).toBe('dark');
    expect(useAppStore.getState().palette).toBe('ember');
  });

  it('follows a change made on another device', () => {
    let theme: string | undefined = 'dark';
    let palette: string | undefined = 'ember';
    const { rerender } = renderHook(() => useAppearanceSync(theme, palette));
    theme = 'light';
    palette = 'dusk';
    rerender({});
    expect(useAppStore.getState().themePreference).toBe('light');
    expect(useAppStore.getState().palette).toBe('dusk');
  });

  it('ignores unknown or missing values instead of breaking the theme', () => {
    useAppStore.setState({ palette: 'forest', themePreference: 'dark' });
    renderHook(() => useAppearanceSync('sepia', 'not-a-real-palette'));
    renderHook(() => useAppearanceSync(undefined, undefined));
    expect(useAppStore.getState().themePreference).toBe('dark');
    expect(useAppStore.getState().palette).toBe('forest');
  });
});
