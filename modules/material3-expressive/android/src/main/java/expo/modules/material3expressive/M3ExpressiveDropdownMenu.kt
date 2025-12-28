package expo.modules.material3expressive

import android.content.Context
import androidx.compose.foundation.layout.*
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

class DropdownSelectionChangeEvent(
    @Field val index: Int = 0,
    @Field val value: String = ""
) : Record, Serializable

data class DropdownMenuProps(
    val options: MutableState<List<String>> = mutableStateOf(emptyList()),
    val selectedIndex: MutableState<Int> = mutableStateOf(0),
    val label: MutableState<String> = mutableStateOf("")
) : ComposeProps

@OptIn(ExperimentalMaterial3Api::class)
class M3ExpressiveDropdownMenu(context: Context, appContext: AppContext) :
    ExpoComposeView<DropdownMenuProps>(context, appContext, withHostingView = true) {

    override val props = DropdownMenuProps()
    private val onSelectionChange by EventDispatcher<DropdownSelectionChangeEvent>()

    @Composable
    override fun Content(modifier: Modifier) {
        val options = props.options.value
        val selectedIndex = props.selectedIndex.value
        val label = props.label.value
        var expanded by remember { mutableStateOf(false) }

        Material3ExpressiveTheme {
            ExposedDropdownMenuBox(
                expanded = expanded,
                onExpandedChange = { expanded = it },
                modifier = modifier.fillMaxWidth()
            ) {
                OutlinedTextField(
                    value = if (options.isNotEmpty() && selectedIndex < options.size)
                        options[selectedIndex] else "",
                    onValueChange = {},
                    readOnly = true,
                    label = { Text(label) },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = MaterialTheme.colorScheme.primary,
                        unfocusedBorderColor = MaterialTheme.colorScheme.outline,
                        focusedLabelColor = MaterialTheme.colorScheme.primary,
                        unfocusedLabelColor = MaterialTheme.colorScheme.onSurfaceVariant,
                        focusedTrailingIconColor = MaterialTheme.colorScheme.onSurface,
                        unfocusedTrailingIconColor = MaterialTheme.colorScheme.onSurfaceVariant
                    ),
                    modifier = Modifier
                        .menuAnchor()
                        .fillMaxWidth()
                )

                ExposedDropdownMenu(
                    expanded = expanded,
                    onDismissRequest = { expanded = false }
                ) {
                    options.forEachIndexed { index, option ->
                        DropdownMenuItem(
                            text = { Text(option, color = MaterialTheme.colorScheme.onSurface) },
                            onClick = {
                                props.selectedIndex.value = index
                                expanded = false
                                onSelectionChange(DropdownSelectionChangeEvent(index, option))
                            },
                            contentPadding = ExposedDropdownMenuDefaults.ItemContentPadding
                        )
                    }
                }
            }
        }
    }

    fun setOptions(options: List<String>) {
        props.options.value = options
    }

    fun setSelectedIndex(index: Int) {
        props.selectedIndex.value = index
    }

    fun setLabel(label: String) {
        props.label.value = label
    }
}
