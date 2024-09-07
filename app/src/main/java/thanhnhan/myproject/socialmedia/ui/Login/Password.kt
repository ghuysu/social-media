package thanhnhan.myproject.socialmedia.ui.Login

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import thanhnhan.myproject.socialmedia.R
import thanhnhan.myproject.socialmedia.ui.theme.AppTheme

class Password {
    @Composable
    fun entryPassword() {
        AppTheme {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xFF22272E))
                    .padding(horizontal = 30.dp),
                contentAlignment = Alignment.TopCenter
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Spacer(modifier = Modifier.height(50.dp))
                    // Hình ảnh ở trên cùng
                    Image(
                        painter = painterResource(id = R.drawable.logo), // Thay thế `your_image` bằng id của hình ảnh bạn sử dụng
                        contentDescription = "Avatar",
                        modifier = Modifier
                            .size(200.dp)
                            .clip(CircleShape)
                    )
                    Text(
                        text = "SkyLine",
                        style = AppTheme.appTypography.largeTitle
                    )

                    Spacer(modifier = Modifier.height(50.dp))

                    Text(
                        text = "Enter Password ",
                        style = AppTheme.appTypography.title,  // Sử dụng style từ AppTheme
                        modifier = Modifier
                            .fillMaxWidth()    // Đảm bảo Text lấp đầy chiều rộng nếu cần
                            .padding(start = 0.dp, end = 150.dp)  // Điều chỉnh padding từ AppTheme
                    )
                    Spacer(modifier = Modifier.height(20.dp))

                    var email by remember { mutableStateOf("") }

                    @OptIn(ExperimentalMaterial3Api::class)
                    (TextField(
        value = email,
        onValueChange = { email = it },
        placeholder = { Text("Enter your password", color = Color.Gray) },
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 0.dp),
//                    colors = TextFieldDefaults.textFieldColors(
//                        textColor = Color.White, // Màu chữ của văn bản nhập liệu
//                        containerColor = Color(0xFF333940), // Màu nền của TextField
//                        cursorColor = Color.White, // Màu của con trỏ khi nhập liệu
//                        focusedIndicatorColor = Color.Transparent, // Màu viền khi TextField được focus
//                        unfocusedIndicatorColor = Color.Transparent // Màu viền khi TextField không được focus
//                    )
    ))
                    Spacer(modifier = Modifier.height(30.dp))

                    Text(
                        text = buildAnnotatedString {
                            append("Your password must be at least ")
                            withStyle(style = SpanStyle(color = Color(0xFF19ADC8))) { // Mã màu cho "8 characters"
                                append("8 characters")
                            }
                        },
                        style = AppTheme.appTypography.subtitle.copy(color = Color.White), // Toàn bộ text màu trắng
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(250.dp))

                    Button(
                        onClick = { /* TODO: Add your logic here */ },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = AppTheme.appButtonStyle.backgroundColor,
                            contentColor = AppTheme.appButtonStyle.contentColor
                        ),
                        shape = RoundedCornerShape(AppTheme.appButtonStyle.cornerRadius.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(AppTheme.appButtonStyle.padding.dp)
                    ) {
                        Text(
                            text = "Continue",
                            style = AppTheme.appButtonStyle.textStyle
                        )
                    }
                }
            }
        }
    }

    @Preview(showBackground = true)
    @Composable
    fun LocketSignInScreenPreview() {
        entryPassword()
    }
}