package expo.modules.material3expressive

import android.content.Context
import android.view.ViewGroup
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.unit.dp
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView

class M3ExpressiveFAB(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
    private var iconState = mutableStateOf("add")
    private var labelState = mutableStateOf<String?>(null)
    private var expandedState = mutableStateOf(true)

    private var onPressCallback: (() -> Unit)? = null

    private val composeView: ComposeView = ComposeView(context).apply {
        layoutParams = ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        )
        setContent {
            Material3ExpressiveTheme {
                ExpressiveFABComposable(
                    icon = iconState.value,
                    label = labelState.value,
                    expanded = expandedState.value,
                    onClick = { onPressCallback?.invoke() }
                )
            }
        }
    }

    init {
        addView(composeView)
    }

    fun setIcon(value: String) {
        iconState.value = value
    }

    fun setLabel(value: String?) {
        labelState.value = value
    }

    fun setExpanded(value: Boolean) {
        expandedState.value = value
    }

    fun setOnPressCallback(callback: () -> Unit) {
        onPressCallback = callback
    }
}

@Composable
fun ExpressiveFABComposable(
    icon: String,
    label: String?,
    expanded: Boolean,
    onClick: () -> Unit
) {
    val iconVector = getIconByName(icon)

    if (label != null && expanded) {
        ExtendedFloatingActionButton(
            onClick = onClick,
            modifier = Modifier.padding(4.dp),
            icon = { Icon(iconVector, contentDescription = label) },
            text = { Text(label) }
        )
    } else {
        FloatingActionButton(
            onClick = onClick,
            modifier = Modifier.padding(4.dp)
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
