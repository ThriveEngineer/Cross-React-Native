package expo.modules.material3expressive

import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.window.DialogProperties
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.view.ViewGroup
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.setViewTreeLifecycleOwner
import androidx.savedstate.setViewTreeSavedStateRegistryOwner
import androidx.activity.ComponentActivity

class Material3ExpressiveModule : Module() {
    // Flag to track if Compose has been pre-warmed
    private var composePreWarmed = false

    override fun definition() = ModuleDefinition {
        Name("Material3Expressive")

        // Event for real-time settings changes
        Events("onSettingsChange")

        // Pre-warm Compose infrastructure on module load for faster first sheet
        OnCreate {
            val activity = appContext.currentActivity as? ComponentActivity
            activity?.runOnUiThread {
                preWarmCompose(activity)
            }
        }

        // Function to show M3 Date Picker Dialog
        AsyncFunction("showDatePicker") { options: Map<String, Any?>, promise: Promise ->
            val activity = appContext.currentActivity as? ComponentActivity
            if (activity == null) {
                promise.reject("E_NO_ACTIVITY", "No activity available", null)
                return@AsyncFunction
            }

            val initialDate = (options["selectedDate"] as? Number)?.toLong() ?: System.currentTimeMillis()
            val title = options["title"] as? String ?: "Select date"

            activity.runOnUiThread {
                showM3DatePickerDialog(activity, initialDate, title, promise)
            }
        }

        // Function to show selection list bottom sheet
        AsyncFunction("showSelectionSheet") { options: Map<String, Any?>, promise: Promise ->
            val activity = appContext.currentActivity as? ComponentActivity
            if (activity == null) {
                promise.reject("E_NO_ACTIVITY", "No activity available", null)
                return@AsyncFunction
            }

            val title = options["title"] as? String ?: "Select"
            val subtitle = options["subtitle"] as? String
            @Suppress("UNCHECKED_CAST")
            val itemsRaw = options["items"] as? List<Map<String, Any?>> ?: emptyList()

            val items = itemsRaw.map { item ->
                ListItem(
                    id = item["id"] as? String ?: "",
                    title = item["title"] as? String ?: "",
                    icon = item["icon"] as? String,
                    subtitle = item["subtitle"] as? String
                )
            }

            activity.runOnUiThread {
                showSelectionSheet(activity, title, subtitle, items, promise)
            }
        }

        // Function to show settings bottom sheet
        AsyncFunction("showSettingsSheet") { options: Map<String, Any?>, promise: Promise ->
            val activity = appContext.currentActivity as? ComponentActivity
            if (activity == null) {
                promise.reject("E_NO_ACTIVITY", "No activity available", null)
                return@AsyncFunction
            }

            val title = options["title"] as? String ?: "Settings"
            @Suppress("UNCHECKED_CAST")
            val togglesRaw = options["toggles"] as? List<Map<String, Any?>> ?: emptyList()
            @Suppress("UNCHECKED_CAST")
            val dropdownsRaw = options["dropdowns"] as? List<Map<String, Any?>> ?: emptyList()

            val toggles = togglesRaw.map { toggle ->
                SettingsToggle(
                    id = toggle["id"] as? String ?: "",
                    title = toggle["title"] as? String ?: "",
                    icon = toggle["icon"] as? String,
                    value = toggle["value"] as? Boolean ?: false
                )
            }

            val dropdowns = dropdownsRaw.map { dropdown ->
                @Suppress("UNCHECKED_CAST")
                SettingsDropdown(
                    id = dropdown["id"] as? String ?: "",
                    title = dropdown["title"] as? String ?: "",
                    icon = dropdown["icon"] as? String,
                    options = (dropdown["options"] as? List<String>) ?: emptyList(),
                    selectedIndex = (dropdown["selectedIndex"] as? Number)?.toInt() ?: 0
                )
            }

            // Callback to emit events when settings change in real-time
            val onSettingsChange: (Map<String, Any?>) -> Unit = { changeData ->
                this@Material3ExpressiveModule.sendEvent("onSettingsChange", changeData)
            }

            activity.runOnUiThread {
                showSettingsSheet(activity, title, toggles, dropdowns, promise, onSettingsChange)
            }
        }

        // Function to show task creation bottom sheet
        AsyncFunction("showTaskCreationSheet") { options: Map<String, Any?>, promise: Promise ->
            val activity = appContext.currentActivity as? ComponentActivity
            if (activity == null) {
                promise.reject("E_NO_ACTIVITY", "No activity available", null)
                return@AsyncFunction
            }

            @Suppress("UNCHECKED_CAST")
            val folders = (options["folders"] as? List<String>) ?: listOf("Inbox")
            val selectedFolderIndex = (options["selectedFolderIndex"] as? Number)?.toInt() ?: 0

            activity.runOnUiThread {
                showTaskCreationSheet(activity, folders, selectedFolderIndex, promise)
            }
        }

        // Function to show folder creation bottom sheet
        AsyncFunction("showFolderCreationSheet") { promise: Promise ->
            val activity = appContext.currentActivity as? ComponentActivity
            if (activity == null) {
                promise.reject("E_NO_ACTIVITY", "No activity available", null)
                return@AsyncFunction
            }

            activity.runOnUiThread {
                showFolderCreationSheet(activity, promise)
            }
        }

        // M3 Expressive Button View
        View(M3ExpressiveButton::class) {
            Prop("label") { view: M3ExpressiveButton, label: String ->
                view.setLabel(label)
            }
            Prop("variant") { view: M3ExpressiveButton, variant: String ->
                view.setVariant(variant)
            }
            Prop("enabled") { view: M3ExpressiveButton, enabled: Boolean ->
                view.setButtonEnabled(enabled)
            }
        }

        // M3 Expressive Card View
        View(M3ExpressiveCard::class) {
            Prop("variant") { view: M3ExpressiveCard, variant: String ->
                view.setVariant(variant)
            }
        }

        // M3 Expressive FAB View
        View(M3ExpressiveFAB::class) {
            Prop("icon") { view: M3ExpressiveFAB, icon: String ->
                view.setIcon(icon)
            }
            Prop("label") { view: M3ExpressiveFAB, label: String? ->
                view.setLabel(label)
            }
            Prop("expanded") { view: M3ExpressiveFAB, expanded: Boolean ->
                view.setExpanded(expanded)
            }
        }

        // M3 Expressive Loading Indicator
        View(M3ExpressiveLoadingIndicator::class) {
            Prop("variant") { view: M3ExpressiveLoadingIndicator, variant: String ->
                view.setVariant(variant)
            }
            Prop("progress") { view: M3ExpressiveLoadingIndicator, progress: Float? ->
                view.setProgress(progress)
            }
        }

        // M3 Expressive Switch
        View(M3ExpressiveSwitch::class) {
            Prop("value") { view: M3ExpressiveSwitch, value: Boolean ->
                view.setValue(value)
            }
            Prop("enabled") { view: M3ExpressiveSwitch, enabled: Boolean ->
                view.setSwitchEnabled(enabled)
            }
            Events("onValueChange")
        }

        // M3 Expressive Bottom Sheet
        View(M3ExpressiveBottomSheet::class) {
            Prop("visible") { view: M3ExpressiveBottomSheet, visible: Boolean ->
                view.setVisible(visible)
            }
            Prop("title") { view: M3ExpressiveBottomSheet, title: String? ->
                view.setTitle(title)
            }
            Events("onDismiss")
        }

        // M3 Expressive Dropdown Menu
        View(M3ExpressiveDropdownMenu::class) {
            Prop("options") { view: M3ExpressiveDropdownMenu, options: List<String> ->
                view.setOptions(options)
            }
            Prop("selectedIndex") { view: M3ExpressiveDropdownMenu, index: Int ->
                view.setSelectedIndex(index)
            }
            Prop("label") { view: M3ExpressiveDropdownMenu, label: String ->
                view.setLabel(label)
            }
            Events("onSelectionChange")
        }

        // M3 Expressive Date Picker
        View(M3ExpressiveDatePicker::class) {
            Prop("visible") { view: M3ExpressiveDatePicker, visible: Boolean ->
                view.setShowPicker(visible)
            }
            Prop("selectedDate") { view: M3ExpressiveDatePicker, millis: Long? ->
                view.setSelectedDate(millis)
            }
            Prop("title") { view: M3ExpressiveDatePicker, title: String ->
                view.setTitle(title)
            }
            Events("onDateSelected", "onDismiss")
        }

        // M3 Expressive Navigation Bar
        View(M3ExpressiveNavigationBar::class) {
            Prop("items") { view: M3ExpressiveNavigationBar, items: List<String> ->
                view.setItems(items)
            }
            Prop("selectedIndex") { view: M3ExpressiveNavigationBar, index: Int ->
                view.setSelectedIndex(index)
            }
            Prop("icons") { view: M3ExpressiveNavigationBar, icons: List<String> ->
                view.setIcons(icons)
            }
            Prop("selectedIcons") { view: M3ExpressiveNavigationBar, icons: List<String> ->
                view.setSelectedIcons(icons)
            }
            Events("onItemSelected")
        }
    }

    @OptIn(ExperimentalMaterial3Api::class)
    private fun showM3DatePickerDialog(
        activity: ComponentActivity,
        initialDateMillis: Long,
        title: String,
        promise: Promise
    ) {
        val dialogVisible = mutableStateOf(true)

        val composeView = ComposeView(activity).apply {
            setViewTreeLifecycleOwner(activity)
            setViewTreeSavedStateRegistryOwner(activity)

            setContent {
                Material3ExpressiveTheme {
                    if (dialogVisible.value) {
                        val datePickerState = rememberDatePickerState(
                            initialSelectedDateMillis = initialDateMillis
                        )

                        DatePickerDialog(
                            onDismissRequest = {
                                dialogVisible.value = false
                                promise.resolve(mapOf("cancelled" to true))
                                (parent as? ViewGroup)?.removeView(this@apply)
                            },
                            confirmButton = {
                                TextButton(
                                    onClick = {
                                        dialogVisible.value = false
                                        val selectedMillis = datePickerState.selectedDateMillis
                                        if (selectedMillis != null) {
                                            promise.resolve(mapOf(
                                                "cancelled" to false,
                                                "dateMillis" to selectedMillis
                                            ))
                                        } else {
                                            promise.resolve(mapOf("cancelled" to true))
                                        }
                                        (parent as? ViewGroup)?.removeView(this@apply)
                                    }
                                ) {
                                    Text("OK")
                                }
                            },
                            dismissButton = {
                                TextButton(
                                    onClick = {
                                        dialogVisible.value = false
                                        promise.resolve(mapOf("cancelled" to true))
                                        (parent as? ViewGroup)?.removeView(this@apply)
                                    }
                                ) {
                                    Text("Cancel")
                                }
                            },
                            properties = DialogProperties(usePlatformDefaultWidth = false)
                        ) {
                            DatePicker(
                                state = datePickerState,
                                title = {
                                    Text(
                                        text = title,
                                        modifier = Modifier.padding(start = 24.dp, top = 16.dp)
                                    )
                                }
                            )
                        }
                    }
                }
            }
        }

        // Add to decor view to show above everything
        val decorView = activity.window.decorView as ViewGroup
        decorView.addView(composeView, ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ))
    }

    /**
     * Pre-warms the Compose infrastructure by creating and immediately disposing
     * a minimal ComposeView. This initializes Compose's internal caches and
     * makes subsequent sheet openings significantly faster.
     */
    private fun preWarmCompose(activity: ComponentActivity) {
        if (composePreWarmed) return
        composePreWarmed = true

        try {
            val warmupView = ComposeView(activity).apply {
                setViewTreeLifecycleOwner(activity)
                setViewTreeSavedStateRegistryOwner(activity)

                setContent {
                    Material3ExpressiveTheme {
                        // Minimal composable to trigger Compose initialization
                        Box(modifier = Modifier.size(0.dp))
                    }
                }
            }

            // Add and immediately remove to trigger initialization without showing anything
            val decorView = activity.window.decorView as ViewGroup
            decorView.addView(warmupView, ViewGroup.LayoutParams(0, 0))
            decorView.post {
                decorView.removeView(warmupView)
            }
        } catch (e: Exception) {
            // Silently ignore pre-warming failures
        }
    }
}
