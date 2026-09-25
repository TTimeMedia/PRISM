import React, { useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarDays, Heart, Palette, Sun, type LucideIcon } from 'lucide-react-native';
import { PRISMButton, fontFamily, fontWeight, radius, spacing, type, useTheme } from '@prism/ui';
import { AmbientBackground, Reveal } from '../../../components/motion';

interface Slide {
  icon: LucideIcon;
  tint: 'cyan' | 'pink' | 'violet' | 'mint';
  title: string;
  body: string;
  points: string[];
}

const SLIDES: Slide[] = [
  {
    icon: Sun,
    tint: 'cyan',
    title: 'Start at Today',
    body: 'Your day at a glance, the moment you open Prism.',
    points: [
      'What is coming up next',
      'Your reminders and recent entries',
      'Tap anything to open it',
    ],
  },
  {
    icon: Heart,
    tint: 'pink',
    title: 'Care, in one place',
    body: 'Keep the details of your care together and easy to find.',
    points: [
      'Medications and injections',
      'Appointments, with directions',
      'Reminders when you want them',
    ],
  },
  {
    icon: CalendarDays,
    tint: 'violet',
    title: 'Your journey, your story',
    body: 'Write it down and look back on how far you have come.',
    points: ['Milestones with photos', 'A private journal', 'A timeline of it all'],
  },
  {
    icon: Palette,
    tint: 'mint',
    title: 'Make it yours',
    body: 'Prism is built from parts you switch on and off.',
    points: [
      'Turn parts on or off in Make Prism yours',
      'Pick your color and theme',
      'Lock the app with a PIN or Face ID',
      'Export or delete your data any time',
    ],
  },
];

export interface TourSlidesProps {
  /** Label for the button on the last slide. */
  doneLabel: string;
  onDone: () => void;
  /** Shown as a quiet link on every slide except the last. */
  onSkip?: () => void;
  loading?: boolean;
  /** Which slide to open on; defaults to the first. */
  initialIndex?: number;
}

/**
 * Swipeable "how Prism works" walkthrough — used once during onboarding
 * and again from You → How Prism works. Each slide is one idea with three
 * short points; nothing here reads or asks for anything.
 */
export function TourSlides({
  doneLabel,
  onDone,
  onSkip,
  loading = false,
  initialIndex = 0,
}: TourSlidesProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(initialIndex);
  const isLast = index === SLIDES.length - 1;

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  const next = () => {
    if (isLast) {
      onDone();
      return;
    }
    scrollRef.current?.scrollTo({ x: (index + 1) * width, animated: true });
    setIndex(index + 1);
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <AmbientBackground phase={0.95} />
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        contentOffset={{ x: initialIndex * width, y: 0 }}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        style={styles.flex}
      >
        {SLIDES.map((slide, slideIndex) => {
          const Icon = slide.icon;
          const tint = theme.spectrum[slide.tint];
          return (
            <View key={slide.title} style={[styles.slide, { width }]}>
              {slideIndex === index ? (
                <>
                  <Reveal index={0} style={styles.artWrap}>
                    <View style={[styles.ringOuter, { backgroundColor: `${tint}33` }]}>
                      <View style={[styles.ringInner, { backgroundColor: `${tint}66` }]}>
                        <Icon size={52} color={theme.colors.text.primary} strokeWidth={1.7} />
                      </View>
                    </View>
                  </Reveal>
                  <Reveal index={1}>
                    <Text
                      accessibilityRole="header"
                      style={[styles.title, { color: theme.colors.text.primary }]}
                    >
                      {slide.title}
                    </Text>
                  </Reveal>
                  <Reveal index={2}>
                    <Text style={[styles.body, { color: theme.colors.text.secondary }]}>
                      {slide.body}
                    </Text>
                  </Reveal>
                  <Reveal index={3} style={styles.points}>
                    {slide.points.map((point) => (
                      <View key={point} style={styles.pointRow}>
                        <View style={[styles.pointDot, { backgroundColor: tint }]} />
                        <Text style={[styles.point, { color: theme.colors.text.primary }]}>
                          {point}
                        </Text>
                      </View>
                    ))}
                  </Reveal>
                </>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((slide, dotIndex) => (
            <View
              key={slide.title}
              style={[
                styles.dot,
                {
                  width: dotIndex === index ? 22 : 8,
                  backgroundColor: dotIndex === index ? theme.accent : theme.colors.border.strong,
                },
              ]}
            />
          ))}
        </View>
        <PRISMButton label={isLast ? doneLabel : 'Next'} onPress={next} loading={loading} />
        {onSkip && !isLast ? (
          <PRISMButton label="Skip" variant="tertiary" onPress={onSkip} />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  slide: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    gap: spacing.md,
  },
  artWrap: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  ringOuter: {
    width: 190,
    height: 190,
    borderRadius: 95,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    width: 128,
    height: 128,
    borderRadius: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: type.displayM.fontSize,
    lineHeight: type.displayM.lineHeight,
    fontWeight: fontWeight.semibold as '600',
  },
  body: {
    fontSize: type.bodyL.fontSize,
    lineHeight: type.bodyL.lineHeight,
  },
  points: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pointDot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
  },
  point: {
    flex: 1,
    fontSize: type.bodyM.fontSize,
    lineHeight: type.bodyM.lineHeight,
    fontWeight: fontWeight.medium as '500',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.xs,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
