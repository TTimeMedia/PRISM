import React from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { SupportFormScreen } from '../../../../features/you/screens/SupportFormScreen';
import { isSupportKind } from '../../../../lib/you/support';

/** /you/support/contact | problem | privacy, with `shot` and `from` when opened by shaking. */
export default function SupportFormRoute() {
  const { kind, shot, from } = useLocalSearchParams<{
    kind: string;
    shot?: string;
    from?: string;
  }>();
  if (!isSupportKind(kind)) return <Redirect href="/you/support" />;
  return <SupportFormScreen kind={kind} screenshotUri={shot ?? null} fromScreen={from ?? null} />;
}
