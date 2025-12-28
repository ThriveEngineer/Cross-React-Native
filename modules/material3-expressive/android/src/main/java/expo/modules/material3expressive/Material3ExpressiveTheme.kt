package expo.modules.material3expressive

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// App color scheme matching React Native theme
private val AppLightColorScheme = lightColorScheme(
    primary = Color(0xFF1D1D1D),
    onPrimary = Color.White,
    primaryContainer = Color(0xFFF2F2F7),
    onPrimaryContainer = Color(0xFF1D1D1D),
    secondary = Color.White,
    onSecondary = Color(0xFF1D1D1D),
    surface = Color.White,
    onSurface = Color(0xFF1D1D1D),
    surfaceVariant = Color(0xFFF2F2F7),
    onSurfaceVariant = Color(0xFF919191),
    background = Color.White,
    onBackground = Color(0xFF1D1D1D),
    outline = Color(0xFFE0E0E0),
    error = Color(0xFFDC3545),
    onError = Color.White,
)

private val AppDarkColorScheme = darkColorScheme(
    primary = Color.White,
    onPrimary = Color(0xFF1D1D1D),
    primaryContainer = Color(0xFF2C2C2E),
    onPrimaryContainer = Color.White,
    secondary = Color(0xFF1D1D1D),
    onSecondary = Color.White,
    surface = Color(0xFF1C1C1E),
    onSurface = Color.White,
    surfaceVariant = Color(0xFF2C2C2E),
    onSurfaceVariant = Color(0xFF8E8E93),
    background = Color.Black,
    onBackground = Color.White,
    outline = Color(0xFF38383A),
    error = Color(0xFFFF453A),
    onError = Color.White,
)

@Composable
fun Material3ExpressiveTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) AppDarkColorScheme else AppLightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography(),
        shapes = Shapes(),
        content = content
    )
}
