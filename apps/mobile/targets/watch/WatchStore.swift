import Foundation
import Security
import WatchConnectivity
import WatchKit

/// One dose, as the iPhone app worded it (lib/watch/watchContext.ts).
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

/// Where the watch reads and logs doses itself (supabase/functions/watch).
struct WatchServer: Codable, Equatable {
  let url: String
  let token: String
}

/// Everything the watch shows. Sent by the iPhone, kept on the watch so it
/// still shows when the phone is out of range or Prism isn't open there.
/// `schedule`, `appointments`, `until` and `server` come from newer iPhone
/// apps; without them the watch falls back to `doses` and `next`.
struct WatchContext: Codable, Equatable {
  let v: Int
  let signedIn: Bool
  let `private`: Bool
  let updatedAt: String
  let doses: [WatchDose]
  let next: WatchAppointment?
  var schedule: [WatchDose]?
  var appointments: [WatchAppointment]?
  var until: String?
  var server: WatchServer?
}

/// A dose tapped on the watch, waiting to be saved by the server.
private struct OutboxItem: Codable, Equatable {
  let medicationId: String
  let at: String
}

func parseISODate(_ value: String) -> Date? {
  let withFraction = ISO8601DateFormatter()
  withFraction.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
  if let date = withFraction.date(from: value) { return date }
  return ISO8601DateFormatter().date(from: value)
}

private func isoString(_ date: Date) -> String {
  let formatter = ISO8601DateFormatter()
  formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
  return formatter.string(from: date)
}

/// Keeps the Prism data the watch shows and saves what's done on it.
///
/// The iPhone sends the next two weeks of doses and the next few
/// appointments over WatchConnectivity whenever Prism is open there, plus a
/// watch-only key. With that key the watch asks the watch Edge Function which
/// of today's doses are taken and logs doses itself, so none of it needs
/// Prism open on the phone. Without a key (an older iPhone app) doses go to
/// the phone to log, as before.
final class WatchStore: NSObject, ObservableObject, WCSessionDelegate {
  static let shared = WatchStore()

  @Published private(set) var context: WatchContext?
  /// Doses marked taken here that aren't confirmed yet, by dose id.
  @Published private(set) var pendingTaken: Set<String> = []
  /// Medications with a dose logged today, as the server last said.
  @Published private(set) var serverTaken: Set<String> = []
  /// The day `serverTaken` is for.
  @Published private(set) var serverTakenDay: Date?

  private let contextKey = "prism.watch.context"
  private let pendingKey = "prism.watch.pendingTaken"
  private let outboxKey = "prism.watch.outbox"
  private let tokenAccount = "prism.watch.token"

  private var outbox: [OutboxItem] = []
  private var flushing = false
  /// The key the phone was last asked to replace, so it's asked once.
  private var reportedBadToken: String?

  override init() {
    super.init()
    if let json = UserDefaults.standard.string(forKey: contextKey) {
      context = Self.decode(json)
      context?.server = Keychain.read(account: tokenAccount).flatMap(Self.decodeServer)
    }
    pendingTaken = Set(UserDefaults.standard.stringArray(forKey: pendingKey) ?? [])
    if let data = UserDefaults.standard.data(forKey: outboxKey),
      let saved = try? JSONDecoder().decode([OutboxItem].self, from: data)
    {
      outbox = saved
    }
  }

  func activate() {
    guard WCSession.isSupported() else { return }
    let session = WCSession.default
    if session.delegate == nil { session.delegate = self }
    if session.activationState != .activated { session.activate() }
  }

  // MARK: - What the watch shows

  /// Today's doses, soonest first. Worked out on the watch, so a new day
  /// shows without the phone.
  var todayDoses: [WatchDose] {
    guard let context else { return [] }
    guard let schedule = context.schedule else {
      // An older iPhone app: only `doses`, and only for the day it was sent.
      return parseISODate(context.updatedAt).map(Calendar.current.isDateInToday) == true
        ? context.doses : []
    }
    return schedule.filter { dose in dose.date.map(Calendar.current.isDateInToday) ?? false }
  }

  /// The soonest appointment that hasn't started yet.
  var nextAppointment: WatchAppointment? {
    guard let context else { return nil }
    let list = context.appointments ?? [context.next].compactMap { $0 }
    let now = Date()
    return list.first { ($0.date ?? .distantPast) >= now }
  }

  /// True when the phone's list has run out and Prism needs opening there.
  var isOutOfDate: Bool {
    guard let context else { return false }
    if let until = context.until.flatMap(parseISODate) { return Date() >= until }
    return parseISODate(context.updatedAt).map { !Calendar.current.isDateInToday($0) } ?? true
  }

  func isTaken(_ dose: WatchDose) -> Bool {
    if pendingTaken.contains(dose.id) { return true }
    let today = dose.date.map(Calendar.current.isDateInToday) ?? false
    if let day = serverTakenDay, Calendar.current.isDateInToday(day), today,
      serverTaken.contains(dose.medicationId)
    {
      return true
    }
    // The phone's own answer only holds for the day it was sent.
    let sentToday = context.flatMap { parseISODate($0.updatedAt) }.map(Calendar.current.isDateInToday) ?? false
    return dose.taken && sentToday
  }

  // MARK: - Doses

  /// Marks a dose from today's list as taken.
  func markTaken(_ dose: WatchDose) {
    guard !isTaken(dose) else { return }
    logDose(medicationId: dose.medicationId, at: dose.at, doseId: dose.id)
  }

  /// Done on a reminder. Uses today's listed dose for that medication when
  /// there is one, so the list ticks it off and the log matches its time.
  func logDoseFromReminder(medicationId: String, deliveredAt: Date) {
    if let dose = todayDoses.first(where: { $0.medicationId == medicationId && !isTaken($0) }) {
      markTaken(dose)
    } else {
      logDose(medicationId: medicationId, at: isoString(deliveredAt))
    }
  }

  /// Logs a dose: through the server when the watch has a key, otherwise
  /// through the phone.
  func logDose(medicationId: String, at: String, doseId: String? = nil) {
    let id = doseId ?? "\(medicationId)@\(at)"
    DispatchQueue.main.async {
      self.pendingTaken.insert(id)
      self.savePending()
    }
    WKInterfaceDevice.current().play(.success)

    if context?.server != nil {
      DispatchQueue.main.async {
        let item = OutboxItem(medicationId: medicationId, at: at)
        if !self.outbox.contains(item) { self.outbox.append(item) }
        self.saveOutbox()
        self.flushOutbox()
      }
      return
    }

    let action: [String: Any] = [
      "type": "logDose",
      "id": UUID().uuidString,
      "medicationId": medicationId,
      "at": at,
    ]
    sendToPhone(action)
  }

  /// Asks the server which of today's doses are taken, and saves any doses
  /// still waiting. Called when the watch app opens or comes back.
  func refresh() {
    DispatchQueue.main.async {
      // Today may have changed: redraw from the schedule even with no server.
      self.objectWillChange.send()
      self.flushOutbox()
      self.fetchTaken()
    }
  }

  private func fetchTaken() {
    guard let server = context?.server else { return }
    let start = Calendar.current.startOfDay(for: Date())
    guard let end = Calendar.current.date(byAdding: .day, value: 1, to: start) else { return }
    let body: [String: Any] = ["action": "taken", "from": isoString(start), "to": isoString(end)]
    post(server, body) { [weak self] status, json in
      guard let self else { return }
      if status == 401 {
        self.reportBadToken(server.token)
        return
      }
      guard status == 200, let taken = json?["taken"] as? [[String: Any]] else { return }
      let ids = Set(taken.compactMap { $0["medicationId"] as? String })
      DispatchQueue.main.async {
        self.serverTaken = ids
        self.serverTakenDay = start
        // Doses the server now knows about no longer need holding here.
        self.pendingTaken = self.pendingTaken.filter { id in
          !ids.contains(where: { id.hasPrefix("\($0)@") })
        }
        self.savePending()
      }
    }
  }

  /// Sends waiting doses to the server, oldest first. Stops at the first
  /// failure and tries again on the next refresh. Main thread only.
  private func flushOutbox() {
    guard !flushing, let item = outbox.first, let server = context?.server else { return }
    flushing = true
    let body: [String: Any] = ["action": "logDose", "medicationId": item.medicationId, "at": item.at]
    post(server, body) { [weak self] status, _ in
      DispatchQueue.main.async {
        guard let self else { return }
        self.flushing = false
        switch status ?? 0 {
        case 200, 404:
          // Saved, already saved, or the medication was deleted: done either way.
          self.outbox.removeAll { $0 == item }
          self.saveOutbox()
          if status == 200 { self.serverTaken.insert(item.medicationId) }
          self.flushOutbox()
        case 401:
          self.reportBadToken(server.token)
        default:
          break
        }
      }
    }
  }

  private func post(
    _ server: WatchServer, _ body: [String: Any],
    completion: @escaping (Int?, [String: Any]?) -> Void
  ) {
    guard let url = URL(string: server.url),
      let data = try? JSONSerialization.data(withJSONObject: body)
    else {
      completion(nil, nil)
      return
    }
    var request = URLRequest(url: url, timeoutInterval: 20)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.setValue(server.token, forHTTPHeaderField: "x-watch-token")
    request.httpBody = data
    URLSession.shared.dataTask(with: request) { data, response, _ in
      let status = (response as? HTTPURLResponse)?.statusCode
      let json = data.flatMap { try? JSONSerialization.jsonObject(with: $0) as? [String: Any] }
      completion(status, json)
    }.resume()
  }

  /// The server turned the key down (it was replaced or the phone signed
  /// out). Asks the phone for a new one; it arrives with the next context.
  private func reportBadToken(_ token: String) {
    DispatchQueue.main.async {
      guard self.reportedBadToken != token else { return }
      self.reportedBadToken = token
      self.sendToPhone(["type": "needKey"])
    }
  }

  private func sendToPhone(_ action: [String: Any]) {
    guard let data = try? JSONSerialization.data(withJSONObject: action),
      let json = String(data: data, encoding: .utf8)
    else { return }
    let payload: [String: Any] = ["action": json]
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

  // MARK: - From the phone

  private func apply(_ json: String) {
    guard let decoded = Self.decode(json) else { return }
    DispatchQueue.main.async {
      var next = decoded
      // The key goes in the Keychain, not in the saved copy of the context.
      if let server = next.server, let data = try? JSONEncoder().encode(server),
        let serverJSON = String(data: data, encoding: .utf8)
      {
        Keychain.write(serverJSON, account: self.tokenAccount)
      } else {
        Keychain.delete(account: self.tokenAccount)
      }
      let server = next.server
      next.server = nil
      if let data = try? JSONEncoder().encode(next), let stripped = String(data: data, encoding: .utf8) {
        UserDefaults.standard.set(stripped, forKey: self.contextKey)
      }
      next.server = server
      self.context = next

      if !next.signedIn {
        // Signed out on the phone: forget everything that belonged to the account.
        self.outbox = []
        self.saveOutbox()
        self.pendingTaken = []
        self.serverTaken = []
        self.serverTakenDay = nil
      } else {
        // Keep only what isn't confirmed yet, and only for doses still listed today.
        let listed = Set(self.todayDoses.map(\.id))
        let confirmed = Set(self.todayDoses.filter(\.taken).map(\.id))
        self.pendingTaken = self.pendingTaken.filter { listed.contains($0) && !confirmed.contains($0) }
      }
      self.savePending()
      if server != nil { self.refresh() }
    }
  }

  private func savePending() {
    UserDefaults.standard.set(Array(pendingTaken), forKey: pendingKey)
  }

  private func saveOutbox() {
    if let data = try? JSONEncoder().encode(outbox) {
      UserDefaults.standard.set(data, forKey: outboxKey)
    }
  }

  private static func decode(_ json: String) -> WatchContext? {
    guard let data = json.data(using: .utf8) else { return nil }
    return try? JSONDecoder().decode(WatchContext.self, from: data)
  }

  private static func decodeServer(_ json: String) -> WatchServer? {
    guard let data = json.data(using: .utf8) else { return nil }
    return try? JSONDecoder().decode(WatchServer.self, from: data)
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

/// A small wrapper for one generic-password item per account name.
private enum Keychain {
  private static let service = "app.prism.watch"

  static func read(account: String) -> String? {
    let query: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: service,
      kSecAttrAccount as String: account,
      kSecReturnData as String: true,
      kSecMatchLimit as String: kSecMatchLimitOne,
    ]
    var result: AnyObject?
    guard SecItemCopyMatching(query as CFDictionary, &result) == errSecSuccess,
      let data = result as? Data
    else { return nil }
    return String(data: data, encoding: .utf8)
  }

  static func write(_ value: String, account: String) {
    delete(account: account)
    let item: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: service,
      kSecAttrAccount as String: account,
      kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly,
      kSecValueData as String: Data(value.utf8),
    ]
    SecItemAdd(item as CFDictionary, nil)
  }

  static func delete(account: String) {
    let query: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: service,
      kSecAttrAccount as String: account,
    ]
    SecItemDelete(query as CFDictionary)
  }
}
