package expo.modules.material3expressive

import android.content.Context
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ComposeProps
import expo.modules.kotlin.views.ExpoComposeView

data class CardProps(
    val variant: MutableState<String> = mutableStateOf("filled")
) : ComposeProps

class M3ExpressiveCard(context: Context, appContext: AppContext) :
    ExpoComposeView<CardProps>(context, appContext, withHostingView = true) {

    override val props = CardProps()

    @Composable
    override fun Content(modifier: Modifier) {
        val variant = props.variant.value

        Material3ExpressiveTheme {
            ExpressiveCardComposable(
                variant = variant,
                onClick = { },
                modifier = modifier
            )
        }
    }

    fun setVariant(value: String) {
        props.variant.value = value
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
