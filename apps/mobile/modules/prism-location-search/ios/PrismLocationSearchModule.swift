import ExpoModulesCore
import MapKit

/// Apple MapKit autocomplete (no API key, no third-party SDK). Each call to
/// `search` resolves with up to six `{ title, subtitle }` suggestions; a
/// newer call supersedes an older pending one, which resolves empty.
public final class PrismLocationSearchModule: Module {
  private let searcher = LocationSearcher()

  public func definition() -> ModuleDefinition {
    Name("PrismLocationSearch")

    AsyncFunction("search") { (query: String, promise: Promise) in
      DispatchQueue.main.async {
        self.searcher.search(query: query, promise: promise)
      }
    }
  }
}

private final class LocationSearcher: NSObject, MKLocalSearchCompleterDelegate {
  private let completer = MKLocalSearchCompleter()
  private var pending: Promise?

  override init() {
    super.init()
    completer.delegate = self
    completer.resultTypes = [.address, .pointOfInterest]
  }

  func search(query: String, promise: Promise) {
    pending?.resolve(LocationSearcher.empty)
    pending = nil

    let trimmed = query.trimmingCharacters(in: .whitespacesAndNewlines)
    if trimmed.isEmpty {
      promise.resolve(LocationSearcher.empty)
      return
    }

    // MapKit only calls the delegate when the fragment changes.
    if trimmed == completer.queryFragment {
      promise.resolve(currentResults())
      return
    }

    pending = promise
    completer.queryFragment = trimmed
  }

  func completerDidUpdateResults(_ completer: MKLocalSearchCompleter) {
    pending?.resolve(currentResults())
    pending = nil
  }

  func completer(_ completer: MKLocalSearchCompleter, didFailWithError error: Error) {
    pending?.resolve(LocationSearcher.empty)
    pending = nil
  }

  private static let empty: [[String: String]] = []

  private func currentResults() -> [[String: String]] {
    return completer.results.prefix(6).map { ["title": $0.title, "subtitle": $0.subtitle] }
  }
}
