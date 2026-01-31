import SwiftUI

// MARK: - Data Models

struct SelectionItem: Identifiable {
    let id: String
    let title: String
    let icon: String?
    let subtitle: String?
}

struct SettingsToggleItem: Identifiable {
    let id: String
    let title: String
    let icon: String?
    var value: Bool
}

struct SettingsDropdownItem: Identifiable {
    let id: String
    let title: String
    let icon: String?
    let options: [String]
    var selectedIndex: Int
}

// MARK: - Icon Mapper

struct IconMapper {
    static func systemName(for iconName: String) -> String {
        switch iconName.lowercased() {
        case "inbox": return "tray"
        case "mail", "email": return "envelope"
        case "heart", "favorite": return "heart"
        case "checkbox", "check": return "checkmark.circle"
        case "star": return "star"
        case "bookmark": return "bookmark"
        case "flag": return "flag"
        case "briefcase", "work": return "briefcase"
        case "home": return "house"
        case "cart", "shopping": return "cart"
        case "gift": return "gift"
        case "bulb", "lightbulb": return "lightbulb"
        case "fitness": return "figure.walk"
        case "music": return "music.note"
        case "camera": return "camera"
        case "flight", "airplane": return "airplane"
        case "car": return "car"
        case "restaurant": return "fork.knife"
        case "cafe", "coffee": return "cup.and.saucer"
        case "medical", "health": return "cross.case"
        case "school": return "graduationcap"
        case "library": return "books.vertical"
        case "settings": return "gearshape"
        case "edit": return "pencil"
        case "delete": return "trash"
        case "add": return "plus"
        case "close": return "xmark"
        case "calendar": return "calendar"
        case "time", "timer": return "clock"
        case "person": return "person"
        case "group": return "person.2"
        case "notifications": return "bell"
        case "search": return "magnifyingglass"
        case "info": return "info.circle"
        case "help": return "questionmark.circle"
        case "warning": return "exclamationmark.triangle"
        case "error": return "xmark.circle"
        case "folder": return "folder"
        case "sort": return "arrow.up.arrow.down"
        case "grid": return "square.grid.2x2"
        default: return "folder"
        }
    }
}

// MARK: - Date Picker Sheet

struct DatePickerSheet: View {
    let initialDate: Date
    let title: String
    let onSelect: (Date) -> Void
    let onCancel: () -> Void

    @State private var selectedDate: Date

    init(initialDate: Date, title: String, onSelect: @escaping (Date) -> Void, onCancel: @escaping () -> Void) {
        self.initialDate = initialDate
        self.title = title
        self.onSelect = onSelect
        self.onCancel = onCancel
        _selectedDate = State(initialValue: initialDate)
    }

    var body: some View {
        NavigationView {
            VStack {
                DatePicker(
                    title,
                    selection: $selectedDate,
                    displayedComponents: .date
                )
                .datePickerStyle(.graphical)
                .padding()

                Spacer()
            }
            .navigationTitle(title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        onCancel()
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") {
                        onSelect(selectedDate)
                    }
                    .font(.body.bold())
                }
            }
        }
    }
}

// MARK: - Selection Sheet

struct SelectionSheet: View {
    let title: String
    let subtitle: String?
    let items: [SelectionItem]
    let onSelect: (SelectionItem, Int) -> Void
    let onCancel: () -> Void

    var body: some View {
        NavigationView {
            List {
                if let subtitle = subtitle {
                    Section {
                        Text(subtitle)
                            .foregroundColor(.secondary)
                            .font(.subheadline)
                    }
                }

                Section {
                    ForEach(Array(items.enumerated()), id: \.element.id) { index, item in
                        Button(action: {
                            onSelect(item, index)
                        }) {
                            HStack(spacing: 12) {
                                if let iconName = item.icon {
                                    Image(systemName: IconMapper.systemName(for: iconName))
                                        .foregroundColor(.primary)
                                        .frame(width: 24)
                                }

                                VStack(alignment: .leading, spacing: 2) {
                                    Text(item.title)
                                        .foregroundColor(.primary)

                                    if let subtitle = item.subtitle {
                                        Text(subtitle)
                                            .font(.caption)
                                            .foregroundColor(.secondary)
                                    }
                                }

                                Spacer()

                                Image(systemName: "chevron.right")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                    }
                }
            }
            .listStyle(.insetGrouped)
            .navigationTitle(title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        onCancel()
                    }
                }
            }
        }
    }
}

// MARK: - Settings Sheet

struct SettingsSheet: View {
    let title: String
    let toggles: [SettingsToggleItem]
    let dropdowns: [SettingsDropdownItem]
    let onSettingsChange: ([String: Any]) -> Void
    let onDismiss: ([String: Bool], [String: Int]) -> Void

    @State private var toggleStates: [String: Bool]
    @State private var dropdownStates: [String: Int]
    @Environment(\.dismiss) private var dismiss

    init(
        title: String,
        toggles: [SettingsToggleItem],
        dropdowns: [SettingsDropdownItem],
        onSettingsChange: @escaping ([String: Any]) -> Void,
        onDismiss: @escaping ([String: Bool], [String: Int]) -> Void
    ) {
        self.title = title
        self.toggles = toggles
        self.dropdowns = dropdowns
        self.onSettingsChange = onSettingsChange
        self.onDismiss = onDismiss

        var initialToggles: [String: Bool] = [:]
        for toggle in toggles {
            initialToggles[toggle.id] = toggle.value
        }
        _toggleStates = State(initialValue: initialToggles)

        var initialDropdowns: [String: Int] = [:]
        for dropdown in dropdowns {
            initialDropdowns[dropdown.id] = dropdown.selectedIndex
        }
        _dropdownStates = State(initialValue: initialDropdowns)
    }

    var body: some View {
        VStack(spacing: 0) {
            // Header with Cancel, Title, Done buttons
            HStack {
                Button(action: {
                    onDismiss(toggleStates, dropdownStates)
                }) {
                    Text("Cancel")
                        .font(.subheadline)
                        .foregroundColor(.primary)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(Color(.systemGray6))
                        .clipShape(Capsule())
                }

                Spacer()

                Text("View Settings")
                    .font(.headline)

                Spacer()

                Button(action: {
                    onDismiss(toggleStates, dropdownStates)
                }) {
                    Text("Done")
                        .font(.subheadline.bold())
                        .foregroundColor(.primary)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(Color(.systemGray6))
                        .clipShape(Capsule())
                }
            }
            .padding(.horizontal, 20)
            .padding(.top, 16)
            .padding(.bottom, 20)

            ScrollView {
                VStack(spacing: 16) {
                    // Toggles card
                    if !toggles.isEmpty {
                        VStack(spacing: 0) {
                            ForEach(Array(toggles.enumerated()), id: \.element.id) { index, toggle in
                                HStack {
                                    if let iconName = toggle.icon {
                                        Image(systemName: IconMapper.systemName(for: iconName))
                                            .foregroundColor(.primary)
                                            .frame(width: 24)
                                    }

                                    Text(toggle.title)
                                        .font(.body)

                                    Spacer()

                                    Toggle("", isOn: Binding(
                                        get: { toggleStates[toggle.id] ?? toggle.value },
                                        set: { newValue in
                                            toggleStates[toggle.id] = newValue
                                            onSettingsChange([
                                                "type": "toggle",
                                                "id": toggle.id,
                                                "value": newValue
                                            ])
                                        }
                                    ))
                                    .labelsHidden()
                                }
                                .padding(.horizontal, 16)
                                .padding(.vertical, 14)

                                if index < toggles.count - 1 {
                                    Divider()
                                        .padding(.leading, 56)
                                }
                            }
                        }
                        .background(Color.white)
                        .cornerRadius(16)
                        .padding(.horizontal, 20)
                    }

                    // Dropdowns
                    ForEach(dropdowns) { dropdown in
                        VStack(spacing: 0) {
                            HStack {
                                if let iconName = dropdown.icon {
                                    Image(systemName: IconMapper.systemName(for: iconName))
                                        .foregroundColor(.primary)
                                        .frame(width: 24)
                                }

                                Text(dropdown.title)
                                    .font(.body)

                                Spacer()

                                Picker("", selection: Binding(
                                    get: { dropdownStates[dropdown.id] ?? dropdown.selectedIndex },
                                    set: { newValue in
                                        dropdownStates[dropdown.id] = newValue
                                        onSettingsChange([
                                            "type": "dropdown",
                                            "id": dropdown.id,
                                            "value": newValue
                                        ])
                                    }
                                )) {
                                    ForEach(Array(dropdown.options.enumerated()), id: \.offset) { index, option in
                                        Text(option).tag(index)
                                    }
                                }
                                .pickerStyle(.menu)
                            }
                            .padding(.horizontal, 16)
                            .padding(.vertical, 14)
                        }
                        .background(Color.white)
                        .cornerRadius(16)
                        .padding(.horizontal, 20)
                    }
                }
                .padding(.bottom, 20)
            }
        }
        .background(Color(.systemGroupedBackground))
    }
}

// MARK: - Task Creation Sheet

struct TaskCreationSheet: View {
    let folders: [String]
    let selectedFolderIndex: Int
    let onSubmit: (String, Int, Double?) -> Void
    let onCancel: () -> Void

    @State private var taskName: String = ""
    @State private var folderIndex: Int
    @State private var selectedDate: Date = Date()
    @State private var hasSelectedDate: Bool = false
    @State private var showDatePicker: Bool = false
    @FocusState private var isTextFieldFocused: Bool

    init(
        folders: [String],
        selectedFolderIndex: Int,
        onSubmit: @escaping (String, Int, Double?) -> Void,
        onCancel: @escaping () -> Void
    ) {
        self.folders = folders
        self.selectedFolderIndex = selectedFolderIndex
        self.onSubmit = onSubmit
        self.onCancel = onCancel
        _folderIndex = State(initialValue: selectedFolderIndex)
    }

    private func iconForFolder(_ name: String) -> String {
        switch name.lowercased() {
        case "inbox": return "tray"
        case "today": return "calendar"
        case "important": return "heart"
        case "rewards": return "trophy"
        default: return "folder"
        }
    }

    private var dateText: String {
        if !hasSelectedDate {
            return "Today"
        }

        let calendar = Calendar.current
        if calendar.isDateInToday(selectedDate) {
            return "Today"
        }

        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d"
        return formatter.string(from: selectedDate)
    }

    var body: some View {
        GlassSheetContent {
            VStack(spacing: 16) {
                // Task name input row with checkmark in same row
                HStack(spacing: 12) {
                    TextField("Task title", text: $taskName)
                        .textFieldStyle(.plain)
                        .font(.body)
                        .focused($isTextFieldFocused)
                        .submitLabel(.done)
                        .onSubmit {
                            submitIfValid()
                        }

                    Button(action: submitIfValid) {
                        Image(systemName: "checkmark")
                            .font(.body.bold())
                            .foregroundColor(taskName.trimmingCharacters(in: .whitespaces).isEmpty ? .secondary : .white)
                            .frame(width: 36, height: 36)
                            .background(taskName.trimmingCharacters(in: .whitespaces).isEmpty ? Color(.systemGray5) : Color(.label))
                            .clipShape(Circle())
                    }
                    .disabled(taskName.trimmingCharacters(in: .whitespaces).isEmpty)
                }
                .padding(.horizontal, 20)

                // Folder chips - horizontal scroll
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(Array(folders.enumerated()), id: \.offset) { index, folder in
                            Button(action: {
                                folderIndex = index
                            }) {
                                HStack(spacing: 6) {
                                    Image(systemName: iconForFolder(folder))
                                        .font(.subheadline)
                                    Text(folder)
                                        .font(.subheadline)
                                }
                                .padding(.horizontal, 14)
                                .padding(.vertical, 10)
                                .background(Color.white)
                                .foregroundColor(index == folderIndex ? .primary : .secondary)
                                .overlay(
                                    Capsule()
                                        .stroke(index == folderIndex ? Color(.label) : Color(.systemGray4), lineWidth: index == folderIndex ? 1.5 : 1)
                                )
                                .clipShape(Capsule())
                            }
                        }
                    }
                    .padding(.horizontal, 20)
                }

                Spacer()
            }
            .padding(.top, 20)
        }
        .sheet(isPresented: $showDatePicker) {
            DatePickerSheet(
                initialDate: selectedDate,
                title: "Due Date",
                onSelect: { date in
                    selectedDate = date
                    hasSelectedDate = true
                    showDatePicker = false
                },
                onCancel: {
                    showDatePicker = false
                }
            )
            .presentationDetents([.medium])
        }
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                isTextFieldFocused = true
            }
        }
    }

    private func submitIfValid() {
        let trimmedName = taskName.trimmingCharacters(in: .whitespaces)
        guard !trimmedName.isEmpty else { return }

        let dueDateMillis: Double? = hasSelectedDate ? selectedDate.timeIntervalSince1970 * 1000 : nil
        onSubmit(trimmedName, folderIndex, dueDateMillis)
    }
}

// MARK: - Folder Creation Sheet

struct FolderCreationSheet: View {
    let onSubmit: (String, String) -> Void
    let onCancel: () -> Void

    @State private var folderName: String = ""
    @State private var selectedIcon: String = "folder"
    @FocusState private var isTextFieldFocused: Bool

    var body: some View {
        GlassSheetContent {
            VStack(spacing: 16) {
                // Folder name input row with icon and checkmark
                HStack(spacing: 12) {
                    // Folder icon
                    Image(systemName: "folder")
                        .font(.title2)
                        .foregroundColor(.secondary)

                    TextField("Folder title", text: $folderName)
                        .textFieldStyle(.plain)
                        .font(.body)
                        .focused($isTextFieldFocused)
                        .submitLabel(.done)
                        .onSubmit {
                            submitIfValid()
                        }

                    Button(action: submitIfValid) {
                        Image(systemName: "checkmark")
                            .font(.body.bold())
                            .foregroundColor(folderName.trimmingCharacters(in: .whitespaces).isEmpty ? .secondary : .white)
                            .frame(width: 36, height: 36)
                            .background(folderName.trimmingCharacters(in: .whitespaces).isEmpty ? Color(.systemGray5) : Color(.label))
                            .clipShape(Circle())
                    }
                    .disabled(folderName.trimmingCharacters(in: .whitespaces).isEmpty)
                }
                .padding(.horizontal, 20)

                Spacer()
            }
            .padding(.top, 20)
        }
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                isTextFieldFocused = true
            }
        }
    }

    private func submitIfValid() {
        let trimmedName = folderName.trimmingCharacters(in: .whitespaces)
        guard !trimmedName.isEmpty else { return }
        onSubmit(trimmedName, selectedIcon)
    }
}

// MARK: - Array Safe Subscript Extension

extension Array {
    subscript(safe index: Index) -> Element? {
        return indices.contains(index) ? self[index] : nil
    }
}

// MARK: - Liquid Glass Background Modifier

extension View {
    @ViewBuilder
    func liquidGlassBackground() -> some View {
        if #available(iOS 26.0, *) {
            self
                .background(.clear)
                .glassEffect(.regular)
        } else {
            self
                .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 28))
        }
    }

    @ViewBuilder
    func sheetGlassBackground() -> some View {
        if #available(iOS 26.0, *) {
            self
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .glassEffect(.regular)
        } else {
            self
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(.ultraThinMaterial)
        }
    }
}

// MARK: - Glass Effect Sheet Wrapper

struct GlassSheetContent<Content: View>: View {
    let content: Content

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        if #available(iOS 26.0, *) {
            content
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .glassEffect(.regular)
        } else {
            content
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(.ultraThinMaterial)
        }
    }
}
