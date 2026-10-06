import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import {
  PALETTES,
  fontFamily,
  fontWeight,
  radius,
  spacing,
  themeTokens,
  type,
  useTheme,
  type PaletteKey,
} from '@prism/ui';

interface PalettePickerProps {
  value: PaletteKey;
  onChange: (key: PaletteKey) => void;
}

/**
 * Choose the colors for the whole app. Each option shows its ground and its
 * two colors in the current light or dark mode, and a one-line feel, never a
 * label about who it's for. The choice applies everywhere at once.
 */
export function PalettePicker({ value, onChange }: PalettePickerProps) {
  const theme = useTheme();
  return (
    <View style={styles.list} accessibilityRole="radiogroup">
      {PALETTES.map((palette) => {
        const selected = palette.key === value;
        return (
          <Pressable
            key={palette.key}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={`${palette.label}. ${palette.blurb}`}
            onPress={() => onChange(palette.key)}
            style={({ pressed }) => [
              styles.option,
              {
                backgroundColor: theme.colors.surface,
                borderColor: selected ? theme.accent : theme.colors.border.default,
                borderWidth: selected ? 2 : 1,
                opacity: pressed ? 0.9 : 1,
              },
              theme.scheme === 'light' && theme.shadow,
            ]}
          >
            <View style={styles.swatches}>
              {swatches(palette.key, theme.scheme).map((color, index) => (
                <View
                  key={index}
                  style={[
                    styles.swatch,
                    { backgroundColor: color, borderColor: theme.colors.border.default },
                  ]}
                />
              ))}
            </View>
            <View style={styles.text}>
              <Text
                style={[
                  styles.label,
                  { fontFamily: theme.fonts.display },
                  { color: theme.colors.text.primary },
                ]}
              >
                {palette.label}
              </Text>
              <Text style={[styles.blurb, { color: theme.colors.text.secondary }]}>
                {palette.blurb}
              </Text>
            </View>
            {selected ? (
              <View style={[styles.check, { backgroundColor: theme.accent }]}>
                <Check size={16} color={theme.onAccent} strokeWidth={3} />
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

/** The theme's ground, then its two colors. */
function swatches(key: PaletteKey, scheme: 'light' | 'dark'): string[] {
  const t = themeTokens(key, scheme);
  return [t.bg, t.accent, t.accent2];
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.smd,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.xl,
  },
  swatches: {
    flexDirection: 'row',
  },
  swatch: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    marginRight: -8,
  },
  text: {
    flex: 1,
    gap: 2,
    paddingLeft: spacing.sm,
  },
  label: {
    fontFamily: fontFamily.display,
    fontSize: type.headingM.fontSize,
    lineHeight: type.headingM.lineHeight,
    fontWeight: fontWeight.semibold as '600',
  },
  blurb: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
