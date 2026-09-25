import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Check } from 'lucide-react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import {
  fontFamily,
  fontWeight,
  radius,
  spacing,
  type,
  useReducedMotion,
  useTheme,
} from '@prism/ui';

export interface OptionGridOption {
  value: string;
  label: string;
  icon?: LucideIcon;
}

export interface OptionGridProps {
  options: readonly OptionGridOption[];
  selected: readonly string[];
  onChange: (next: string[]) => void;
  /** Single-select behaves like a radio group instead of independent toggles. */
  multiple?: boolean;
}

const TINT_KEYS = ['cyan', 'pink', 'violet', 'mint', 'yellow'] as const;

/** Appends an 8-bit alpha to a #RRGGBB color. */
function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(Math.min(Math.max(alpha, 0), 1) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}

interface OptionCardProps {
  option: OptionGridOption;
  index: number;
  selected: boolean;
  multiple: boolean;
  onPress: () => void;
}

function OptionCard({ option, index, selected, multiple, onPress }: OptionCardProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const isDark = theme.scheme === 'dark';
  const Icon = option.icon;
  const tint = theme.spectrum[TINT_KEYS[index % TINT_KEYS.length] as (typeof TINT_KEYS)[number]];

  return (
    <Animated.View style={[styles.cell, animatedStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          if (!reducedMotion) scale.value = withSpring(0.96, { damping: 18, stiffness: 300 });
        }}
        onPressOut={() => {
          if (!reducedMotion) scale.value = withSpring(1, { damping: 12, stiffness: 220 });
        }}
        accessibilityRole={multiple ? 'checkbox' : 'radio'}
        accessibilityState={{ checked: selected }}
        accessibilityLabel={option.label}
        style={[
          styles.card,
          {
            // Every card carries its own spectrum color, so unselected cards
            // read as colorful (not gray) in light mode; chosen cards deepen
            // and take the accent border.
            backgroundColor: withAlpha(
              tint,
              selected ? (isDark ? 0.3 : 0.38) : isDark ? 0.14 : 0.2,
            ),
            borderColor: selected ? theme.accent : withAlpha(tint, isDark ? 0.5 : 0.85),
            borderWidth: selected ? 2.5 : 1.5,
          },
        ]}
      >
        <View style={styles.topRow}>
          {Icon ? (
            <View
              style={[styles.iconTile, { backgroundColor: withAlpha(tint, isDark ? 0.4 : 0.75) }]}
            >
              <Icon size={20} color={theme.colors.text.primary} strokeWidth={2} />
            </View>
          ) : (
            <View />
          )}
          <View
            style={[
              styles.badge,
              selected
                ? { backgroundColor: theme.accent, borderColor: theme.accent }
                : {
                    borderColor: theme.colors.text.tertiary,
                    backgroundColor: theme.colors.background,
                  },
            ]}
          >
            {selected ? <Check size={14} color={theme.onAccent} strokeWidth={3} /> : null}
          </View>
        </View>
        <Text style={[styles.label, { color: theme.colors.text.primary }]}>{option.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

/**
 * Two-column grid of tappable cards — an icon, a label, and a check when
 * chosen — for onboarding's "pick what fits" screens. Same value contract
 * as ChipSelect.
 */
export function OptionGrid({ options, selected, onChange, multiple = true }: OptionGridProps) {
  const toggle = (value: string) => {
    if (!multiple) {
      onChange([value]);
      return;
    }
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  };

  return (
    <View style={styles.grid}>
      {options.map((option, index) => (
        <OptionCard
          key={option.value}
          option={option}
          index={index}
          selected={selected.includes(option.value)}
          multiple={multiple}
          onPress={() => toggle(option.value)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.smd,
  },
  cell: {
    width: '48%',
    flexGrow: 1,
  },
  card: {
    borderRadius: radius.lg,
    padding: spacing.md,
    minHeight: 104,
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fontFamily.primary,
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
    fontWeight: fontWeight.semibold as '600',
  },
});
