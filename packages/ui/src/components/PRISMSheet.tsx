import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { componentRadius } from '../tokens/radius';
import { spacing } from '../tokens/spacing';
import { fontWeight, type } from '../tokens/typography';

export interface PRISMSheetProps {
  visible: boolean;
  title?: string;
  onRequestClose: () => void;
  children: React.ReactNode;
}

/**
 * A bottom sheet — used for Quick Add ("Add to PRISM") and similar
 * capture-oriented actions. See docs/DESIGN_SYSTEM.md §12.
 */
export function PRISMSheet({ visible, title, onRequestClose, children }: PRISMSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onRequestClose}>
      <Pressable
        style={styles.backdrop}
        accessibilityLabel="Close"
        accessibilityRole="button"
        onPress={onRequestClose}
      >
        <Pressable
          style={[
            styles.sheet,
            { backgroundColor: theme.colors.surface, paddingBottom: insets.bottom + spacing.lg },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.handle, { backgroundColor: theme.colors.border.strong }]} />
          {title ? (
            <Text
              accessibilityRole="header"
              style={[styles.title, { color: theme.colors.text.primary }]}
            >
              {title}
            </Text>
          ) : null}
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: componentRadius.largeCard,
    borderTopRightRadius: componentRadius.largeCard,
    padding: spacing.lg,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: type.headingM.fontSize,
    lineHeight: type.headingM.lineHeight,
    fontWeight: fontWeight.semibold as '600',
    marginBottom: spacing.md,
  },
});
