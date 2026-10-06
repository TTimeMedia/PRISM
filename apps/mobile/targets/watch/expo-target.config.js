/**
 * The Prism Apple Watch app (SwiftUI, watchOS 10+), built by
 * @bacons/apple-targets. It shows today's doses and the next appointment,
 * logs a dose, and gives Prism reminders their own look on the watch.
 * Everything it shows comes from the iPhone app (lib/watch/useWatchSync.ts
 * → modules/prism-watch); it never signs in or talks to Supabase itself.
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
  frameworks: ['SwiftUI', 'WatchConnectivity', 'UserNotifications', 'UserNotificationsUI'],
  colors: {
    $accent: '#3B82F6',
  },
});
