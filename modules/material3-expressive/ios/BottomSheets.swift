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
                    .fontWeight(.semibold)
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
        NavigationView {
            List {
                if !toggles.isEmpty {
                    Section {
                        ForEach(toggles) { toggle in
                            HStack {
                                if let iconName = toggle.icon {
                                    Image(systemName: IconMapper.systemName(for: iconName))
                                        .foregroundColor(.primary)
                                        .frame(width: 24)
                                }

                                Text(toggle.title)

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
                        }
                    }
                }

                ForEach(dropdowns) { dropdown in
                    Section {
                        HStack {
                            if let iconName = dropdown.icon {
                                Image(systemName: IconMapper.systemName(for: iconName))
                                    .foregroundColor(.primary)
                                    .frame(width: 24)
                            }

                            Text(dropdown.title)

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
                    }
                }
            }
            .listStyle(.insetGrouped)
            .navigationTitle(title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") {
                        onDismiss(toggleStates, dropdownStates)
                    }
                    .fontWeight(.semibold)
                }
            }
        }
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
        NavigationView {
            VStack(spacing: 16) {
                // Task name input
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
                            .fontWeight(.semibold)
                            .foregroundColor(taskName.trimmingCharacters(in: .whitespaces).isEmpty ? .secondary : .white)
                            .frame(width: 36, height: 36)
                            .background(taskName.trimmingCharacters(in: .whitespaces).isEmpty ? Color(.systemGray5) : Color.accentColor)
                            .clipShape(Circle())
                    }
                    .disabled(taskName.trimmingCharacters(in: .whitespaces).isEmpty)
                }
                .padding(.horizontal)

                // Folder and date chips
                HStack(spacing: 8) {
                    // Folder picker
                    Menu {
                        ForEach(Array(folders.enumerated()), id: \.offset) { index, folder in
                            Button(action: {
                                folderIndex = index
                            }) {
                                Label(folder, systemImage: iconForFolder(folder))
                                if index == folderIndex {
                                    Image(systemName: "checkmark")
                                }
                            }
                        }
                    } label: {
                        HStack(spacing: 6) {
                            Image(systemName: iconForFolder(folders[safe: folderIndex] ?? "Inbox"))
                                .font(.caption)
                            Text(folders[safe: folderIndex] ?? "Inbox")
                                .font(.subheadline)
                            Image(systemName: "chevron.down")
                                .font(.caption2)
                        }
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(Color.accentColor.opacity(0.15))
                        .foregroundColor(.accentColor)
                        .clipShape(Capsule())
                    }

                    // Date picker
                    Button(action: {
                        showDatePicker = true
                    }) {
                        HStack(spacing: 6) {
                            Image(systemName: "calendar")
                                .font(.caption)
                            Text(dateText)
                                .font(.subheadline)
                        }
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .background(hasSelectedDate ? Color.accentColor.opacity(0.15) : Color(.systemGray5))
                        .foregroundColor(hasSelectedDate ? .accentColor : .primary)
                        .clipShape(Capsule())
                    }

                    Spacer()
                }
                .padding(.horizontal)

                Spacer()
            }
            .padding(.top)
            .navigationTitle("New Task")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        onCancel()
                    }
                }
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
    @State private var showIconPicker: Bool = false
    @FocusState private var isTextFieldFocused: Bool

    private let availableIcons = [
        "folder", "heart", "star", "bookmark", "flag",
        "briefcase", "home", "cart", "gift", "lightbulb",
        "fitness", "music"
    ]

    var body: some View {
        NavigationView {
            VStack(spacing: 16) {
                // Folder name input row
                HStack(spacing: 12) {
                    // Icon button
                    Button(action: {
                        withAnimation {
                            showIconPicker.toggle()
                        }
                    }) {
                        Image(systemName: IconMapper.systemName(for: selectedIcon))
                            .font(.title2)
                            .foregroundColor(.secondary)
                            .frame(width: 44, height: 44)
                            .background(Color(.systemGray6))
                            .clipShape(RoundedRectangle(cornerRadius: 10))
                    }

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
                            .fontWeight(.semibold)
                            .foregroundColor(folderName.trimmingCharacters(in: .whitespaces).isEmpty ? .secondary : .white)
                            .frame(width: 36, height: 36)
                            .background(folderName.trimmingCharacters(in: .whitespaces).isEmpty ? Color(.systemGray5) : Color.accentColor)
                            .clipShape(Circle())
                    }
                    .disabled(folderName.trimmingCharacters(in: .whitespaces).isEmpty)
                }
                .padding(.horizontal)

                // Icon picker grid
                if showIconPicker {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(availableIcons, id: \.self) { iconName in
                                Button(action: {
                                    selectedIcon = iconName
                                    withAnimation {
                                        showIconPicker = false
                                    }
                                }) {
                                    Image(systemName: IconMapper.systemName(for: iconName))
                                        .font(.title3)
                                        .foregroundColor(selectedIcon == iconName ? .accentColor : .secondary)
                                        .frame(width: 48, height: 48)
                                        .background(selectedIcon == iconName ? Color.accentColor.opacity(0.15) : Color(.systemGray6))
                                        .clipShape(RoundedRectangle(cornerRadius: 12))
                                }
                            }
                        }
                        .padding(.horizontal)
                    }
                    .transition(.move(edge: .top).combined(with: .opacity))
                }

                Spacer()
            }
            .padding(.top)
            .navigationTitle("New Folder")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        onCancel()
                    }
                }
            }
            .onAppear {
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                    isTextFieldFocused = true
                }
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
