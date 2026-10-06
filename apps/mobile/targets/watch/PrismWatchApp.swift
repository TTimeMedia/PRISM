import SwiftUI
import UserNotifications
import WatchKit

/// Category ids the iPhone app gives its reminders
/// (apps/mobile/lib/reminders/notificationScheduler.ts), and the action ids on them.
enum ReminderCategory {
  static let medication = "prism-medication"
  static let appointment = "prism-appointment"
  static let done = "done"
  static let snooze = "snooze"
  static let snoozeMinutes = 10
}

@main
struct PrismWatchApp: App {
  @WKApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate

  var body: some Scene {
    WindowGroup {
      ContentView()
    }
    WKNotificationScene(controller: ReminderNotificationController.self, category: ReminderCategory.medication)
    WKNotificationScene(controller: ReminderNotificationController.self, category: ReminderCategory.appointment)
  }
}

final class AppDelegate: NSObject, WKApplicationDelegate, UNUserNotificationCenterDelegate {
  func applicationDidFinishLaunching() {
    UNUserNotificationCenter.current().delegate = self
    WatchStore.shared.activate()
  }

  /// A reminder arriving while Prism is open on the watch still shows.
  func userNotificationCenter(
    _ center: UNUserNotificationCenter, willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
  ) {
    completionHandler([.banner, .list, .sound])
  }

  /// Buttons pressed on a reminder shown on the watch. Done logs the dose
  /// through the phone; Snooze reminds again on the watch in 10 minutes.
  func userNotificationCenter(
    _ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse,
    withCompletionHandler completionHandler: @escaping () -> Void
  ) {
    let content = response.notification.request.content
    let info = content.userInfo
    let type = (info["type"] as? String) == "snooze" ? info["originType"] as? String : info["type"] as? String
    let referenceId = info["referenceId"] as? String

    switch response.actionIdentifier {
    case ReminderCategory.done:
      if let referenceId, type == "medication" || type == "medication_nudge" {
        let dueAt = (info["doseAt"] as? String).flatMap(parseISODate) ?? response.notification.date
        WatchStore.shared.logDoseFromReminder(medicationId: referenceId, deliveredAt: dueAt)
      }
    case ReminderCategory.snooze:
      let again = UNMutableNotificationContent()
      again.title = content.title
      again.body = content.body
      again.categoryIdentifier = content.categoryIdentifier
      again.userInfo = info
      again.sound = .default
      let trigger = UNTimeIntervalNotificationTrigger(
        timeInterval: TimeInterval(ReminderCategory.snoozeMinutes * 60), repeats: false)
      center.add(UNNotificationRequest(identifier: UUID().uuidString, content: again, trigger: trigger))
    default:
      break
    }
    completionHandler()
  }
}
