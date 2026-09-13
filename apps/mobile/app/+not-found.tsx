import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { Link, Stack } from 'expo-router';
import { PRISMButton, PRISMErrorState } from '@prism/ui';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'PRISM' }} />
      <SafeAreaView style={styles.container}>
        <PRISMErrorState message="This screen doesn't exist." />
        <Link href="/(tabs)/today" asChild>
          <PRISMButton label="Go to Today" variant="primary" />
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
