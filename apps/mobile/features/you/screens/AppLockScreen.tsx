import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  PRISMButton,
  PRISMInput,
  fontFamily,
  fontWeight,
  spacing,
  type,
  useTheme,
} from '@prism/ui';
import { authenticateWithBiometrics, isBiometricAvailable } from '../../../lib/you/biometrics';
import { verifyPin } from '../../../lib/you/pinStorage';

export interface AppLockScreenProps {
  biometricEnabled: boolean;
  onUnlock: () => void;
}

/**
 * Screen 78 — App Lock Screen. Minimal by design: no user information
 * whatsoever, just an unlock affordance. Rendered as a full-screen
 * overlay from the root layout (see app/_layout.tsx) rather than a
 * route, so unlocking resumes exactly where the app was.
 */
export function AppLockScreen({ biometricEnabled, onUnlock }: AppLockScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    isBiometricAvailable().then(setBiometricAvailable);
  }, []);

  const tryBiometrics = React.useCallback(async () => {
    const success = await authenticateWithBiometrics();
    if (success) onUnlock();
  }, [onUnlock]);

  useEffect(() => {
    if (biometricEnabled && biometricAvailable) {
      tryBiometrics();
    }
    // Only auto-prompt once, when biometrics become known-available.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [biometricAvailable]);

  const submitPin = async () => {
    const valid = await verifyPin(pin);
    if (valid) {
      onUnlock();
    } else {
      setError('Incorrect PIN.');
      setPin('');
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background, paddingTop: insets.top + spacing.xl },
      ]}
    >
      <View style={styles.content}>
        <Text style={[styles.wordmark, { color: theme.colors.text.primary }]}>PRISM</Text>
        <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>Unlock PRISM.</Text>

        {biometricEnabled && biometricAvailable ? (
          <PRISMButton
            label="Unlock with biometrics"
            onPress={tryBiometrics}
            accessibilityLabel="Unlock with biometrics"
          />
        ) : null}

        <View style={styles.pinBlock}>
          <PRISMInput
            label="PIN"
            value={pin}
            onChangeText={(value) => {
              setPin(value);
              setError(undefined);
            }}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={8}
            error={error}
          />
          <PRISMButton label="Unlock" variant="secondary" onPress={submitPin} disabled={!pin} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    width: '100%',
    maxWidth: 360,
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
    alignItems: 'stretch',
  },
  wordmark: {
    fontFamily: fontFamily.display,
    fontSize: type.headingXL.fontSize,
    lineHeight: type.headingXL.lineHeight,
    fontWeight: fontWeight.bold as '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: type.bodyL.fontSize,
    lineHeight: type.bodyL.lineHeight,
    textAlign: 'center',
    marginTop: -spacing.md,
  },
  pinBlock: {
    gap: spacing.sm,
  },
});
