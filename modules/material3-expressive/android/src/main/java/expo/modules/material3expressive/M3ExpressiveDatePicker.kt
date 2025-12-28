package expo.modules.material3expressive

import android.content.Context
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ComposeProps
import expo.modules.kotlin.views.ExpoComposeView
import java.io.Serializable

class DateSelectedEvent(
    @Field val dateMillis: Long = 0L
) : Record, Serializable

class DatePickerDismissEvent : Record, Serializable

data class DatePickerProps(
    val visible: MutableState<Boolean> = mutableStateOf(false),
    val selectedDate: MutableState<Long?> = mutableStateOf(null),
    val title: MutableState<String> = mutableStateOf("Select date")
) : ComposeProps

@OptIn(ExperimentalMaterial3Api::class)
class M3ExpressiveDatePicker(context: Context, appContext: AppContext) :
    ExpoComposeView<DatePickerProps>(context, appContext, withHostingView = true) {

    override val props = DatePickerProps()
    private val onDateSelected by EventDispatcher<DateSelectedEvent>()
    private val onDismiss by EventDispatcher<DatePickerDismissEvent>()

    @Composable
    override fun Content(modifier: Modifier) {
        val (visible) = props.visible
        val (selectedDate) = props.selectedDate
        val (title) = props.title

        Material3ExpressiveTheme {
            if (visible) {
                val datePickerState = rememberDatePickerState(
                    initialSelectedDateMillis = selectedDate ?: System.currentTimeMillis()
                )

                DatePickerDialog(
                    onDismissRequest = {
                        props.visible.value = false
                        onDismiss(DatePickerDismissEvent())
                    },
                    confirmButton = {
                        TextButton(
                            onClick = {
                                datePickerState.selectedDateMillis?.let { millis ->
                                    props.selectedDate.value = millis
                                    onDateSelected(DateSelectedEvent(millis))
                                }
                                props.visible.value = false
                            }
                        ) {
                            Text("OK")
                        }
                    },
                    dismissButton = {
                        TextButton(
                            onClick = {
                                props.visible.value = false
                                onDismiss(DatePickerDismissEvent())
                            }
                        ) {
                            Text("Cancel")
                        }
                    }
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

    fun setShowPicker(value: Boolean) {
        props.visible.value = value
    }

    fun setSelectedDate(millis: Long?) {
        props.selectedDate.value = millis
    }

    fun setTitle(title: String) {
        props.title.value = title
    }
}
