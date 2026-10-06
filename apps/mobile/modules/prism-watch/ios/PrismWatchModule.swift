import ExpoModulesCore
import WatchConnectivity

/// The iPhone side of the Prism Apple Watch app.
///
/// - `updateContext(json)` hands the watch what it shows: today's doses and the
///   next appointment, already worded the way Private notifications allows.
///   WatchConnectivity keeps only the latest one and delivers it whenever the
///   watch can take it.
/// - Things done on the watch (logging a dose, Snooze on a reminder) arrive as
///   messages. They are written to disk first, so none is lost if JavaScript
///   isn't running yet, then announced with `onWatchAction`; JavaScript takes
///   them with `takePendingActions()` and saves them to the account.
public final class PrismWatchModule: Module {
  public func definition() -> ModuleDefinition {
    Name("PrismWatch")

    Events("onWatchAction")

    OnCreate {
      WatchBridge.shared.onAction = { [weak self] in
        self?.sendEvent("onWatchAction", [:])
      }
      WatchBridge.shared.activate()
    }

    Function("isSupported") {
      WCSession.isSupported()
    }

    Function("isWatchAppInstalled") {
      WatchBridge.shared.isWatchAppInstalled
    }

    Function("updateContext") { (json: String) in
      WatchBridge.shared.update(json)
    }

    Function("takePendingActions") { () -> [String] in
      WatchBridge.shared.takePending()
    }
  }
}

final class WatchBridge: NSObject, WCSessionDelegate {
  static let shared = WatchBridge()

  var onAction: (() -> Void)?

  private let pendingKey = "prism.watch.pendingActions"
  private let lock = NSLock()
  private var latestContext: String?

  var isWatchAppInstalled: Bool {
    guard WCSession.isSupported() else { return false }
    let session = WCSession.default
    return session.activationState == .activated && session.isPaired && session.isWatchAppInstalled
  }

  func activate() {
    guard WCSession.isSupported() else { return }
    let session = WCSession.default
    if session.delegate == nil { session.delegate = self }
    if session.activationState != .activated { session.activate() }
  }

  /// Keeps the newest context and sends it once the session is ready.
  func update(_ json: String) {
    lock.lock()
    latestContext = json
    lock.unlock()
    send()
  }

  private func send() {
    guard WCSession.isSupported() else { return }
    let session = WCSession.default
    lock.lock()
    let json = latestContext
    lock.unlock()
    guard let json, session.activationState == .activated, session.isPaired,
      session.isWatchAppInstalled
    else { return }
    try? session.updateApplicationContext(["context": json])
  }

  func takePending() -> [String] {
    lock.lock()
    defer { lock.unlock() }
    let actions = UserDefaults.standard.stringArray(forKey: pendingKey) ?? []
    UserDefaults.standard.removeObject(forKey: pendingKey)
    return actions
  }

  private func store(_ payload: [String: Any]) {
    guard let action = payload["action"] as? String else { return }
    lock.lock()
    var actions = UserDefaults.standard.stringArray(forKey: pendingKey) ?? []
    actions.append(action)
    UserDefaults.standard.set(actions, forKey: pendingKey)
    lock.unlock()
    DispatchQueue.main.async { self.onAction?() }
  }

  // MARK: - WCSessionDelegate

  func session(
    _ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState,
    error: Error?
  ) {
    send()
  }

  func sessionWatchStateDidChange(_ session: WCSession) {
    send()
  }

  func sessionDidBecomeInactive(_ session: WCSession) {}

  func sessionDidDeactivate(_ session: WCSession) {
    // Switching to another watch: start a session with the new one.
    session.activate()
  }

  func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
    store(message)
  }

  func session(
    _ session: WCSession, didReceiveMessage message: [String: Any],
    replyHandler: @escaping ([String: Any]) -> Void
  ) {
    store(message)
    replyHandler(["received": true])
  }

  func session(_ session: WCSession, didReceiveUserInfo userInfo: [String: Any] = [:]) {
    store(userInfo)
  }
}
