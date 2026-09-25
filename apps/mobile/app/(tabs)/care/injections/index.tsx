import { Redirect } from 'expo-router';

/** Injections are medications now; old links land on Medications. */
export default function InjectionsRedirect() {
  return <Redirect href="/care/medications" />;
}
