package thanhnhan.myproject.socialmedia.ui.theme

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import thanhnhan.myproject.socialmedia.R


//large title
//title
//subtitle
//body

data class AppTypography(
    val largeTitle: TextStyle = TextStyle.Default,
    val title: TextStyle = TextStyle.Default,
    val subtitle: TextStyle = TextStyle.Default,
    val buttonText: TextStyle = TextStyle.Default,
    val reportTitle: TextStyle = TextStyle.Default
)
data class AppButtonStyle(
    val backgroundColor: Color = Color(0xFF19ADC8),
    val contentColor: Color = Color.White,
    val cornerRadius: Int = 50,
    val padding: Int = 16,
    val width: Dp = Dp.Unspecified,  // Thêm thuộc tính width và height
    val height: Dp = 60.dp,
    val textStyle: TextStyle = TextStyle.Default
)
data class AppTextFieldStyle(
    val backgroundColor: Color = Color.Gray,
    val contentColor: Color = Color.White,
    val cornerRadius: Int = 8,
    val padding: Int = 16,
    val textStyle: TextStyle = TextStyle.Default.copy(fontSize = 16.sp)
)
val LocalAppTypography = staticCompositionLocalOf {
    AppTypography()
}

val LocalAppButtonStyle = staticCompositionLocalOf {
    AppButtonStyle()
}
val quicksandFontFamily = FontFamily(
    Font(R.font.quicksand_font, FontWeight.Normal) // Sử dụng tệp font từ res/font
)
val quicksandFontBoldFamily = FontFamily(
    Font(R.font.quicksand_bold, FontWeight.Normal) // Sử dụng tệp font từ res/font
)
val LocalAppTextFieldStyle = staticCompositionLocalOf {
    AppTextFieldStyle()
}
@Composable
fun AppTheme(
    content: @Composable () -> Unit
) {
    val typography = AppTypography(
        largeTitle = TextStyle(
            fontFamily = quicksandFontBoldFamily,
            fontSize = 30.sp,
            fontWeight = FontWeight.ExtraBold,
            color = Color(0xFF19ADC8)
        ),
        title = TextStyle(
            fontFamily = quicksandFontFamily,
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF19ADC8),
            textAlign = TextAlign.Center
        ),
        subtitle = TextStyle(
            fontFamily = quicksandFontFamily,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF19ADC8),
            textAlign = TextAlign.Center
        ),
        reportTitle = TextStyle(
            fontFamily = quicksandFontFamily,
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFFEE0B0B),
            textAlign = TextAlign.Center
        ),
        buttonText = TextStyle(
            fontFamily = quicksandFontBoldFamily,
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
        textStyle = typography.buttonText, // Có thể áp dụng kiểu chữ từ typography
    )
    val textFieldStyle = AppTextFieldStyle(
        backgroundColor = Color.White,
        contentColor = Color.Black,
        cornerRadius = 8,
        padding = 16,
        textStyle = typography.subtitle.copy(fontSize = 16.sp)
    )

    CompositionLocalProvider(LocalAppTypography provides typography, LocalAppButtonStyle provides buttonStyle, LocalAppTextFieldStyle provides textFieldStyle) {
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
    val appTextFieldStyle: AppTextFieldStyle
        @Composable
        get() = LocalAppTextFieldStyle.current
}

@Composable
fun AppTextField(
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val style = AppTheme.appTextFieldStyle
    BasicTextField(
        value = value,
        onValueChange = onValueChange,
        textStyle = style.textStyle,
        modifier = modifier
            .clip(RoundedCornerShape(style.cornerRadius.dp)) // Áp dụng cornerRadius
            .background(style.backgroundColor)
            .padding(style.padding.dp)
    )
}