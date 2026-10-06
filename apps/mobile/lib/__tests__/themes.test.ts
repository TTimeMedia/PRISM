import {
  LEGACY_PALETTE_KEYS,
  PALETTES,
  THEME_IDS,
  knownPaletteKey,
  paletteSpectrum,
  paletteTokens,
  resolvePaletteKey,
  themeTokens,
} from '@prism/ui';

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

const MODES = ['light', 'dark'] as const;

describe('color themes', () => {
  it('offers all fifteen themes, Prism first', () => {
    expect(PALETTES).toHaveLength(15);
    expect(PALETTES[0]?.key).toBe('prism');
    expect(THEME_IDS).toContain('coral-reef');
  });

  it('reads every old theme name as a current theme, and ignores unknown ones', () => {
    for (const [old, next] of Object.entries(LEGACY_PALETTE_KEYS)) {
      expect(THEME_IDS).toContain(next);
      expect(knownPaletteKey(old)).toBe(next);
    }
    expect(knownPaletteKey('sepia')).toBeNull();
    expect(resolvePaletteKey(undefined)).toBe('prism');
  });

  it.each(THEME_IDS.flatMap((id) => MODES.map((mode) => [id, mode] as const)))(
    '%s (%s) keeps text readable on its grounds and feature tiles',
    (id, mode) => {
      const colors = paletteTokens(id, mode);
      const { subtle } = paletteSpectrum(id, mode);
      const t = themeTokens(id, mode);

      expect(contrast(colors.text.primary, colors.background)).toBeGreaterThanOrEqual(7);
      expect(contrast(colors.text.secondary, colors.surface)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.accentText, colors.background)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.accentOn, t.accent)).toBeGreaterThanOrEqual(4.5);
      // Icons and labels sit on the feature tiles in the primary text color.
      for (const tile of Object.values(subtle)) {
        expect(contrast(colors.text.primary, tile)).toBeGreaterThanOrEqual(4.5);
      }
    },
  );

  it("moves Coral reef's light accent away from the error red", () => {
    const coral = themeTokens('coral-reef', 'light');
    expect(coral.accent).not.toBe('#D44A2E');
    expect(contrast(coral.accent, coral.bg)).toBeGreaterThanOrEqual(3);
  });
});
