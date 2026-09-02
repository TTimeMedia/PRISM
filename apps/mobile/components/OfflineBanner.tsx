import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useTheme } from '@prism/ui';
import { spacing } from '@prism/ui/tokens';
import { OFFLINE_COPY } from '@prism/config';

/**
 * "You're offline. Your changes will sync when you're back online." —
 * see docs/DESIGN_SYSTEM.md §26 and docs/TECHNICAL_BIBLE.md §13. Full
 * write-queueing lands with the CARE milestone; this establishes the
 * detection + banner foundation now, per the Foundation scope.
 */
export function OfflineBanner() {
  const theme = useTheme();
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(state.isConnected === false);
    });
    return unsubscribe;
  }, []);

  if (!isOffline) return null;

  return (
    <View
      accessibilityRole="alert"
      style={[styles.banner, { backgroundColor: theme.spectrum.yellow }]}
    >
      <Text style={[styles.text, { color: theme.colors.text.inverse }]}>
        {OFFLINE_COPY.banner} {OFFLINE_COPY.syncNotice}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
});
