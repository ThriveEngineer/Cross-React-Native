package expo.modules.material3expressive

import android.content.Context
import android.view.ViewGroup
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.unit.dp
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView

class M3ExpressiveCard(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
    private var variantState = mutableStateOf("filled")

    private var onPressCallback: (() -> Unit)? = null

    private val composeView: ComposeView = ComposeView(context).apply {
        layoutParams = ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        )
        setContent {
            Material3ExpressiveTheme {
                ExpressiveCardComposable(
                    variant = variantState.value,
                    onClick = { onPressCallback?.invoke() }
                )
            }
        }
    }

    init {
        addView(composeView)
    }

    fun setVariant(value: String) {
        variantState.value = value
    }

    fun setOnPressCallback(callback: () -> Unit) {
        onPressCallback = callback
    }
}

@Composable
fun ExpressiveCardComposable(
    variant: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    when (variant) {
        "filled" -> Card(
            onClick = onClick,
            modifier = modifier
                .fillMaxWidth()
                .padding(8.dp),
            colors = CardDefaults.cardColors()
        ) {
            Box(modifier = Modifier.padding(16.dp).height(100.dp)) {}
        }
        "elevated" -> ElevatedCard(
            onClick = onClick,
            modifier = modifier
                .fillMaxWidth()
                .padding(8.dp),
            elevation = CardDefaults.elevatedCardElevation()
        ) {
            Box(modifier = Modifier.padding(16.dp).height(100.dp)) {}
        }
        "outlined" -> OutlinedCard(
            onClick = onClick,
            modifier = modifier
                .fillMaxWidth()
                .padding(8.dp)
        ) {
            Box(modifier = Modifier.padding(16.dp).height(100.dp)) {}
        }
        else -> Card(
            onClick = onClick,
            modifier = modifier
                .fillMaxWidth()
                .padding(8.dp)
        ) {
            Box(modifier = Modifier.padding(16.dp).height(100.dp)) {}
        }
    }
}
