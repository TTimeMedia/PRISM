import React, { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import {
  PRISMButton,
  PRISMErrorState,
  PRISMHeader,
  PRISMIconButton,
  PRISMInput,
  PRISMSection,
  PRISMSheet,
  PRISMSkeleton,
  PRISMSwitch,
  spacing,
  useTheme,
  useToast,
} from '@prism/ui';
import { useSettings, useUpdateSettings } from '../../../lib/profile/queries';
import { hasPin, setPin } from '../../../lib/you/pinStorage';
import { isBiometricAvailable } from '../../../lib/you/biometrics';

/**
 * Screen 60 — App Lock. Enable App Lock requires a PIN to exist first —
 * there's no lock without a fallback unlock method. Biometrics are
 * offered only when the device actually has them enrolled; PIN is
 * always the fallback either way. See docs/SCREEN_BIBLE.md Screen 60.
 */
export function AppLockSettingsScreen() {
  const theme = useTheme();
  const { data: settings, isLoading, isError, refetch } = useSettings();
  const updateSettings = useUpdateSettings();
  const { showToast } = useToast();

  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [pendingEnable, setPendingEnable] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState<string | undefined>();

  useEffect(() => {
    isBiometricAvailable().then(setBiometricsAvailable);
  }, []);

  const openPinModal = (enabling: boolean) => {
    setPendingEnable(enabling);
    setNewPin('');
    setConfirmPin('');
    setPinError(undefined);
    setPinModalVisible(true);
  };

  const toggleAppLock = async (value: boolean) => {
    if (value) {
      const alreadyHasPin = await hasPin();
      if (!alreadyHasPin) {
        openPinModal(true);
        return;
      }
    }
    updateSettings.mutate({ app_lock_enabled: value });
  };

  const savePin = async () => {
    if (!/^\d{4,8}$/.test(newPin)) {
      setPinError('PIN must be 4-8 digits.');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError("PINs don't match.");
      return;
    }
    try {
      await setPin(newPin);
      setPinModalVisible(false);
      if (pendingEnable) {
        updateSettings.mutate({ app_lock_enabled: true });
      }
      showToast('PIN saved.', 'success');
    } catch {
      setPinError("Couldn't save your PIN. Please try again.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PRISMHeader
        title="App lock."
        leading={
          <PRISMIconButton accessibilityLabel="Back" onPress={() => router.back()}>
            <ArrowLeft size={22} color={theme.colors.text.primary} />
          </PRISMIconButton>
        }
      />
      {isLoading ? (
        <PRISMSkeleton height={56} />
      ) : isError || !settings ? (
        <PRISMErrorState onRetry={() => refetch()} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <PRISMSection>
            <PRISMSwitch
              label="Enable App Lock"
              description="Require a PIN or biometrics to open PRISM."
              value={settings.app_lock_enabled}
              onValueChange={toggleAppLock}
            />
            <PRISMSwitch
              label="Use biometrics"
              description={
                biometricsAvailable
                  ? 'Unlock with Face ID, Touch ID, or your device biometrics.'
                  : 'Not available on this device — PIN is used instead.'
              }
              value={settings.biometric_lock}
              disabled={!biometricsAvailable || !settings.app_lock_enabled}
              onValueChange={(value) => updateSettings.mutate({ biometric_lock: value })}
            />
          </PRISMSection>
          <PRISMButton label="Change PIN" variant="secondary" onPress={() => openPinModal(false)} />
        </ScrollView>
      )}
      <PRISMSheet
        visible={pinModalVisible}
        title={pendingEnable ? 'Set a PIN' : 'Change your PIN'}
        onRequestClose={() => setPinModalVisible(false)}
      >
        <View style={styles.pinFields}>
          <PRISMInput
            label="New PIN"
            helperText={pinError ? undefined : 'Used to unlock PRISM. Stored only on this device.'}
            value={newPin}
            onChangeText={setNewPin}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={8}
            error={pinError}
          />
          <PRISMInput
            label="Confirm PIN"
            value={confirmPin}
            onChangeText={setConfirmPin}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={8}
          />
          <View style={styles.sheetActions}>
            <PRISMButton label="Save" onPress={savePin} />
            <PRISMButton
              label="Cancel"
              variant="secondary"
              onPress={() => setPinModalVisible(false)}
            />
          </View>
        </View>
      </PRISMSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  pinFields: {
    marginBottom: spacing.sm,
  },
  sheetActions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
