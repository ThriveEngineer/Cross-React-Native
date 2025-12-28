package expo.modules.material3expressive

import android.content.Context
import androidx.compose.material3.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ComposeProps
import expo.modules.kotlin.views.ExpoComposeView
import java.io.Serializable

class NavigationItemSelectedEvent(
    @Field val index: Int = 0,
    @Field val name: String = ""
) : Record, Serializable

data class NavigationBarProps(
    val items: MutableState<List<String>> = mutableStateOf(emptyList()),
    val selectedIndex: MutableState<Int> = mutableStateOf(0),
    val icons: MutableState<List<String>> = mutableStateOf(emptyList()),
    val selectedIcons: MutableState<List<String>> = mutableStateOf(emptyList())
) : ComposeProps

class M3ExpressiveNavigationBar(context: Context, appContext: AppContext) :
    ExpoComposeView<NavigationBarProps>(context, appContext, withHostingView = true) {

    override val props = NavigationBarProps()
    private val onItemSelected by EventDispatcher<NavigationItemSelectedEvent>()

    private fun getIcon(name: String, filled: Boolean): ImageVector {
        // Using only guaranteed-to-exist Material Icons
        return when (name.lowercase()) {
            "today", "calendar_today", "calendar", "event" -> if (filled) Icons.Filled.DateRange else Icons.Outlined.DateRange
            "folder" -> if (filled) Icons.Filled.Folder else Icons.Outlined.Folder
            "home" -> if (filled) Icons.Filled.Home else Icons.Outlined.Home
            "settings" -> if (filled) Icons.Filled.Settings else Icons.Outlined.Settings
            "person", "account" -> if (filled) Icons.Filled.Person else Icons.Outlined.Person
            "search" -> if (filled) Icons.Filled.Search else Icons.Outlined.Search
            "star" -> if (filled) Icons.Filled.Star else Icons.Outlined.Star
            "favorite" -> if (filled) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder
            "check", "done" -> if (filled) Icons.Filled.Done else Icons.Outlined.Done
            "list" -> if (filled) Icons.Filled.List else Icons.Outlined.List
            "add" -> if (filled) Icons.Filled.Add else Icons.Outlined.Add
            "notifications", "bell" -> if (filled) Icons.Filled.Notifications else Icons.Outlined.Notifications
            "mail", "email" -> if (filled) Icons.Filled.Email else Icons.Outlined.Email
            else -> if (filled) Icons.Filled.Home else Icons.Outlined.Home
        }
    }

    @Composable
    override fun Content(modifier: Modifier) {
        val items = props.items.value
        val selectedIndex = props.selectedIndex.value
        val icons = props.icons.value
        val selectedIcons = props.selectedIcons.value

        Material3ExpressiveTheme {
            NavigationBar(
                modifier = modifier
            ) {
                items.forEachIndexed { index, label ->
                    val isSelected = index == selectedIndex
                    val iconName = icons.getOrNull(index) ?: "circle"
                    val selectedIconName = selectedIcons.getOrNull(index) ?: iconName

                    NavigationBarItem(
                        icon = {
                            Icon(
                                imageVector = getIcon(
                                    if (isSelected) selectedIconName else iconName,
                                    isSelected
                                ),
                                contentDescription = label
                            )
                        },
                        label = { Text(label) },
                        selected = isSelected,
                        onClick = {
                            props.selectedIndex.value = index
                            onItemSelected(NavigationItemSelectedEvent(index, label))
                        }
                    )
                }
            }
        }
    }

    fun setItems(items: List<String>) {
        props.items.value = items
    }

    fun setSelectedIndex(index: Int) {
        props.selectedIndex.value = index
    }

    fun setIcons(icons: List<String>) {
        props.icons.value = icons
    }

    fun setSelectedIcons(icons: List<String>) {
        props.selectedIcons.value = icons
    }
}
