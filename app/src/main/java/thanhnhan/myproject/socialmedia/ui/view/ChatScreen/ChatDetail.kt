package thanhnhan.myproject.socialmedia.ui.view.ChatScreen

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.rememberAsyncImagePainter
import thanhnhan.myproject.socialmedia.R
import thanhnhan.myproject.socialmedia.data.model.Message
import thanhnhan.myproject.socialmedia.ui.theme.AppTheme
import thanhnhan.myproject.socialmedia.viewmodel.ChatViewModel
import thanhnhan.myproject.socialmedia.data.Result
import thanhnhan.myproject.socialmedia.data.model.SendMessageRequest

@Composable
fun ChatDetailScreen(
    chatViewModel: ChatViewModel,
    friendId: String,
    authToken: String,
    currentUserId: String
) {
    val conversationResult by chatViewModel.conversationsResult.collectAsState()
    val sendMessageResult by chatViewModel.sendMessageResult.collectAsState()
    val newMessage by chatViewModel.newMessage.collectAsState()
    var message by remember { mutableStateOf(TextFieldValue("")) }

    // Truy vấn 1 cuộc trò chuyện với bạn bè cụ thể
    LaunchedEffect(friendId) {
        chatViewModel.getCertainConversation(authToken, friendId, skip = 0)
    }

    // Lắng nghe tin nhắn mới và cập nhật cuộc trò chuyện
    LaunchedEffect(newMessage) {
        newMessage?.let {
            chatViewModel.updateConversationWithNewMessage(it)
        }
    }

    AppTheme {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFF22272E))
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp)
            ) {
                when (val result = conversationResult) {
                    is Result.Success -> {
                        val conversation = result.data?.metadata?.find { it.friendId == friendId }
                        if (conversation != null) {
                            ChatHeader(
                                profileImageUrl = conversation.conversation.firstOrNull()?.receiverId?.profileImageUrl,
                                fullname = conversation.conversation.firstOrNull()?.receiverId?.fullname ?: "Unknown"
                            )

                            LazyColumn(
                                modifier = Modifier.weight(1f),
                                contentPadding = PaddingValues(vertical = 8.dp)
                            ) {
                                items(conversation.conversation) { message ->
                                    MessageItem(message, currentUserId)
                                }
                            }
                        } else {
                            ChatHeader(
                                profileImageUrl = conversation?.conversation?.firstOrNull()?.receiverId?.profileImageUrl,
                                fullname = conversation?.conversation?.firstOrNull()?.receiverId?.fullname ?: "Unknown"
                            )
                            Text("Không tìm thấy cuộc trò chuyện", color = Color.Gray)
                        }
                    }
                    is Result.Error -> {
                        Text("Lỗi: ${result.message}", color = Color.Red)
                    }
                    null -> {
                        Text("Đang tải...", color = Color.Gray)
                    }
                }

                Spacer(modifier = Modifier.weight(1f)) // Đẩy Row xuống dưới cùng

                // Ô nhập tin nhắn và nút gửi
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextField(
                        value = message,
                        onValueChange = { message = it },
                        placeholder = { Text("Nhập tin nhắn...") },
                        modifier = Modifier
                            .weight(1f)
                            .background(Color(0xFF333333), RoundedCornerShape(8.dp))
                    )
                    IconButton(
                        onClick = {
                            if (message.text.isNotBlank()) {
                                val sendMessageRequest = SendMessageRequest(friendId, message.text)
                                chatViewModel.sendMessage(authToken, sendMessageRequest)
                                message = TextFieldValue("")
                            }
                        },
                        modifier = Modifier.padding(start = 8.dp)
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.send),
                            contentDescription = "Send",
                            tint = Color(0xFFCFCFCF)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun ChatHeader(profileImageUrl: String?, fullname: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        if (profileImageUrl != null) {
            Image(
                painter = rememberAsyncImagePainter(profileImageUrl),
                contentDescription = "Profile Image",
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
                    text = fullname.take(2).uppercase(),
                    color = Color.White,
                    fontSize = 16.sp
                )
            }
        }
        Spacer(modifier = Modifier.width(8.dp))
        Text(
            text = fullname,
            style = AppTheme.appTypography.title,
            color = Color.White
        )
    }
}

@Composable
fun MessageItem(message: Message, currentUserId: String) {
    // Kiểm tra tin nhắn có phải của người dùng hiện tại hay không
    val isCurrentUser = message.senderId?._id == currentUserId
    val backgroundColor = if (isCurrentUser) Color(0xFF4CAF50) else Color(0xFF333333)
    val alignment = if (isCurrentUser) Alignment.End else Alignment.Start

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalAlignment = alignment
    ) {
        Box(
            modifier = Modifier
                .background(backgroundColor, RoundedCornerShape(8.dp))
                .padding(8.dp)
        ) {
            Text(
                text = message.content,
                color = Color.White
            )
        }
    }
}