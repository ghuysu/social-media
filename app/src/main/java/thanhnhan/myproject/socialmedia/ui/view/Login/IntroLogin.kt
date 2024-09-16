package thanhnhan.myproject.socialmedia.ui.view.Login

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import thanhnhan.myproject.socialmedia.R
import thanhnhan.myproject.socialmedia.ui.theme.AppTheme

class IntroLogin {
    @Composable
    fun LocketIntroScreen() {
        AppTheme {

        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFF22272E))
                .padding(horizontal = 20.dp),
            contentAlignment = Alignment.TopCenter
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Hình ảnh ở trên cùng
                Spacer(modifier = Modifier.height(50.dp))
                Image(
                    painter = painterResource(id = R.drawable.logo),
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

                // Văn bản mô tả
                Text(
                    text = "Share moments with friends",
                    style = AppTheme.appTypography.title
                )

                Spacer(modifier = Modifier.height(150.dp))

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
                        .height(AppTheme.appButtonStyle.height)
                ) {
                    Text(
                        text = "Sign Up",
                        style = AppTheme.appButtonStyle.textStyle
                    )
                }


                // Nút "Đăng nhập"
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
                        .height(AppTheme.appButtonStyle.height)
                ) {
                    Text(
                        text = "Sign In",
                        style = AppTheme.appButtonStyle.textStyle
                    )
                }
            }
        }
    }
    }

    @Preview(showBackground = true)
    @Composable
    fun LocketIntroScreenPreview() {
        LocketIntroScreen()
    }
}