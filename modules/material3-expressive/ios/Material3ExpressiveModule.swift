import ExpoModulesCore
import UIKit
import SwiftUI

public class Material3ExpressiveModule: Module {
    public func definition() -> ModuleDefinition {
        Name("Material3Expressive")

        // Event for real-time settings changes
        Events("onSettingsChange")

        // Function to show date picker
        AsyncFunction("showDatePicker") { (options: [String: Any], promise: Promise) in
            DispatchQueue.main.async {
                self.showDatePicker(options: options, promise: promise)
            }
        }

        // Function to show selection list bottom sheet
        AsyncFunction("showSelectionSheet") { (options: [String: Any], promise: Promise) in
            DispatchQueue.main.async {
                self.showSelectionSheet(options: options, promise: promise)
            }
        }

        // Function to show settings bottom sheet
        AsyncFunction("showSettingsSheet") { (options: [String: Any], promise: Promise) in
            DispatchQueue.main.async {
                self.showSettingsSheet(options: options, promise: promise)
            }
        }

        // Function to show task creation bottom sheet
        AsyncFunction("showTaskCreationSheet") { (options: [String: Any], promise: Promise) in
            DispatchQueue.main.async {
                self.showTaskCreationSheet(options: options, promise: promise)
            }
        }

        // Function to show folder creation bottom sheet
        AsyncFunction("showFolderCreationSheet") { (promise: Promise) in
            DispatchQueue.main.async {
                self.showFolderCreationSheet(promise: promise)
            }
        }
    }

    // MARK: - Date Picker

    private func showDatePicker(options: [String: Any], promise: Promise) {
        guard let viewController = UIApplication.shared.keyWindow?.rootViewController?.topMostViewController() else {
            promise.resolve(["cancelled": true])
            return
        }

        let initialDate: Date
        if let millis = options["selectedDate"] as? Double {
            initialDate = Date(timeIntervalSince1970: millis / 1000)
        } else {
            initialDate = Date()
        }

        let title = options["title"] as? String ?? "Select date"

        let hostingController = UIHostingController(rootView: DatePickerSheet(
            initialDate: initialDate,
            title: title,
            onSelect: { selectedDate in
                viewController.dismiss(animated: true) {
                    let millis = selectedDate.timeIntervalSince1970 * 1000
                    promise.resolve(["cancelled": false, "dateMillis": millis])
                }
            },
            onCancel: {
                viewController.dismiss(animated: true) {
                    promise.resolve(["cancelled": true])
                }
            }
        ))

        configureSheet(hostingController, detents: [.medium(), .large()])
        viewController.present(hostingController, animated: true)
    }

    // MARK: - Selection Sheet

    private func showSelectionSheet(options: [String: Any], promise: Promise) {
        guard let viewController = UIApplication.shared.keyWindow?.rootViewController?.topMostViewController() else {
            promise.resolve(["cancelled": true])
            return
        }

        let title = options["title"] as? String ?? "Select"
        let subtitle = options["subtitle"] as? String

        var items: [SelectionItem] = []
        if let itemsRaw = options["items"] as? [[String: Any]] {
            items = itemsRaw.map { item in
                SelectionItem(
                    id: item["id"] as? String ?? "",
                    title: item["title"] as? String ?? "",
                    icon: item["icon"] as? String,
                    subtitle: item["subtitle"] as? String
                )
            }
        }

        let hostingController = UIHostingController(rootView: SelectionSheet(
            title: title,
            subtitle: subtitle,
            items: items,
            onSelect: { item, index in
                viewController.dismiss(animated: true) {
                    promise.resolve([
                        "cancelled": false,
                        "selectedId": item.id,
                        "selectedIndex": index,
                        "selectedTitle": item.title
                    ])
                }
            },
            onCancel: {
                viewController.dismiss(animated: true) {
                    promise.resolve(["cancelled": true])
                }
            }
        ))

        configureSheet(hostingController, detents: [.medium(), .large()])
        viewController.present(hostingController, animated: true)
    }

    // MARK: - Settings Sheet

    private func showSettingsSheet(options: [String: Any], promise: Promise) {
        guard let viewController = UIApplication.shared.keyWindow?.rootViewController?.topMostViewController() else {
            promise.resolve(["cancelled": true])
            return
        }

        let title = options["title"] as? String ?? "Settings"

        var toggles: [SettingsToggleItem] = []
        if let togglesRaw = options["toggles"] as? [[String: Any]] {
            toggles = togglesRaw.map { toggle in
                SettingsToggleItem(
                    id: toggle["id"] as? String ?? "",
                    title: toggle["title"] as? String ?? "",
                    icon: toggle["icon"] as? String,
                    value: toggle["value"] as? Bool ?? false
                )
            }
        }

        var dropdowns: [SettingsDropdownItem] = []
        if let dropdownsRaw = options["dropdowns"] as? [[String: Any]] {
            dropdowns = dropdownsRaw.map { dropdown in
                SettingsDropdownItem(
                    id: dropdown["id"] as? String ?? "",
                    title: dropdown["title"] as? String ?? "",
                    icon: dropdown["icon"] as? String,
                    options: dropdown["options"] as? [String] ?? [],
                    selectedIndex: dropdown["selectedIndex"] as? Int ?? 0
                )
            }
        }

        let hostingController = UIHostingController(rootView: SettingsSheet(
            title: title,
            toggles: toggles,
            dropdowns: dropdowns,
            onSettingsChange: { changeData in
                self.sendEvent("onSettingsChange", changeData)
            },
            onDismiss: { finalToggles, finalDropdowns in
                viewController.dismiss(animated: true) {
                    promise.resolve([
                        "cancelled": false,
                        "toggles": finalToggles,
                        "dropdowns": finalDropdowns
                    ])
                }
            }
        ))

        configureSheet(hostingController, detents: [.medium()])
        viewController.present(hostingController, animated: true)
    }

    // MARK: - Task Creation Sheet

    private func showTaskCreationSheet(options: [String: Any], promise: Promise) {
        guard let viewController = UIApplication.shared.keyWindow?.rootViewController?.topMostViewController() else {
            promise.resolve(["cancelled": true])
            return
        }

        let folders = options["folders"] as? [String] ?? ["Inbox"]
        let selectedFolderIndex = options["selectedFolderIndex"] as? Int ?? 0

        let hostingController = UIHostingController(rootView: TaskCreationSheet(
            folders: folders,
            selectedFolderIndex: selectedFolderIndex,
            onSubmit: { taskName, folderIndex, dueDateMillis in
                viewController.dismiss(animated: true) {
                    var result: [String: Any] = [
                        "cancelled": false,
                        "taskName": taskName,
                        "folderIndex": folderIndex
                    ]
                    if let millis = dueDateMillis {
                        result["dueDateMillis"] = millis
                    }
                    promise.resolve(result)
                }
            },
            onCancel: {
                viewController.dismiss(animated: true) {
                    promise.resolve(["cancelled": true])
                }
            }
        ))

        configureSheet(hostingController, detents: [.medium()])
        viewController.present(hostingController, animated: true)
    }

    // MARK: - Folder Creation Sheet

    private func showFolderCreationSheet(promise: Promise) {
        guard let viewController = UIApplication.shared.keyWindow?.rootViewController?.topMostViewController() else {
            promise.resolve(["cancelled": true])
            return
        }

        let hostingController = UIHostingController(rootView: FolderCreationSheet(
            onSubmit: { folderName, icon in
                viewController.dismiss(animated: true) {
                    promise.resolve([
                        "cancelled": false,
                        "folderName": folderName,
                        "icon": icon
                    ])
                }
            },
            onCancel: {
                viewController.dismiss(animated: true) {
                    promise.resolve(["cancelled": true])
                }
            }
        ))

        configureSheet(hostingController, detents: [.medium()])
        viewController.present(hostingController, animated: true)
    }

    // MARK: - Helper Methods

    private func configureSheet(_ controller: UIViewController, detents: [UISheetPresentationController.Detent]) {
        if let sheet = controller.sheetPresentationController {
            sheet.detents = detents
            sheet.prefersGrabberVisible = true
            sheet.prefersScrollingExpandsWhenScrolledToEdge = false
            sheet.preferredCornerRadius = 28
        }
    }
}

// MARK: - UIViewController Extension

extension UIViewController {
    func topMostViewController() -> UIViewController {
        if let presented = self.presentedViewController {
            return presented.topMostViewController()
        }
        if let navigation = self as? UINavigationController {
            return navigation.visibleViewController?.topMostViewController() ?? self
        }
        if let tab = self as? UITabBarController {
            return tab.selectedViewController?.topMostViewController() ?? self
        }
        return self
    }
}

// MARK: - UIApplication Extension for keyWindow

extension UIApplication {
    var keyWindow: UIWindow? {
        connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .flatMap { $0.windows }
            .first { $0.isKeyWindow }
    }
}
