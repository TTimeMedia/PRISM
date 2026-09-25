import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { ChevronRight, Plus, type LucideIcon } from 'lucide-react-native';
import Svg, { Circle, Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';
import { PRISMButton, fontFamily, fontWeight, radius, spacing, type, useTheme } from '@prism/ui';
import { useTint, withAlpha, type Tint } from './tint';

export { useTint, withAlpha, type Tint } from './tint';

/**
 * A soft wash of two spectrum colors behind the top of a screen — each tab
 * gets its own pair, so Today, Care and Journey each feel like their own
 * place. Drawn once, never animated.
 */
export function ScreenGlow({ colors }: { colors: [Tint, Tint] }) {
  const theme = useTheme();
  const dark = theme.scheme === 'dark';
  const a = theme.spectrum[colors[0]];
  const b = theme.spectrum[colors[1]];
  const strength = dark ? 0.3 : 0.55;
  return (
    <View pointerEvents="none" style={styles.glow} accessibilityElementsHidden>
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id="glow-a" cx="0.15" cy="0.05" r="0.75">
            <Stop offset="0" stopColor={a} stopOpacity={strength} />
            <Stop offset="1" stopColor={a} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="glow-b" cx="0.95" cy="0.15" r="0.7">
            <Stop offset="0" stopColor={b} stopOpacity={strength} />
            <Stop offset="1" stopColor={b} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#glow-a)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#glow-b)" />
      </Svg>
    </View>
  );
}

/**
 * A section heading with an optional "See all" style link and an optional
 * round "+" button to add to that section (the usual place for it).
 */
export function SectionTitle({
  title,
  actionLabel,
  onAction,
  onAdd,
  addLabel,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  onAdd?: () => void;
  /** Spoken label for the + button, e.g. "Add a medication". */
  addLabel?: string;
}) {
  const theme = useTheme();
  return (
    <View style={styles.sectionRow}>
      <Text
        accessibilityRole="header"
        style={[styles.sectionTitle, { color: theme.colors.text.primary }]}
      >
        {title}
      </Text>
      <View style={styles.sectionActions}>
        {actionLabel && onAction ? (
          <Pressable accessibilityRole="button" onPress={onAction} hitSlop={10}>
            <Text style={[styles.sectionAction, { color: theme.colors.text.secondary }]}>
              {actionLabel}
            </Text>
          </Pressable>
        ) : null}
        {onAdd ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={addLabel ?? `Add to ${title}`}
            onPress={onAdd}
            hitSlop={8}
            style={({ pressed }) => [
              styles.addCircle,
              { backgroundColor: theme.accent, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Plus size={18} color={theme.onAccent} strokeWidth={2.8} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

/**
 * What a section looks like before anything is in it: a small icon, one
 * line on what it's for, and one clear button to begin. Never a blank gap.
 */
export function EmptyCard({
  icon: Icon,
  tint,
  title,
  body,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: {
  icon: LucideIcon;
  tint: Tint;
  title: string;
  body: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}) {
  const theme = useTheme();
  const colors = useTint(tint);
  return (
    <View
      style={[
        styles.empty,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border.default },
        theme.scheme === 'light' && theme.shadow,
      ]}
    >
      <View style={[styles.emptyIcon, { backgroundColor: colors.tile }]}>
        <Icon size={26} color={theme.colors.text.primary} strokeWidth={1.9} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>{title}</Text>
      <Text style={[styles.emptyBody, { color: theme.colors.text.secondary }]}>{body}</Text>
      <View style={styles.emptyActions}>
        <PRISMButton label={primaryLabel} onPress={onPrimary} />
        {secondaryLabel && onSecondary ? (
          <PRISMButton label={secondaryLabel} variant="tertiary" onPress={onSecondary} />
        ) : null}
      </View>
    </View>
  );
}

/** A big, colorful tap target that starts one thing: "Log a dose", "Write". */
export function ActionTile({
  icon: Icon,
  label,
  tint,
  onPress,
  style,
}: {
  icon: LucideIcon;
  label: string;
  tint: Tint;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  const colors = useTint(tint);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        {
          backgroundColor: colors.soft,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        },
        theme.scheme === 'light' && theme.shadow,
        style,
      ]}
    >
      <View style={[styles.tileIcon, { backgroundColor: colors.tile }]}>
        <Icon size={22} color={theme.colors.text.primary} strokeWidth={2.2} />
      </View>
      <Text style={[styles.tileLabel, { color: theme.colors.text.primary }]} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

/** A large card with a two-color wash — the one thing to look at on a screen. */
export function HeroCard({
  tint,
  accentTint,
  children,
}: {
  tint: Tint;
  accentTint?: Tint;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const dark = theme.scheme === 'dark';
  const from = theme.spectrum[tint];
  const to = theme.spectrum[accentTint ?? tint];
  return (
    <View
      style={[
        styles.hero,
        {
          backgroundColor: theme.colors.surface,
          borderColor: withAlpha(from, dark ? 0.45 : 0.7),
        },
        theme.scheme === 'light' && theme.shadow,
      ]}
    >
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={`hero-${tint}-${accentTint ?? tint}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={from} stopOpacity={dark ? 0.3 : 0.5} />
            <Stop offset="1" stopColor={to} stopOpacity={dark ? 0.12 : 0.2} />
          </LinearGradient>
        </Defs>
        <Rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill={`url(#hero-${tint}-${accentTint ?? tint})`}
        />
        <Circle cx="92%" cy="8%" r="90" fill={withAlpha(to, dark ? 0.1 : 0.14)} />
      </Svg>
      <View style={styles.heroBody}>{children}</View>
    </View>
  );
}

/** One record in a list: a colored icon tile, a title, a line of detail, and a chevron. */
export function ItemRow({
  icon: Icon,
  tint,
  title,
  subtitle,
  onPress,
}: {
  icon: LucideIcon;
  tint: Tint;
  title: string;
  subtitle?: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  const colors = useTint(tint);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border.subtle,
          opacity: pressed ? 0.88 : 1,
        },
        theme.scheme === 'light' && theme.shadow,
      ]}
    >
      <View style={[styles.rowIcon, { backgroundColor: colors.tile }]}>
        <Icon size={20} color={theme.colors.text.primary} strokeWidth={2.2} />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, { color: theme.colors.text.primary }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[styles.rowSubtitle, { color: theme.colors.text.secondary }]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      <ChevronRight size={18} color={theme.colors.text.tertiary} />
    </Pressable>
  );
}

/** A small number with a label — "3 medications", "1 coming up". */
export function StatChip({ value, label, tint }: { value: string; label: string; tint: Tint }) {
  const theme = useTheme();
  const colors = useTint(tint);
  return (
    <View
      style={[
        styles.chip,
        { backgroundColor: colors.soft, borderColor: colors.border },
        theme.scheme === 'light' && theme.shadow,
      ]}
    >
      <Text style={[styles.chipValue, { color: theme.colors.text.primary }]}>{value}</Text>
      <Text style={[styles.chipLabel, { color: theme.colors.text.secondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 380,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.smd,
  },
  sectionTitle: {
    fontFamily: fontFamily.display,
    fontSize: type.headingL.fontSize,
    lineHeight: type.headingL.lineHeight,
    fontWeight: fontWeight.semibold as '600',
  },
  sectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.smd,
  },
  addCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  emptyTitle: {
    fontFamily: fontFamily.display,
    fontSize: type.headingM.fontSize,
    lineHeight: type.headingM.lineHeight,
    fontWeight: fontWeight.semibold as '600',
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
    textAlign: 'center',
    maxWidth: 280,
  },
  emptyActions: {
    alignSelf: 'stretch',
    gap: spacing.xs,
    marginTop: spacing.smd,
  },
  sectionAction: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
    fontWeight: fontWeight.medium as '500',
    textDecorationLine: 'underline',
  },
  tile: {
    width: '48%',
    flexGrow: 0,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    padding: spacing.md,
    gap: spacing.smd,
    minHeight: 104,
    justifyContent: 'space-between',
  },
  tileIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: {
    fontSize: type.bodyM.fontSize,
    lineHeight: type.bodyM.lineHeight,
    fontWeight: fontWeight.semibold as '600',
  },
  hero: {
    borderRadius: radius.xl,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  heroBody: {
    padding: spacing.lg,
    gap: spacing.smd,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    minHeight: 64,
  },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontSize: type.bodyL.fontSize,
    lineHeight: type.bodyL.lineHeight,
    fontWeight: fontWeight.semibold as '600',
  },
  rowSubtitle: {
    fontSize: type.bodyS.fontSize,
    lineHeight: type.bodyS.lineHeight,
  },
  chip: {
    borderRadius: radius.lg,
    borderWidth: 1.5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.smd,
    minWidth: 96,
  },
  chipValue: {
    fontFamily: fontFamily.display,
    fontSize: type.headingXL.fontSize,
    lineHeight: type.headingXL.lineHeight,
    fontWeight: fontWeight.bold as '700',
  },
  chipLabel: {
    fontSize: type.caption.fontSize,
    lineHeight: type.caption.lineHeight,
  },
});
