/**
 * The Prism Apple Watch app (SwiftUI, watchOS 10+), built by
 * @bacons/apple-targets. It shows today's doses and the next appointment,
 * logs a dose, and gives Prism reminders their own look on the watch.
 * What it shows comes from the iPhone app (lib/watch/useWatchSync.ts
 * → modules/prism-watch), two weeks ahead. With the watch-only key the phone
 * gives it, it reads which doses are taken and logs doses through the watch
 * Edge Function (supabase/functions/watch), so Prism needn't be open on the
 * phone. It never signs in.
 *
 * @type {import('@bacons/apple-targets/app.plugin').ConfigFunction}
 */
module.exports = () => ({
  type: 'watch',
  name: 'PrismWatch',
  displayName: 'Prism',
  bundleIdentifier: '.watchkitapp',
  deploymentTarget: '10.0',
  icon: '../../assets/images/app-icons/icon-slate.png',
  frameworks: [
    'SwiftUI',
    'WatchConnectivity',
    'UserNotifications',
    'UserNotificationsUI',
    'Security',
  ],
  colors: {
    $accent: '#3B82F6',
  },
});
