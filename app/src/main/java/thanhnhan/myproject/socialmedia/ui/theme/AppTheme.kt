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
    val buttonText: TextStyle = TextStyle.Default,
)
data class AppButtonStyle(
    val backgroundColor: Color = Color(0xFF19ADC8),
    val contentColor: Color = Color.White,
    val cornerRadius: Int = 50,
    val padding: Int = 16,
    val textStyle: TextStyle = TextStyle.Default
)
val LocalAppTypography = staticCompositionLocalOf {
    AppTypography()
}

val LocalAppButtonStyle = staticCompositionLocalOf {
    AppButtonStyle()
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
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF19ADC8),
            textAlign = TextAlign.Center
        ),
        buttonText = TextStyle(
            fontFamily = FontFamily.Monospace,
            fontSize = 18.sp,
            fontWeight = FontWeight.ExtraBold,
            color = Color.White,
            textAlign = TextAlign.Center
        ),
    )
    val buttonStyle = AppButtonStyle(
        backgroundColor = Color(0xFF19ADC8),
        contentColor = Color.White,
        cornerRadius = 50,
        padding = 16,
        textStyle = typography.buttonText // Có thể áp dụng kiểu chữ từ typography
    )

    CompositionLocalProvider(LocalAppTypography provides typography, LocalAppButtonStyle provides buttonStyle) {
        content.invoke()
    }
}

object AppTheme {
    val appTypography: AppTypography
        @Composable
        get() = LocalAppTypography.current
    val appButtonStyle: AppButtonStyle
        @Composable
        get() = LocalAppButtonStyle.current
}
