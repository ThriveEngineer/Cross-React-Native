package expo.modules.material3expressive

import android.content.Context
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ComposeProps
import expo.modules.kotlin.views.ExpoComposeView
import java.io.Serializable

class SwitchValueChangeEvent(
    @Field val value: Boolean = false
) : Record, Serializable

data class SwitchProps(
    val value: MutableState<Boolean> = mutableStateOf(false),
    val enabled: MutableState<Boolean> = mutableStateOf(true)
) : ComposeProps

class M3ExpressiveSwitch(context: Context, appContext: AppContext) :
    ExpoComposeView<SwitchProps>(context, appContext, withHostingView = true) {

    override val props = SwitchProps()
    private val onValueChange by EventDispatcher<SwitchValueChangeEvent>()

    @Composable
    override fun Content(modifier: Modifier) {
        val (checked) = props.value
        val (enabled) = props.enabled

        Material3ExpressiveTheme {
            Switch(
                checked = checked,
                onCheckedChange = { newValue ->
                    props.value.value = newValue
                    onValueChange(SwitchValueChangeEvent(newValue))
                },
                enabled = enabled,
                colors = SwitchDefaults.colors(
                    checkedThumbColor = MaterialTheme.colorScheme.onPrimary,
                    checkedTrackColor = MaterialTheme.colorScheme.primary,
                    uncheckedThumbColor = MaterialTheme.colorScheme.outline,
                    uncheckedTrackColor = MaterialTheme.colorScheme.surfaceVariant,
                    uncheckedBorderColor = MaterialTheme.colorScheme.outline
                ),
                modifier = modifier
            )
        }
    }

    fun setValue(value: Boolean) {
        props.value.value = value
    }

    fun setSwitchEnabled(value: Boolean) {
        props.enabled.value = value
    }
}
