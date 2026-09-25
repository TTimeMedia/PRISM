import { Redirect } from 'expo-router';

/** The timeline now lives on the YOU tab; this keeps old links working. */
export default function TimelineRedirect() {
  return <Redirect href="/you" />;
}
