package expo.modules.material3expressive

import android.content.Context
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ComposeProps
import expo.modules.kotlin.views.ExpoComposeView
import java.io.Serializable

class BottomSheetDismissEvent : Record, Serializable

data class BottomSheetProps(
    val visible: MutableState<Boolean> = mutableStateOf(false),
    val title: MutableState<String?> = mutableStateOf(null)
) : ComposeProps

@OptIn(ExperimentalMaterial3Api::class)
class M3ExpressiveBottomSheet(context: Context, appContext: AppContext) :
    ExpoComposeView<BottomSheetProps>(context, appContext, withHostingView = true) {

    override val props = BottomSheetProps()
    private val onDismiss by EventDispatcher<BottomSheetDismissEvent>()

    @Composable
    override fun Content(modifier: Modifier) {
        val (visible) = props.visible
        val (title) = props.title
        val sheetState = rememberModalBottomSheetState()

        LaunchedEffect(visible) {
            if (visible) {
                sheetState.show()
            } else {
                sheetState.hide()
            }
        }

        Material3ExpressiveTheme {
            if (visible) {
                ModalBottomSheet(
                    onDismissRequest = {
                        props.visible.value = false
                        onDismiss(BottomSheetDismissEvent())
                    },
                    sheetState = sheetState,
                    dragHandle = { BottomSheetDefaults.DragHandle() }
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp)
                            .padding(bottom = 32.dp)
                    ) {
                        title?.let { titleText ->
                            Text(
                                text = titleText,
                                style = MaterialTheme.typography.titleLarge,
                                modifier = Modifier.padding(bottom = 16.dp)
                            )
                        }
                        // Content area - children would go here
                        Spacer(modifier = Modifier.height(100.dp))
                    }
                }
            }
        }
    }

    fun setVisible(value: Boolean) {
        props.visible.value = value
    }

    fun setTitle(value: String?) {
        props.title.value = value
    }
}
