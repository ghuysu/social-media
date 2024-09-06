package thanhnhan.myproject.socialmedia.ui.theme

import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.sp


//large title
//title
//subtitle
//body

data class AppTypography(
    val largeTitle: TextStyle = TextStyle.Default,
    val title: TextStyle = TextStyle.Default,
    val subtitle: TextStyle = TextStyle.Default,
    val body: TextStyle = TextStyle.Default,
)

val LocalAppTypography = staticCompositionLocalOf {
    AppTypography()
}

@Composable
fun AppTheme(
    content: @Composable () -> Unit
) {
    val typography = AppTypography(
        largeTitle = TextStyle(
            fontFamily = FontFamily.Monospace,
            fontSize = 30.sp,
            fontWeight = FontWeight.ExtraBold,
            color = Color(0xFF19ADC8)
        ),
        title = TextStyle(
            fontFamily = FontFamily.Monospace,
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF19ADC8),
            textAlign = TextAlign.Center
        ),
        subtitle = TextStyle(
            fontFamily = FontFamily.Monospace,
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF19ADC8),
            textAlign = TextAlign.Center
        ),
        body = TextStyle(
            fontFamily = FontFamily.Monospace,
            fontSize = 18.sp,
            fontWeight = FontWeight.Normal,
            color = Color(0xFF19ADC8),
            textAlign = TextAlign.Center
        )
    )
    CompositionLocalProvider(LocalAppTypography provides typography) {
        content.invoke()
    }
}

object AppTheme {
    val appTypography: AppTypography
        @Composable
        get() = LocalAppTypography.current
}
