package thanhnhan.myproject.socialmedia.ui.view.user_profile

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
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
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.Place
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.rememberAsyncImagePainter
import thanhnhan.myproject.socialmedia.R
import thanhnhan.myproject.socialmedia.data.model.SignInUserResponse
import thanhnhan.myproject.socialmedia.data.model.UserSession
import thanhnhan.myproject.socialmedia.ui.theme.AppTheme

@Composable
fun ProfileScreen() {
    // Lấy thông tin người dùng từ UserSession
    val user = UserSession.user

    if (user != null) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFF22272E))
                .padding(16.dp)
        ) {
            // Profile Section
            ProfileSection(
                userAvatar = user.profileImageUrl,
                userName = user.fullname
            )

            Spacer(modifier = Modifier.height(40.dp))

            // Invite Section
            InviteSection(userAvatar = user.profileImageUrl)

            Spacer(modifier = Modifier.height(16.dp))

            // Settings Section
            SettingsSection()

            Spacer(modifier = Modifier.height(16.dp))

            // Summary Section
            SummarySection()
        }
    } else {
        Text(
            text = "No user data available",
            style = TextStyle(color = Color.White),
            modifier = Modifier.fillMaxSize(),
            textAlign = TextAlign.Center
        )
    }
}

@Composable
fun ProfileSection(
    userAvatar: String,
    userName: String
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 60.dp)
    ) {
        // Profile Icon
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier
                .height(150.dp)
                .width(150.dp)
        ) {
            CircularImageView(
                size = 150,
                url = userAvatar
            )

            Box(
                modifier = Modifier
                    .size(40.dp)
                    .background(AppTheme.appButtonStyle.backgroundColor, CircleShape)
                    .align(Alignment.BottomEnd)
            ) {

                IconButton(
                    onClick = {
                        // TODO: Change avatar
                    }
                ) {
                    Icon(
                        modifier = Modifier
                            .background(color = AppTheme.appButtonStyle.backgroundColor),
                        imageVector = Icons.Default.Add,
                        contentDescription = null
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Display user's name
        Text(
            text = userName,  // Hiển thị tên người dùng từ UserSession
            style = TextStyle(color = Color.White, fontSize = 24.sp)
        )

        Spacer(modifier = Modifier.height(8.dp))

        // Edit Button
        Button(
            onClick = {
                // TODO: Edit username
            },
            colors = ButtonDefaults.buttonColors(
                containerColor = AppTheme.appButtonStyle.backgroundColor,
                disabledContainerColor = Color.Gray,
                disabledContentColor = Color.White
            ),
        ) {
            Text(text = "Edit Username", color = Color.White)
        }
    }
}


@Composable
fun CircularImageView(
    url: String,
    size: Int,
) {
    Image(
        painter = rememberAsyncImagePainter(
            model = url,
            placeholder = painterResource(id = R.drawable.ic_launcher_background)
        ),
        contentDescription = null,
        contentScale = ContentScale.Crop,
        modifier = Modifier
            .size(size.dp)
            .clip(CircleShape)
            .border(
                width = 4.dp,
                color = AppTheme.appButtonStyle.backgroundColor,
                shape = CircleShape
            )
    )
}

@Composable
fun InviteSection(
    userAvatar: String
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFF3C434A), RoundedCornerShape(8.dp))
            .padding(16.dp)
    ) {
        Text(
            text = "Invite friends to join Sky Line",
            style = TextStyle(color = Color.White)
        )
        Spacer(modifier = Modifier.height(8.dp))
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            CircularImageView(
                size = 40,
                url = userAvatar
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "skyline.com/username",
                style = TextStyle(color = Color.Gray)
            )
            Spacer(modifier = Modifier.width(8.dp))
            IconButton(onClick = {
                // TODO: Copy URL
            }) {
                Icon(
                    imageVector = Icons.Default.Share,
                    contentDescription = null,
                    tint = Color.Gray
                )
            }
        }
    }
}

@Composable
fun SettingsSection() {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFF3C434A), RoundedCornerShape(8.dp))
            .padding(16.dp)
    ) {
        SettingItem(
            icon = Icons.Default.Email,
            text = "Change your email",
            onClick = {
                // TODO: Change email
            }
        )
        Divider(color = Color.Gray)
        SettingItem(
            icon = Icons.Default.DateRange,
            text = "Change your birthday",
            onClick = {
                // TODO: Change birthday
            }
        )
        Divider(color = Color.Gray)
        SettingItem(
            icon = Icons.Default.Place,
            text = "Change your country",
            onClick = {
                // TODO: Change country
            }
        )
    }
}

@Composable
fun SummarySection() {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFF3C434A), RoundedCornerShape(8.dp))
            .padding(16.dp)
    ) {
        SettingItem(
            icon = Icons.Default.ExitToApp,
            text = "Sign Out",
            onClick = {
                // TODO: Sign out
            }
        )
        Divider(color = Color.Gray)
        SettingItem(
            icon = Icons.Default.Delete,
            text = "Delete account",
            onClick = {
                // TODO: Delete account
            },
            color = Color.Red
        )
    }
}

@Composable
fun SettingItem(
    icon: ImageVector,
    text: String,
    onClick: () -> Unit,
    color: Color = Color.White
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick.invoke() }
            .padding(vertical = 8.dp)
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = color
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(
            text = text,
            style = TextStyle(color = color),
        )
    }
}


@Preview(showBackground = true)
@Composable
fun ProfileScreenPreview() {
    UserSession.setUserData(
        SignInUserResponse.Metadata.User(
            _id = "12345",
            email = "ndhuynh13@gmail.com",
            fullname = "Nguyen Huynh",
            birthday = "13/07/2003",
            profileImageUrl = "https://via.placeholder.com/150",  // URL ảnh đại diện giả lập
            friendList = listOf(),
            friendInvites = listOf(),
            country = "VN"
        ),
        token = "mockToken"
    )

    ProfileScreen()  // Gọi ProfileScreen với dữ liệu đã giả lập
}
