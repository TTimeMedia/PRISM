import SwiftUI
import UserNotifications
import WatchKit

/// The long look of a Prism reminder on the watch: the reminder's own words,
/// large, under a small Prism mark, with the time it was for. It shows only
/// what the reminder already says, so Private notifications ("Your Prism
/// reminder is ready.") stays private here too. Done and Snooze appear below
/// it from the reminder's category.
final class ReminderNotificationController: WKUserNotificationHostingController<ReminderNotificationView> {
  private var title = "Prism"
  private var message = ""
  private var isAppointment = false
  private var when = Date()

  override var body: ReminderNotificationView {
    ReminderNotificationView(title: title, message: message, isAppointment: isAppointment, when: when)
  }

  override func didReceive(_ notification: UNNotification) {
    let content = notification.request.content
    title = content.title.isEmpty ? "Prism" : content.title
    message = content.body
    isAppointment = content.categoryIdentifier == ReminderCategory.appointment
    when = notification.date
  }
}

struct ReminderNotificationView: View {
  let title: String
  let message: String
  let isAppointment: Bool
  let when: Date

  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      HStack(spacing: 6) {
        Image(systemName: isAppointment ? "calendar" : "pills.fill")
          .foregroundStyle(Color.accentColor)
        Text(title)
          .font(.footnote.weight(.semibold))
          .foregroundStyle(.secondary)
        Spacer(minLength: 0)
        Text(timeText(when))
          .font(.footnote)
          .foregroundStyle(.secondary)
      }
      Text(message)
        .font(.title3.weight(.semibold))
        .fixedSize(horizontal: false, vertical: true)
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .accessibilityElement(children: .combine)
  }
}
