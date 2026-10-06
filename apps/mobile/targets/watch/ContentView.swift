import SwiftUI

/// Today's doses (tap one to mark it taken) and the next appointment.
struct ContentView: View {
  @ObservedObject private var store = WatchStore.shared
  @State private var confirming: WatchDose?

  var body: some View {
    NavigationStack {
      Group {
        if let context = store.context, context.signedIn {
          list(context)
        } else {
          OpenOnPhoneView()
        }
      }
      .navigationTitle("Prism")
    }
    .confirmationDialog(
      "Mark as taken?",
      isPresented: Binding(get: { confirming != nil }, set: { if !$0 { confirming = nil } }),
      titleVisibility: .visible,
      presenting: confirming
    ) { dose in
      Button("Taken") { store.markTaken(dose) }
      Button("Cancel", role: .cancel) {}
    } message: { dose in
      Text("\(dose.label) at \(timeText(dose.date))")
    }
  }

  private func list(_ context: WatchContext) -> some View {
    List {
      Section("Today") {
        if context.doses.isEmpty {
          Text("No doses today.")
            .foregroundStyle(.secondary)
        }
        ForEach(context.doses) { dose in
          let taken = store.isTaken(dose)
          Button {
            if !taken { confirming = dose }
          } label: {
            HStack(spacing: 10) {
              Image(systemName: taken ? "checkmark.circle.fill" : "circle")
                .foregroundStyle(taken ? Color.accentColor : .secondary)
                .font(.title3)
              VStack(alignment: .leading, spacing: 2) {
                Text(dose.label)
                  .font(.headline)
                  .lineLimit(2)
                Text([timeText(dose.date), dose.detail].compactMap { $0 }.joined(separator: " · "))
                  .font(.footnote)
                  .foregroundStyle(.secondary)
              }
            }
          }
          .accessibilityLabel(
            "\(dose.label), \(timeText(dose.date)), \(taken ? "taken" : "not taken yet")")
        }
      }

      Section("Next") {
        if let next = context.next {
          VStack(alignment: .leading, spacing: 2) {
            Text(next.label)
              .font(.headline)
              .lineLimit(2)
            Text(dayAndTimeText(next.date))
              .font(.footnote)
              .foregroundStyle(.secondary)
            if let place = next.place {
              Text(place)
                .font(.footnote)
                .foregroundStyle(.secondary)
                .lineLimit(2)
            }
          }
          .accessibilityElement(children: .combine)
        } else {
          Text("No appointments coming up.")
            .foregroundStyle(.secondary)
        }
      }

      if let updated = parseISODate(context.updatedAt), !Calendar.current.isDateInToday(updated) {
        Text("Open Prism on your iPhone to bring this up to date.")
          .font(.footnote)
          .foregroundStyle(.secondary)
          .listRowBackground(Color.clear)
      }
    }
  }
}

private struct OpenOnPhoneView: View {
  var body: some View {
    VStack(spacing: 8) {
      Image(systemName: "iphone")
        .font(.title2)
        .foregroundStyle(Color.accentColor)
      Text("Open Prism on your iPhone and sign in to see your day here.")
        .multilineTextAlignment(.center)
        .font(.footnote)
    }
    .padding()
  }
}

func timeText(_ date: Date?) -> String {
  guard let date else { return "" }
  return date.formatted(date: .omitted, time: .shortened)
}

func dayAndTimeText(_ date: Date?) -> String {
  guard let date else { return "" }
  if Calendar.current.isDateInToday(date) { return "Today, \(timeText(date))" }
  if Calendar.current.isDateInTomorrow(date) { return "Tomorrow, \(timeText(date))" }
  return date.formatted(.dateTime.weekday(.abbreviated).month(.abbreviated).day().hour().minute())
}
