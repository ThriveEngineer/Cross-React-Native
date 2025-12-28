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
    secondary = Color(0xFF1D1D1D),
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFF2F2F7),
    onSecondaryContainer = Color(0xFF1D1D1D),
    tertiary = Color(0xFF1D1D1D),
    onTertiary = Color.White,
    tertiaryContainer = Color(0xFFF2F2F7),
    onTertiaryContainer = Color(0xFF1D1D1D),
    surface = Color.White,
    onSurface = Color(0xFF1D1D1D),
    surfaceVariant = Color(0xFFF2F2F7),
    onSurfaceVariant = Color(0xFF919191),
    surfaceTint = Color(0xFF1D1D1D),
    inverseSurface = Color(0xFF1D1D1D),
    inverseOnSurface = Color.White,
    inversePrimary = Color.White,
    background = Color.White,
    onBackground = Color(0xFF1D1D1D),
    outline = Color(0xFFE0E0E0),
    outlineVariant = Color(0xFFE0E0E0),
    scrim = Color.Black,
    error = Color(0xFFDC3545),
    onError = Color.White,
    errorContainer = Color(0xFFFFDAD6),
    onErrorContainer = Color(0xFF410002),
    surfaceContainerLowest = Color.White,
    surfaceContainerLow = Color(0xFFFAFAFA),
    surfaceContainer = Color(0xFFF5F5F5),
    surfaceContainerHigh = Color(0xFFF0F0F0),
    surfaceContainerHighest = Color(0xFFEBEBEB),
)

private val AppDarkColorScheme = darkColorScheme(
    primary = Color.White,
    onPrimary = Color(0xFF1D1D1D),
    primaryContainer = Color(0xFF2C2C2E),
    onPrimaryContainer = Color.White,
    secondary = Color.White,
    onSecondary = Color(0xFF1D1D1D),
    secondaryContainer = Color(0xFF2C2C2E),
    onSecondaryContainer = Color.White,
    tertiary = Color.White,
    onTertiary = Color(0xFF1D1D1D),
    tertiaryContainer = Color(0xFF2C2C2E),
    onTertiaryContainer = Color.White,
    surface = Color(0xFF1C1C1E),
    onSurface = Color.White,
    surfaceVariant = Color(0xFF2C2C2E),
    onSurfaceVariant = Color(0xFF8E8E93),
    surfaceTint = Color.White,
    inverseSurface = Color.White,
    inverseOnSurface = Color(0xFF1D1D1D),
    inversePrimary = Color(0xFF1D1D1D),
    background = Color.Black,
    onBackground = Color.White,
    outline = Color(0xFF38383A),
    outlineVariant = Color(0xFF38383A),
    scrim = Color.Black,
    error = Color(0xFFFF453A),
    onError = Color.White,
    errorContainer = Color(0xFF93000A),
    onErrorContainer = Color(0xFFFFDAD6),
    surfaceContainerLowest = Color(0xFF0D0D0D),
    surfaceContainerLow = Color(0xFF1C1C1E),
    surfaceContainer = Color(0xFF252527),
    surfaceContainerHigh = Color(0xFF2C2C2E),
    surfaceContainerHighest = Color(0xFF3A3A3C),
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
