package expo.modules.material3expressive

import android.content.Context
import android.view.ViewGroup
import androidx.compose.foundation.layout.size
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.unit.dp
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView

class M3ExpressiveLoadingIndicator(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
    private var variantState = mutableStateOf("circular")
    private var progressState = mutableStateOf<Float?>(null)

    private val composeView: ComposeView = ComposeView(context).apply {
        layoutParams = ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        )
        setContent {
            Material3ExpressiveTheme {
                ExpressiveLoadingIndicatorComposable(
                    variant = variantState.value,
                    progress = progressState.value
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

    fun setProgress(value: Float?) {
        progressState.value = value
    }
}

@Composable
fun ExpressiveLoadingIndicatorComposable(
    variant: String,
    progress: Float?
) {
    when (variant) {
        "circular" -> {
            if (progress != null) {
                CircularProgressIndicator(
                    progress = { progress },
                    modifier = Modifier.size(48.dp)
                )
            } else {
                CircularProgressIndicator(
                    modifier = Modifier.size(48.dp)
                )
            }
        }
        "linear" -> {
            if (progress != null) {
                LinearProgressIndicator(
                    progress = { progress }
                )
            } else {
                LinearProgressIndicator()
            }
        }
        else -> {
            CircularProgressIndicator(
                modifier = Modifier.size(48.dp)
            )
        }
    }
}
