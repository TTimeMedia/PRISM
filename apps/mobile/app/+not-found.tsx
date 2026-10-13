import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { Link, Stack } from 'expo-router';
import { PRIZMButton, PRIZMErrorState } from '@prizm/ui';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Prizm' }} />
      <SafeAreaView style={styles.container}>
        <PRIZMErrorState message="This screen doesn't exist." />
        <Link href="/(tabs)/today" asChild>
          <PRIZMButton label="Go to Today" variant="primary" />
        </Link>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 16,
  },
});
