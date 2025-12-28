package expo.modules.material3expressive

import android.content.Context
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ComposeProps
import expo.modules.kotlin.views.ExpoComposeView

data class FABProps(
    val icon: MutableState<String> = mutableStateOf("add"),
    val label: MutableState<String?> = mutableStateOf(null),
    val expanded: MutableState<Boolean> = mutableStateOf(true)
) : ComposeProps

class M3ExpressiveFAB(context: Context, appContext: AppContext) :
    ExpoComposeView<FABProps>(context, appContext, withHostingView = true) {

    override val props = FABProps()

    @Composable
    override fun Content(modifier: Modifier) {
        val icon = props.icon.value
        val label = props.label.value
        val expanded = props.expanded.value

        Material3ExpressiveTheme {
            ExpressiveFABComposable(
                icon = icon,
                label = label,
                expanded = expanded,
                onClick = { },
                modifier = modifier
            )
        }
    }

    fun setIcon(value: String) {
        props.icon.value = value
    }

    fun setLabel(value: String?) {
        props.label.value = value
    }

    fun setExpanded(value: Boolean) {
        props.expanded.value = value
    }
}

@Composable
fun ExpressiveFABComposable(
    icon: String,
    label: String?,
    expanded: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val iconVector = getIconByName(icon)

    if (label != null && expanded) {
        ExtendedFloatingActionButton(
            onClick = onClick,
            modifier = modifier.padding(4.dp),
            icon = { Icon(iconVector, contentDescription = label) },
            text = { Text(label) }
        )
    } else {
        FloatingActionButton(
            onClick = onClick,
            modifier = modifier.padding(4.dp)
        ) {
            Icon(iconVector, contentDescription = label ?: "Action")
        }
    }
}

fun getIconByName(name: String): ImageVector {
    return when (name.lowercase()) {
        "add" -> Icons.Filled.Add
        "edit" -> Icons.Filled.Edit
        "delete" -> Icons.Filled.Delete
        "check" -> Icons.Filled.Check
        "close" -> Icons.Filled.Close
        "search" -> Icons.Filled.Search
        "settings" -> Icons.Filled.Settings
        "home" -> Icons.Filled.Home
        "favorite" -> Icons.Filled.Favorite
        "share" -> Icons.Filled.Share
        "menu" -> Icons.Filled.Menu
        "refresh" -> Icons.Filled.Refresh
        "done" -> Icons.Filled.Done
        "info" -> Icons.Filled.Info
        "warning" -> Icons.Filled.Warning
        "email" -> Icons.Filled.Email
        "phone" -> Icons.Filled.Phone
        "person" -> Icons.Filled.Person
        "star" -> Icons.Filled.Star
        "send" -> Icons.Filled.Send
        else -> Icons.Filled.Add
    }
}
