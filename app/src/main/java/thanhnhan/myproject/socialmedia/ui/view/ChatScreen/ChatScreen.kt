package thanhnhan.myproject.socialmedia.ui.view.ChatScreen
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.rememberAsyncImagePainter
import thanhnhan.myproject.socialmedia.R
import thanhnhan.myproject.socialmedia.ui.theme.AppTheme
import androidx.navigation.NavController
import thanhnhan.myproject.socialmedia.viewmodel.ChatViewModel
import thanhnhan.myproject.socialmedia.data.Result
import thanhnhan.myproject.socialmedia.data.model.Conversation
import thanhnhan.myproject.socialmedia.viewmodel.UserViewModel

@Composable
fun ChatScreen(
    chatViewModel: ChatViewModel,
    userViewModel: UserViewModel,
    authToken: String,
    navController: NavController
) {
    val conversationsResult by chatViewModel.conversationsResult.collectAsState()
    val friends = userViewModel.getFriends().filterNotNull() // Lọc bạn bè bị null

    LaunchedEffect(Unit) {
        chatViewModel.getAllConversations(authToken)
    }

    AppTheme {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFF22272E))
                .padding(16.dp)
        ) {
            Header("Tin nhắn của bạn")

            Spacer(modifier = Modifier.height(16.dp))

            when (val result = conversationsResult) {
                is Result.Success -> {
                    val conversations = result.data?.metadata ?: emptyList()

                    LazyColumn {
                        items(conversations) { conversation ->
                            val friend = friends.find { it._id == conversation.friendId }
                            val lastMessage = conversation.conversation.firstOrNull()?.content ?: "Bạn không có cuộc trò chuyện nào"
                            val friendName = friend?.fullname ?: "Unknown"
                            val friendProfileImageUrl = friend?.profileImageUrl

                            ConversationItem(
                                friendName = friendName,
                                friendProfileImageUrl = friendProfileImageUrl,
                                lastMessage = lastMessage,
                                navController = navController,
                                friendId = conversation.friendId
                            )
                        }
                    }
                }
                is Result.Error -> {
                    Text("Lỗi: ${result.message}", color = Color.Red)
                }
                else -> {
                    Text("Đang tải...", color = Color.Gray)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

@Composable
fun Header(title: String) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.fillMaxWidth()
    ) {
        Text(
            text = title,
            style = AppTheme.appTypography.largeTitle,
            color = Color.White
        )
        Spacer(modifier = Modifier.height(20.dp))
    }
}
@Composable
fun ConversationItem(
    friendName: String,
    friendProfileImageUrl: String?,
    lastMessage: String,
    navController: NavController,
    friendId: String
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 10.dp)
            .clickable {
                // Điều hướng tới ChatDetail và truyền friendId
                navController.navigate("chatDetail/$friendId")
            },
        verticalAlignment = Alignment.CenterVertically
    ) {
        if (friendProfileImageUrl != null) {
            Image(
                painter = rememberAsyncImagePainter(friendProfileImageUrl),
                contentDescription = friendName,
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(Color.Gray)
            )
        } else {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .background(Color.Gray, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = friendName.take(2).uppercase(),
                    color = Color.White,
                    fontSize = 16.sp
                )
            }
        }

        Column(
            modifier = Modifier
                .weight(1f)
                .padding(start = 15.dp)
        ) {
            Text(
                text = friendName,
                style = AppTheme.appTypography.title.copy(textAlign = TextAlign.Start)
            )
            Text(
                text = lastMessage,
                style = AppTheme.appTypography.subtitle,
                color = Color.Gray
            )
        }

        IconButton(
            onClick = { },
            modifier = Modifier.size(30.dp)
        ) {
            Icon(
                painter = painterResource(id = R.drawable.chevron),
                contentDescription = "Enter Chat",
                tint = Color.Gray,
                modifier = Modifier.size(20.dp)
            )
        }
    }
}
