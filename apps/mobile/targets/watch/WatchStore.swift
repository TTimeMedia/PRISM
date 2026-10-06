import Foundation
import WatchConnectivity
import WatchKit

/// One of today's doses, as the iPhone app worded it (lib/watch/watchContext.ts).
struct WatchDose: Codable, Identifiable, Equatable {
  let medicationId: String
  let label: String
  let detail: String?
  let at: String
  var taken: Bool

  var id: String { "\(medicationId)@\(at)" }
  var date: Date? { parseISODate(at) }
}

struct WatchAppointment: Codable, Equatable {
  let label: String
  let at: String
  let place: String?

  var date: Date? { parseISODate(at) }
}

/// Everything the watch shows. Sent by the iPhone, kept on the watch so it
/// still shows when the phone is out of range.
struct WatchContext: Codable, Equatable {
  let v: Int
  let signedIn: Bool
  let `private`: Bool
  let updatedAt: String
  let doses: [WatchDose]
  let next: WatchAppointment?
}

func parseISODate(_ value: String) -> Date? {
  let withFraction = ISO8601DateFormatter()
  withFraction.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
  if let date = withFraction.date(from: value) { return date }
  return ISO8601DateFormatter().date(from: value)
}

/// Talks to the iPhone app over WatchConnectivity.
///
/// Receives the latest context (today's doses, next appointment) and sends
/// back doses marked taken here. A dose marked taken shows as taken at once;
/// if the phone is out of reach the request waits in WatchConnectivity's
/// queue and is saved when the phone next opens Prism.
final class WatchStore: NSObject, ObservableObject, WCSessionDelegate {
  static let shared = WatchStore()

  @Published private(set) var context: WatchContext?
  /// Doses marked taken here that the phone hasn't confirmed yet, by dose id.
  @Published private(set) var pendingTaken: Set<String> = []

  private let contextKey = "prism.watch.context"
  private let pendingKey = "prism.watch.pendingTaken"

  override init() {
    super.init()
    if let json = UserDefaults.standard.string(forKey: contextKey) {
      context = Self.decode(json)
    }
    pendingTaken = Set(UserDefaults.standard.stringArray(forKey: pendingKey) ?? [])
  }

  func activate() {
    guard WCSession.isSupported() else { return }
    let session = WCSession.default
    if session.delegate == nil { session.delegate = self }
    if session.activationState != .activated { session.activate() }
  }

  func isTaken(_ dose: WatchDose) -> Bool {
    dose.taken || pendingTaken.contains(dose.id)
  }

  /// Marks a dose from today's list as taken.
  func markTaken(_ dose: WatchDose) {
    guard !isTaken(dose) else { return }
    logDose(medicationId: dose.medicationId, at: dose.at, doseId: dose.id)
  }

  /// Done on a reminder. Uses today's listed dose for that medication when
  /// there is one, so the list ticks it off and the log matches its time.
  func logDoseFromReminder(medicationId: String, deliveredAt: Date) {
    if let dose = context?.doses.first(where: { $0.medicationId == medicationId && !isTaken($0) }) {
      markTaken(dose)
    } else {
      logDose(medicationId: medicationId, at: ISO8601DateFormatter().string(from: deliveredAt))
    }
  }

  /// Sends a dose to the phone to log.
  func logDose(medicationId: String, at: String, doseId: String? = nil) {
    let id = doseId ?? "\(medicationId)@\(at)"
    DispatchQueue.main.async {
      self.pendingTaken.insert(id)
      self.savePending()
    }
    WKInterfaceDevice.current().play(.success)
    let action: [String: Any] = [
      "type": "logDose",
      "id": UUID().uuidString,
      "medicationId": medicationId,
      "at": at,
    ]
    guard let data = try? JSONSerialization.data(withJSONObject: action),
      let json = String(data: data, encoding: .utf8)
    else { return }
    send(["action": json])
  }

  private func send(_ payload: [String: Any]) {
    guard WCSession.isSupported() else { return }
    let session = WCSession.default
    if session.activationState == .activated && session.isReachable {
      session.sendMessage(
        payload, replyHandler: { _ in },
        errorHandler: { _ in _ = session.transferUserInfo(payload) })
    } else {
      // Queued by the system and delivered when the phone is back.
      _ = session.transferUserInfo(payload)
    }
  }

  private func apply(_ json: String) {
    guard let next = Self.decode(json) else { return }
    DispatchQueue.main.async {
      self.context = next
      UserDefaults.standard.set(json, forKey: self.contextKey)
      // Keep only what the phone hasn't confirmed yet, and only for doses still listed today.
      let listed = Set(next.doses.map(\.id))
      let confirmed = Set(next.doses.filter(\.taken).map(\.id))
      self.pendingTaken = self.pendingTaken.filter { listed.contains($0) && !confirmed.contains($0) }
      self.savePending()
    }
  }

  private func savePending() {
    UserDefaults.standard.set(Array(pendingTaken), forKey: pendingKey)
  }

  private static func decode(_ json: String) -> WatchContext? {
    guard let data = json.data(using: .utf8) else { return nil }
    return try? JSONDecoder().decode(WatchContext.self, from: data)
  }

  // MARK: - WCSessionDelegate

  func session(
    _ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState,
    error: Error?
  ) {
    if let json = session.receivedApplicationContext["context"] as? String {
      apply(json)
    }
  }

  func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String: Any]) {
    if let json = applicationContext["context"] as? String {
      apply(json)
    }
  }
}
