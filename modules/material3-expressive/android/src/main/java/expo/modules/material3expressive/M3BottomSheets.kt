package expo.modules.material3expressive

import androidx.activity.ComponentActivity
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.KeyboardArrowRight
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.setViewTreeLifecycleOwner
import androidx.savedstate.setViewTreeSavedStateRegistryOwner
import android.view.ViewGroup
import expo.modules.kotlin.Promise
import kotlinx.coroutines.delay

// Icon mapping from string names to Material Icons
object IconMapper {
    private val iconMap = mapOf(
        "inbox" to Icons.Outlined.Inbox,
        "mail" to Icons.Outlined.Email,
        "heart" to Icons.Outlined.Favorite,
        "favorite" to Icons.Outlined.Favorite,
        "check" to Icons.Outlined.CheckCircle,
        "checkbox" to Icons.Outlined.CheckBox,
        "folder" to Icons.Outlined.Folder,
        "star" to Icons.Outlined.Star,
        "bookmark" to Icons.Outlined.Bookmark,
        "flag" to Icons.Outlined.Flag,
        "briefcase" to Icons.Outlined.Work,
        "work" to Icons.Outlined.Work,
        "home" to Icons.Outlined.Home,
        "cart" to Icons.Outlined.ShoppingCart,
        "shopping" to Icons.Outlined.ShoppingCart,
        "gift" to Icons.Outlined.CardGiftcard,
        "bulb" to Icons.Outlined.Lightbulb,
        "lightbulb" to Icons.Outlined.Lightbulb,
        "fitness" to Icons.Outlined.FitnessCenter,
        "music" to Icons.Outlined.MusicNote,
        "camera" to Icons.Outlined.CameraAlt,
        "flight" to Icons.Outlined.Flight,
        "airplane" to Icons.Outlined.Flight,
        "car" to Icons.Outlined.DirectionsCar,
        "restaurant" to Icons.Outlined.Restaurant,
        "cafe" to Icons.Outlined.LocalCafe,
        "coffee" to Icons.Outlined.LocalCafe,
        "medical" to Icons.Outlined.LocalHospital,
        "health" to Icons.Outlined.LocalHospital,
        "school" to Icons.Outlined.School,
        "library" to Icons.Outlined.LocalLibrary,
        "settings" to Icons.Outlined.Settings,
        "edit" to Icons.Outlined.Edit,
        "delete" to Icons.Outlined.Delete,
        "add" to Icons.Outlined.Add,
        "close" to Icons.Outlined.Close,
        "calendar" to Icons.Outlined.CalendarToday,
        "time" to Icons.Outlined.Schedule,
        "timer" to Icons.Outlined.Timer,
        "person" to Icons.Outlined.Person,
        "group" to Icons.Outlined.Group,
        "notifications" to Icons.Outlined.Notifications,
        "search" to Icons.Outlined.Search,
        "info" to Icons.Outlined.Info,
        "help" to Icons.Outlined.Help,
        "warning" to Icons.Outlined.Warning,
        "error" to Icons.Outlined.Error,
    )

    fun getIcon(name: String): ImageVector {
        return iconMap[name.lowercase()] ?: Icons.Outlined.Folder
    }
}

// Data classes for sheet content
data class ListItem(
    val id: String,
    val title: String,
    val icon: String? = null,
    val subtitle: String? = null
)

data class SettingsToggle(
    val id: String,
    val title: String,
    val icon: String? = null,
    val value: Boolean
)

data class SettingsDropdown(
    val id: String,
    val title: String,
    val icon: String? = null,
    val options: List<String>,
    val selectedIndex: Int
)

// Result types
sealed class SheetResult {
    data class Selection(val selectedId: String, val selectedIndex: Int) : SheetResult()
    data class Settings(val toggles: Map<String, Boolean>, val dropdowns: Map<String, Int>) : SheetResult()
    data class TaskCreation(
        val taskName: String,
        val folderIndex: Int,
        val dueDateMillis: Long?
    ) : SheetResult()
    object Cancelled : SheetResult()
}

/**
 * Shows a selection list bottom sheet (like folder picker)
 */
@OptIn(ExperimentalMaterial3Api::class)
fun showSelectionSheet(
    activity: ComponentActivity,
    title: String,
    subtitle: String? = null,
    items: List<ListItem>,
    promise: Promise
) {
    val sheetVisible = mutableStateOf(true)

    val composeView = ComposeView(activity).apply {
        setViewTreeLifecycleOwner(activity)
        setViewTreeSavedStateRegistryOwner(activity)

        setContent {
            Material3ExpressiveTheme {
                if (sheetVisible.value) {
                    ModalBottomSheet(
                        onDismissRequest = {
                            sheetVisible.value = false
                            promise.resolve(mapOf("cancelled" to true))
                            (parent as? ViewGroup)?.removeView(this@apply)
                        },
                        dragHandle = { BottomSheetDefaults.DragHandle() }
                    ) {
                        SelectionSheetContent(
                            title = title,
                            subtitle = subtitle,
                            items = items,
                            onItemSelected = { item, index ->
                                sheetVisible.value = false
                                promise.resolve(mapOf(
                                    "cancelled" to false,
                                    "selectedId" to item.id,
                                    "selectedIndex" to index,
                                    "selectedTitle" to item.title
                                ))
                                (parent as? ViewGroup)?.removeView(this@apply)
                            },
                            onCancel = {
                                sheetVisible.value = false
                                promise.resolve(mapOf("cancelled" to true))
                                (parent as? ViewGroup)?.removeView(this@apply)
                            }
                        )
                    }
                }
            }
        }
    }

    val decorView = activity.window.decorView as ViewGroup
    decorView.addView(composeView, ViewGroup.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT
    ))
}

@Composable
private fun SelectionSheetContent(
    title: String,
    subtitle: String?,
    items: List<ListItem>,
    onItemSelected: (ListItem, Int) -> Unit,
    onCancel: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .padding(bottom = 32.dp)
    ) {
        // Title
        Text(
            text = title,
            style = MaterialTheme.typography.titleLarge,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth()
        )

        // Subtitle
        subtitle?.let {
            Text(
                text = it,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 4.dp, bottom = 16.dp)
            )
        } ?: Spacer(modifier = Modifier.height(16.dp))

        // Items list
        LazyColumn(
            modifier = Modifier.heightIn(max = 400.dp)
        ) {
            itemsIndexed(items) { index, item ->
                ListItem(
                    headlineContent = { Text(item.title) },
                    supportingContent = item.subtitle?.let { { Text(it) } },
                    leadingContent = item.icon?.let {
                        { Icon(IconMapper.getIcon(it), contentDescription = null) }
                    },
                    trailingContent = {
                        Icon(
                            Icons.AutoMirrored.Outlined.KeyboardArrowRight,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    },
                    modifier = Modifier.clickable { onItemSelected(item, index) }
                )
                if (index < items.lastIndex) {
                    HorizontalDivider(modifier = Modifier.padding(start = 56.dp))
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Cancel button
        FilledTonalButton(
            onClick = onCancel,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Cancel")
        }
    }
}

/**
 * Shows a settings bottom sheet with toggles and dropdowns
 */
@OptIn(ExperimentalMaterial3Api::class)
fun showSettingsSheet(
    activity: ComponentActivity,
    title: String,
    toggles: List<SettingsToggle>,
    dropdowns: List<SettingsDropdown>,
    promise: Promise
) {
    val sheetVisible = mutableStateOf(true)
    val toggleStates = mutableStateMapOf<String, Boolean>().apply {
        toggles.forEach { put(it.id, it.value) }
    }
    val dropdownStates = mutableStateMapOf<String, Int>().apply {
        dropdowns.forEach { put(it.id, it.selectedIndex) }
    }

    val composeView = ComposeView(activity).apply {
        setViewTreeLifecycleOwner(activity)
        setViewTreeSavedStateRegistryOwner(activity)

        setContent {
            Material3ExpressiveTheme {
                if (sheetVisible.value) {
                    ModalBottomSheet(
                        onDismissRequest = {
                            sheetVisible.value = false
                            promise.resolve(mapOf(
                                "cancelled" to false,
                                "toggles" to toggleStates.toMap(),
                                "dropdowns" to dropdownStates.toMap()
                            ))
                            (parent as? ViewGroup)?.removeView(this@apply)
                        },
                        dragHandle = { BottomSheetDefaults.DragHandle() }
                    ) {
                        SettingsSheetContent(
                            title = title,
                            toggles = toggles,
                            toggleStates = toggleStates,
                            dropdowns = dropdowns,
                            dropdownStates = dropdownStates,
                            onToggleChange = { id, value -> toggleStates[id] = value },
                            onDropdownChange = { id, index -> dropdownStates[id] = index }
                        )
                    }
                }
            }
        }
    }

    val decorView = activity.window.decorView as ViewGroup
    decorView.addView(composeView, ViewGroup.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT
    ))
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun SettingsSheetContent(
    title: String,
    toggles: List<SettingsToggle>,
    toggleStates: Map<String, Boolean>,
    dropdowns: List<SettingsDropdown>,
    dropdownStates: Map<String, Int>,
    onToggleChange: (String, Boolean) -> Unit,
    onDropdownChange: (String, Int) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .padding(bottom = 32.dp)
    ) {
        // Title
        Text(
            text = title,
            style = MaterialTheme.typography.titleLarge,
            textAlign = TextAlign.Center,
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp)
        )

        // Settings card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceContainerLow
            )
        ) {
            Column {
                // Toggles
                toggles.forEachIndexed { index, toggle ->
                    ListItem(
                        headlineContent = { Text(toggle.title) },
                        leadingContent = toggle.icon?.let {
                            { Icon(IconMapper.getIcon(it), contentDescription = null) }
                        },
                        trailingContent = {
                            Switch(
                                checked = toggleStates[toggle.id] ?: toggle.value,
                                onCheckedChange = { onToggleChange(toggle.id, it) }
                            )
                        }
                    )
                    if (index < toggles.lastIndex || dropdowns.isNotEmpty()) {
                        HorizontalDivider(modifier = Modifier.padding(start = if (toggle.icon != null) 56.dp else 16.dp))
                    }
                }

                // Dropdowns
                dropdowns.forEachIndexed { index, dropdown ->
                    var expanded by remember { mutableStateOf(false) }
                    val selectedIndex = dropdownStates[dropdown.id] ?: dropdown.selectedIndex

                    ExposedDropdownMenuBox(
                        expanded = expanded,
                        onExpandedChange = { expanded = it }
                    ) {
                        ListItem(
                            headlineContent = { Text(dropdown.title) },
                            leadingContent = dropdown.icon?.let {
                                { Icon(IconMapper.getIcon(it), contentDescription = null) }
                            },
                            trailingContent = {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = dropdown.options.getOrElse(selectedIndex) { "" },
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                    ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded)
                                }
                            },
                            modifier = Modifier.menuAnchor()
                        )

                        ExposedDropdownMenu(
                            expanded = expanded,
                            onDismissRequest = { expanded = false }
                        ) {
                            dropdown.options.forEachIndexed { optIndex, option ->
                                DropdownMenuItem(
                                    text = { Text(option) },
                                    onClick = {
                                        onDropdownChange(dropdown.id, optIndex)
                                        expanded = false
                                    },
                                    leadingIcon = if (optIndex == selectedIndex) {
                                        { Icon(Icons.Outlined.Check, contentDescription = null) }
                                    } else null
                                )
                            }
                        }
                    }

                    if (index < dropdowns.lastIndex) {
                        HorizontalDivider(modifier = Modifier.padding(start = if (dropdown.icon != null) 56.dp else 16.dp))
                    }
                }
            }
        }
    }
}

/**
 * Shows a task creation bottom sheet
 */
@OptIn(ExperimentalMaterial3Api::class)
fun showTaskCreationSheet(
    activity: ComponentActivity,
    folders: List<String>,
    selectedFolderIndex: Int,
    promise: Promise
) {
    val sheetVisible = mutableStateOf(true)
    val taskName = mutableStateOf("")
    val folderIndex = mutableStateOf(selectedFolderIndex)
    val selectedDate = mutableStateOf<Long?>(null)
    val showDatePicker = mutableStateOf(false)

    val composeView = ComposeView(activity).apply {
        setViewTreeLifecycleOwner(activity)
        setViewTreeSavedStateRegistryOwner(activity)

        setContent {
            Material3ExpressiveTheme {
                if (sheetVisible.value) {
                    ModalBottomSheet(
                        onDismissRequest = {
                            sheetVisible.value = false
                            promise.resolve(mapOf("cancelled" to true))
                            (parent as? ViewGroup)?.removeView(this@apply)
                        },
                        dragHandle = { BottomSheetDefaults.DragHandle() }
                    ) {
                        TaskCreationSheetContent(
                            taskName = taskName.value,
                            onTaskNameChange = { taskName.value = it },
                            folders = folders,
                            selectedFolderIndex = folderIndex.value,
                            onFolderChange = { folderIndex.value = it },
                            selectedDateMillis = selectedDate.value,
                            onDateClick = { showDatePicker.value = true },
                            onClearDate = { selectedDate.value = null },
                            onSubmit = {
                                if (taskName.value.isNotBlank()) {
                                    sheetVisible.value = false
                                    promise.resolve(mapOf(
                                        "cancelled" to false,
                                        "taskName" to taskName.value.trim(),
                                        "folderIndex" to folderIndex.value,
                                        "dueDateMillis" to selectedDate.value
                                    ))
                                    (parent as? ViewGroup)?.removeView(this@apply)
                                }
                            }
                        )
                    }
                }

                // Date picker dialog
                if (showDatePicker.value) {
                    val datePickerState = rememberDatePickerState(
                        initialSelectedDateMillis = selectedDate.value ?: System.currentTimeMillis()
                    )

                    DatePickerDialog(
                        onDismissRequest = { showDatePicker.value = false },
                        confirmButton = {
                            TextButton(
                                onClick = {
                                    selectedDate.value = datePickerState.selectedDateMillis
                                    showDatePicker.value = false
                                }
                            ) {
                                Text("OK")
                            }
                        },
                        dismissButton = {
                            TextButton(onClick = { showDatePicker.value = false }) {
                                Text("Cancel")
                            }
                        }
                    ) {
                        DatePicker(state = datePickerState)
                    }
                }
            }
        }
    }

    val decorView = activity.window.decorView as ViewGroup
    decorView.addView(composeView, ViewGroup.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT
    ))
}

// Available icons for folder picker
private val availableFolderIcons = listOf(
    "folder" to Icons.Outlined.Folder,
    "favorite" to Icons.Outlined.Favorite,
    "star" to Icons.Outlined.Star,
    "bookmark" to Icons.Outlined.Bookmark,
    "flag" to Icons.Outlined.Flag,
    "work" to Icons.Outlined.Work,
    "home" to Icons.Outlined.Home,
    "shopping" to Icons.Outlined.ShoppingCart,
    "gift" to Icons.Outlined.CardGiftcard,
    "lightbulb" to Icons.Outlined.Lightbulb,
    "fitness" to Icons.Outlined.FitnessCenter,
    "music" to Icons.Outlined.MusicNote,
)

/**
 * Shows a folder creation bottom sheet
 */
@OptIn(ExperimentalMaterial3Api::class)
fun showFolderCreationSheet(
    activity: ComponentActivity,
    promise: Promise
) {
    val sheetVisible = mutableStateOf(true)
    val folderName = mutableStateOf("")
    val selectedIcon = mutableStateOf("folder")
    val showIconPicker = mutableStateOf(false)

    val composeView = ComposeView(activity).apply {
        setViewTreeLifecycleOwner(activity)
        setViewTreeSavedStateRegistryOwner(activity)

        setContent {
            Material3ExpressiveTheme {
                if (sheetVisible.value) {
                    ModalBottomSheet(
                        onDismissRequest = {
                            sheetVisible.value = false
                            promise.resolve(mapOf("cancelled" to true))
                            (parent as? ViewGroup)?.removeView(this@apply)
                        },
                        dragHandle = { BottomSheetDefaults.DragHandle() }
                    ) {
                        FolderCreationSheetContent(
                            folderName = folderName.value,
                            onFolderNameChange = { folderName.value = it },
                            selectedIcon = selectedIcon.value,
                            showIconPicker = showIconPicker.value,
                            onIconClick = { showIconPicker.value = !showIconPicker.value },
                            onIconSelected = {
                                selectedIcon.value = it
                                showIconPicker.value = false
                            },
                            onSubmit = {
                                if (folderName.value.isNotBlank()) {
                                    sheetVisible.value = false
                                    promise.resolve(mapOf(
                                        "cancelled" to false,
                                        "folderName" to folderName.value.trim(),
                                        "icon" to selectedIcon.value
                                    ))
                                    (parent as? ViewGroup)?.removeView(this@apply)
                                }
                            }
                        )
                    }
                }
            }
        }
    }

    val decorView = activity.window.decorView as ViewGroup
    decorView.addView(composeView, ViewGroup.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT
    ))
}

@Composable
private fun FolderCreationSheetContent(
    folderName: String,
    onFolderNameChange: (String) -> Unit,
    selectedIcon: String,
    showIconPicker: Boolean,
    onIconClick: () -> Unit,
    onIconSelected: (String) -> Unit,
    onSubmit: () -> Unit
) {
    val focusRequester = remember { FocusRequester() }
    val keyboardController = LocalSoftwareKeyboardController.current

    LaunchedEffect(Unit) {
        delay(100)
        focusRequester.requestFocus()
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .padding(bottom = 32.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Clickable folder icon
            IconButton(onClick = onIconClick) {
                Icon(
                    IconMapper.getIcon(selectedIcon),
                    contentDescription = "Choose icon",
                    tint = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            // Text input without outline
            BasicTextField(
                value = folderName,
                onValueChange = onFolderNameChange,
                singleLine = true,
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                keyboardActions = KeyboardActions(onDone = {
                    keyboardController?.hide()
                    onSubmit()
                }),
                textStyle = MaterialTheme.typography.bodyLarge.copy(
                    color = MaterialTheme.colorScheme.onSurface
                ),
                decorationBox = { innerTextField ->
                    Box(
                        modifier = Modifier.weight(1f)
                    ) {
                        if (folderName.isEmpty()) {
                            Text(
                                "Folder title",
                                style = MaterialTheme.typography.bodyLarge,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        innerTextField()
                    }
                },
                modifier = Modifier
                    .weight(1f)
                    .focusRequester(focusRequester)
            )

            // Submit button
            FilledIconButton(
                onClick = {
                    keyboardController?.hide()
                    onSubmit()
                },
                enabled = folderName.isNotBlank()
            ) {
                Icon(Icons.Outlined.Check, contentDescription = "Create folder")
            }
        }

        // Icon picker grid
        if (showIconPicker) {
            Spacer(modifier = Modifier.height(16.dp))
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(availableFolderIcons.size) { index ->
                    val (iconName, iconVector) = availableFolderIcons[index]
                    val isSelected = iconName == selectedIcon

                    Box(
                        modifier = Modifier
                            .size(48.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(
                                if (isSelected) MaterialTheme.colorScheme.primaryContainer
                                else MaterialTheme.colorScheme.surfaceContainerHigh
                            )
                            .clickable { onIconSelected(iconName) },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            iconVector,
                            contentDescription = iconName,
                            tint = if (isSelected) MaterialTheme.colorScheme.primary
                                   else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun TaskCreationSheetContent(
    taskName: String,
    onTaskNameChange: (String) -> Unit,
    folders: List<String>,
    selectedFolderIndex: Int,
    onFolderChange: (Int) -> Unit,
    selectedDateMillis: Long?,
    onDateClick: () -> Unit,
    onClearDate: () -> Unit,
    onSubmit: () -> Unit
) {
    val focusRequester = remember { FocusRequester() }
    val keyboardController = LocalSoftwareKeyboardController.current
    var folderDropdownExpanded by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        delay(100)
        focusRequester.requestFocus()
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .padding(bottom = 32.dp)
    ) {
        // Task name input row with submit button
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Text input (no border, placeholder style)
            BasicTextField(
                value = taskName,
                onValueChange = onTaskNameChange,
                singleLine = true,
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                keyboardActions = KeyboardActions(onDone = {
                    keyboardController?.hide()
                    onSubmit()
                }),
                textStyle = MaterialTheme.typography.bodyLarge.copy(
                    color = MaterialTheme.colorScheme.onSurface
                ),
                decorationBox = { innerTextField ->
                    Box {
                        if (taskName.isEmpty()) {
                            Text(
                                "Task title",
                                style = MaterialTheme.typography.bodyLarge,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        innerTextField()
                    }
                },
                modifier = Modifier
                    .weight(1f)
                    .focusRequester(focusRequester)
            )

            // Submit button
            FilledIconButton(
                onClick = {
                    keyboardController?.hide()
                    onSubmit()
                },
                enabled = taskName.isNotBlank()
            ) {
                Icon(Icons.Outlined.Check, contentDescription = "Create task")
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Folder dropdown and date chip row
        Row(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Folder dropdown styled as chip
            ExposedDropdownMenuBox(
                expanded = folderDropdownExpanded,
                onExpandedChange = { folderDropdownExpanded = it }
            ) {
                val selectedFolder = folders.getOrElse(selectedFolderIndex) { "Inbox" }
                val folderIcon = when (selectedFolder.lowercase()) {
                    "inbox" -> Icons.Outlined.Inbox
                    "today" -> Icons.Outlined.CalendarToday
                    "important" -> Icons.Outlined.Favorite
                    "rewards" -> Icons.Outlined.EmojiEvents
                    else -> Icons.Outlined.Folder
                }

                FilterChip(
                    selected = true,
                    onClick = { folderDropdownExpanded = true },
                    label = { Text(selectedFolder) },
                    leadingIcon = {
                        Icon(
                            folderIcon,
                            contentDescription = null,
                            modifier = Modifier.size(18.dp)
                        )
                    },
                    trailingIcon = {
                        Icon(
                            if (folderDropdownExpanded) Icons.Outlined.KeyboardArrowUp
                            else Icons.Outlined.KeyboardArrowDown,
                            contentDescription = null,
                            modifier = Modifier.size(18.dp)
                        )
                    },
                    modifier = Modifier.menuAnchor()
                )

                ExposedDropdownMenu(
                    expanded = folderDropdownExpanded,
                    onDismissRequest = { folderDropdownExpanded = false }
                ) {
                    folders.forEachIndexed { index, folder ->
                        val icon = when (folder.lowercase()) {
                            "inbox" -> Icons.Outlined.Inbox
                            "today" -> Icons.Outlined.CalendarToday
                            "important" -> Icons.Outlined.Favorite
                            "rewards" -> Icons.Outlined.EmojiEvents
                            else -> Icons.Outlined.Folder
                        }

                        DropdownMenuItem(
                            text = { Text(folder) },
                            onClick = {
                                onFolderChange(index)
                                folderDropdownExpanded = false
                            },
                            leadingIcon = {
                                Icon(icon, contentDescription = null, modifier = Modifier.size(20.dp))
                            },
                            trailingIcon = if (index == selectedFolderIndex) {
                                { Icon(Icons.Outlined.Check, contentDescription = null) }
                            } else null
                        )
                    }
                }
            }

            // Date chip
            val isToday = selectedDateMillis?.let {
                val today = java.util.Calendar.getInstance()
                val selected = java.util.Calendar.getInstance().apply { timeInMillis = it }
                today.get(java.util.Calendar.DAY_OF_YEAR) == selected.get(java.util.Calendar.DAY_OF_YEAR) &&
                today.get(java.util.Calendar.YEAR) == selected.get(java.util.Calendar.YEAR)
            } ?: false

            FilterChip(
                selected = selectedDateMillis != null,
                onClick = onDateClick,
                label = {
                    Text(
                        when {
                            selectedDateMillis == null -> "Today"
                            isToday -> "Today"
                            else -> java.text.SimpleDateFormat("MMM d", java.util.Locale.getDefault())
                                .format(java.util.Date(selectedDateMillis))
                        }
                    )
                },
                leadingIcon = {
                    Icon(
                        Icons.Outlined.CalendarToday,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                }
            )
        }
    }
}
