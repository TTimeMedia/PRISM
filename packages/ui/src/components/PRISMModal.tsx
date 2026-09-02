import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { componentRadius } from '../tokens/radius';
import { spacing } from '../tokens/spacing';
import { fontWeight, type } from '../tokens/typography';
import { PRISMButton } from './PRISMButton';

export interface PRISMModalProps {
  visible: boolean;
  title: string;
  message?: string;
  onRequestClose: () => void;
  /** e.g. Confirm/Cancel or Delete/Cancel — see docs/SCREEN_BIBLE.md Screens 74-75. */
  actions: Array<{
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive';
  }>;
}

/** Use sparingly — for actions that genuinely benefit from confirmation. See docs/DESIGN_SYSTEM.md §26. */
export function PRISMModal({ visible, title, message, onRequestClose, actions }: PRISMModalProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();

  return (
    <Modal
      visible={visible}
      transparent
      animationType={reducedMotion ? 'fade' : 'fade'}
      onRequestClose={onRequestClose}
    >
      <Pressable
        style={styles.backdrop}
        accessibilityLabel="Close"
        accessibilityRole="button"
        onPress={onRequestClose}
      >
        <Pressable
          style={[styles.card, { backgroundColor: theme.colors.surface }]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text
            accessibilityRole="header"
            style={[styles.title, { color: theme.colors.text.primary }]}
          >
            {title}
          </Text>
          {message ? (
            <Text style={[styles.message, { color: theme.colors.text.secondary }]}>{message}</Text>
          ) : null}
          <View style={styles.actions}>
            {actions.map((action) => (
              <PRISMButton
                key={action.label}
                label={action.label}
                variant={action.variant ?? 'secondary'}
                onPress={action.onPress}
              />
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: componentRadius.largeCard,
    padding: spacing.lg,
  },
  title: {
    fontSize: type.headingM.fontSize,
    lineHeight: type.headingM.lineHeight,
    fontWeight: fontWeight.semibold as '600',
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: type.bodyM.fontSize,
    lineHeight: type.bodyM.lineHeight,
    marginBottom: spacing.lg,
  },
  actions: {
    gap: spacing.sm,
  },
});
