package expo.modules.material3expressive

import android.content.Context
import android.view.ViewGroup
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.unit.dp
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView

class M3ExpressiveButton(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
    private var labelState = mutableStateOf("Button")
    private var variantState = mutableStateOf("filled")
    private var enabledState = mutableStateOf(true)

    private var onPressCallback: (() -> Unit)? = null

    private val composeView: ComposeView = ComposeView(context).apply {
        layoutParams = ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        )
        setContent {
            Material3ExpressiveTheme {
                ExpressiveButtonComposable(
                    label = labelState.value,
                    variant = variantState.value,
                    enabled = enabledState.value,
                    onClick = { onPressCallback?.invoke() }
                )
            }
        }
    }

    init {
        addView(composeView)
    }

    fun setLabel(value: String) {
        labelState.value = value
    }

    fun setVariant(value: String) {
        variantState.value = value
    }

    fun setButtonEnabled(value: Boolean) {
        enabledState.value = value
    }

    fun setOnPressCallback(callback: () -> Unit) {
        onPressCallback = callback
    }
}

@Composable
fun ExpressiveButtonComposable(
    label: String,
    variant: String,
    enabled: Boolean,
    onClick: () -> Unit
) {
    when (variant) {
        "filled" -> Button(
            onClick = onClick,
            enabled = enabled,
            modifier = Modifier.padding(4.dp)
        ) {
            Text(label)
        }
        "filledTonal" -> FilledTonalButton(
            onClick = onClick,
            enabled = enabled,
            modifier = Modifier.padding(4.dp)
        ) {
            Text(label)
        }
        "outlined" -> OutlinedButton(
            onClick = onClick,
            enabled = enabled,
            modifier = Modifier.padding(4.dp)
        ) {
            Text(label)
        }
        "elevated" -> ElevatedButton(
            onClick = onClick,
            enabled = enabled,
            modifier = Modifier.padding(4.dp)
        ) {
            Text(label)
        }
        "text" -> TextButton(
            onClick = onClick,
            enabled = enabled,
            modifier = Modifier.padding(4.dp)
        ) {
            Text(label)
        }
        else -> Button(
            onClick = onClick,
            enabled = enabled,
            modifier = Modifier.padding(4.dp)
        ) {
            Text(label)
        }
    }
}
