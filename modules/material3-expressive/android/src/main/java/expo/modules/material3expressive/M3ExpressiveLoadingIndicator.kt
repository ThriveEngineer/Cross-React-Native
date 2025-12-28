package expo.modules.material3expressive

import android.content.Context
import androidx.compose.foundation.layout.size
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ComposeProps
import expo.modules.kotlin.views.ExpoComposeView

data class LoadingIndicatorProps(
    val variant: MutableState<String> = mutableStateOf("circular"),
    val progress: MutableState<Float?> = mutableStateOf(null)
) : ComposeProps

class M3ExpressiveLoadingIndicator(context: Context, appContext: AppContext) :
    ExpoComposeView<LoadingIndicatorProps>(context, appContext, withHostingView = true) {

    override val props = LoadingIndicatorProps()

    @Composable
    override fun Content(modifier: Modifier) {
        val variant = props.variant.value
        val progress = props.progress.value

        Material3ExpressiveTheme {
            ExpressiveLoadingIndicatorComposable(
                variant = variant,
                progress = progress,
                modifier = modifier
            )
        }
    }

    fun setVariant(value: String) {
        props.variant.value = value
    }

    fun setProgress(value: Float?) {
        props.progress.value = value
    }
}

@Composable
fun ExpressiveLoadingIndicatorComposable(
    variant: String,
    progress: Float?,
    modifier: Modifier = Modifier
) {
    when (variant) {
        "circular" -> {
            if (progress != null) {
                CircularProgressIndicator(
                    progress = { progress },
                    modifier = modifier.size(48.dp)
                )
            } else {
                CircularProgressIndicator(
                    modifier = modifier.size(48.dp)
                )
            }
        }
        "linear" -> {
            if (progress != null) {
                LinearProgressIndicator(
                    progress = { progress },
                    modifier = modifier
                )
            } else {
                LinearProgressIndicator(modifier = modifier)
            }
        }
        else -> {
            CircularProgressIndicator(
                modifier = modifier.size(48.dp)
            )
        }
    }
}
