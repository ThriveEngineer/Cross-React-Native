package expo.modules.material3expressive

import android.content.Context
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ComposeProps
import expo.modules.kotlin.views.ExpoComposeView

data class ButtonProps(
    val label: MutableState<String> = mutableStateOf("Button"),
    val variant: MutableState<String> = mutableStateOf("filled"),
    val enabled: MutableState<Boolean> = mutableStateOf(true)
) : ComposeProps

class M3ExpressiveButton(context: Context, appContext: AppContext) :
    ExpoComposeView<ButtonProps>(context, appContext, withHostingView = true) {

    override val props = ButtonProps()

    @Composable
    override fun Content(modifier: Modifier) {
        val label = props.label.value
        val variant = props.variant.value
        val enabled = props.enabled.value

        Material3ExpressiveTheme {
            ExpressiveButtonComposable(
                label = label,
                variant = variant,
                enabled = enabled,
                onClick = { },
                modifier = modifier
            )
        }
    }

    fun setLabel(value: String) {
        props.label.value = value
    }

    fun setVariant(value: String) {
        props.variant.value = value
    }

    fun setButtonEnabled(value: Boolean) {
        props.enabled.value = value
    }
}

@Composable
fun ExpressiveButtonComposable(
    label: String,
    variant: String,
    enabled: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    when (variant) {
        "filled" -> Button(
            onClick = onClick,
            enabled = enabled,
            modifier = modifier.padding(4.dp)
        ) {
            Text(label)
        }
        "filledTonal" -> FilledTonalButton(
            onClick = onClick,
            enabled = enabled,
            modifier = modifier.padding(4.dp)
        ) {
            Text(label)
        }
        "outlined" -> OutlinedButton(
            onClick = onClick,
            enabled = enabled,
            modifier = modifier.padding(4.dp)
        ) {
            Text(label)
        }
        "elevated" -> ElevatedButton(
            onClick = onClick,
            enabled = enabled,
            modifier = modifier.padding(4.dp)
        ) {
            Text(label)
        }
        "text" -> TextButton(
            onClick = onClick,
            enabled = enabled,
            modifier = modifier.padding(4.dp)
        ) {
            Text(label)
        }
        else -> Button(
            onClick = onClick,
            enabled = enabled,
            modifier = modifier.padding(4.dp)
        ) {
            Text(label)
        }
    }
}
