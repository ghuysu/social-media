package thanhnhan.myproject.socialmedia.ui.view.ChatScreen

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Clear
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
import kotlinx.coroutines.launch
import kotlinx.coroutines.delay
import androidx.compose.ui.platform.LocalFocusManager
import thanhnhan.myproject.socialmedia.utils.DateTimeUtils

@Composable
fun ChatDetailScreen(
    chatViewModel: ChatViewModel,
    friendId: String,
    authToken: String,
    currentUserId: String
) {
    // Set currentUserId cho ViewModel khi màn hình được tạo
    LaunchedEffect(Unit) {
        chatViewModel.setCurrentUserId(currentUserId)
    }

    val conversationResult by chatViewModel.conversationsResult.collectAsState()
    val sendMessageResult by chatViewModel.sendMessageResult.collectAsState()
    val pendingMessageId by chatViewModel.pendingMessageId.collectAsState()
    val newMessage by chatViewModel.newMessage.collectAsState()
    var message by remember { mutableStateOf(TextFieldValue("")) }

    val scope = rememberCoroutineScope()
    val focusManager = LocalFocusManager.current
    var isSubmitting by remember { mutableStateOf(false) }

    // Thêm LazyListState
    val listState = rememberLazyListState()

    // Tự động cuộn xuống khi có tin nhắn mới
    LaunchedEffect(conversationResult) {
        conversationResult?.let { result ->
            when (result) {
                is Result.Success -> {
                    val conversation = result.data?.metadata?.find { it.friendId == friendId }
                    conversation?.conversation?.size?.let { size ->
                        if (size > 0) {
                            scope.launch {
                                listState.animateScrollToItem(size - 1)
                            }
                        }
                    }
                }
                else -> {}
            }
        }
    }

    // Truy vấn 1 cuộc trò chuyện với bạn bè cụ thể
    LaunchedEffect(friendId) {
        chatViewModel.getCertainConversation(authToken, friendId, skip = 0)
    }

    // Lắng nghe tin nhắn mới và cập nhật cuộc trò chuyện
    LaunchedEffect(newMessage) {
        newMessage?.let { message ->
            // Kiểm tra xem tin nhắn có phải từ cuộc trò chuyện hiện tại không
            if (message.senderId._id == friendId || message.receiverId._id == friendId) {
                chatViewModel.updateConversationWithNewMessage(message)
            }
        }
    }

    LaunchedEffect(Unit) {
        // Lấy danh sách ID tin nhắn chưa đọc
        conversationResult?.let { result ->
            when (result) {
                is Result.Success -> {
                    val conversation = result.data?.metadata?.find { it.friendId == friendId }
                    val unreadMessageIds = conversation?.conversation
                        ?.filter { !it.isRead && it.senderId._id != currentUserId }
                        ?.map { it._id }

                    if (!unreadMessageIds.isNullOrEmpty()) {
                        chatViewModel.readMessages(
                            authToken = authToken,
                            friendId = friendId,
                            messageIds = unreadMessageIds
                        )
                    }
                }
                else -> {}
            }
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
            ) {
                // Header luôn hiển thị ở trên cùng
                when (val result = conversationResult) {
                    is Result.Success -> {
                        val conversation = result.data?.metadata?.find { it.friendId == friendId }
                        ChatHeader(
                            profileImageUrl = conversation?.conversation?.firstOrNull()?.receiverId?.profileImageUrl,
                            fullname = conversation?.conversation?.firstOrNull()?.receiverId?.fullname ?: "Unknown"
                        )
                    }
                    else -> {
                        ChatHeader(
                            profileImageUrl = null,
                            fullname = "Unknown"
                        )
                    }
                }

                // Content chính
                Box(
                    modifier = Modifier
                        .weight(1f) // Chiếm phần còn lại của màn hình
                        .fillMaxWidth()
                ) {
                    when (val result = conversationResult) {
                        is Result.Success -> {
                            val conversation = result.data?.metadata?.find { it.friendId == friendId }
                            if (conversation != null) {
                                LazyColumn(
                                    state = listState,
                                    modifier = Modifier
                                        .fillMaxSize()
                                        .padding(horizontal = 16.dp),
                                    contentPadding = PaddingValues(vertical = 8.dp),
                                    reverseLayout = false
                                ) {
                                    items(
                                        items = conversation.conversation,
                                        key = { message -> message._id }
                                    ) { message ->
                                        val previousMessage = conversation.conversation.getOrNull(
                                            conversation.conversation.indexOf(message) - 1
                                        )

                                        // Hiển thị timestamp nếu cần
                                        if (DateTimeUtils.shouldShowTimestamp(message, previousMessage)) {
                                            MessageTimestamp(message.createdAt)
                                        }

                                        val isLastMessage = message == conversation.conversation.lastOrNull()
                                        val isCurrentUserMessage = message.senderId._id == currentUserId

                                        Column {
                                            MessageItem(
                                                message = message,
                                                currentUserId = currentUserId,
                                                isPending = message._id == pendingMessageId,
                                                isError = sendMessageResult is Result.Error && message._id == pendingMessageId,
                                            )

                                            // Hiển thị trạng thái seen/unseen cho tin nhắn cuối cùng của người dùng hiện tại
                                            if (isLastMessage && isCurrentUserMessage) {
                                                Text(
                                                    text = if (message.isRead) "Seen" else "Unseen",
                                                    color = Color.Gray,
                                                    fontSize = 12.sp,
                                                    modifier = Modifier
                                                        .padding(top = 2.dp, end = 8.dp)
                                                        .align(Alignment.End)
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        is Result.Error -> {
                            Text("Lỗi: ${result.message}", color = Color.Red)
                        }
                        null -> {
                            Text("Đang tải...", color = Color.Gray)
                        }
                    }
                }

                // Input field ở dưới cùng
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .background(Color(0xFF333333), RoundedCornerShape(40.dp))  // Màu nền bên ngoài của TextField
                            .padding(2.dp)  // Khoảng cách giữa Box và TextField
                    ) {
                        TextField(
                            value = message,
                            onValueChange = { message = it },
                            placeholder = { Text("Message ...") },
                            modifier = Modifier.fillMaxWidth(),
                            enabled = !isSubmitting,
                            shape = RoundedCornerShape(40.dp),  // Bo góc cho TextField
                            colors = TextFieldDefaults.colors(
                                focusedContainerColor = Color(0xFFCFCFCF),
                                unfocusedContainerColor = Color(0xFFCFCFCF),
                                disabledContainerColor = Color(0xFFCFCFCF),
                            )
                        )
                    }

                    IconButton(
                        onClick = {
                            if (message.text.isNotBlank() && !isSubmitting) {
                                scope.launch {
                                    try {
                                        isSubmitting = true
                                        // Lưu nội dung tin nhắn
                                        val messageText = message.text

                                        // Clear focus trước
                                        focusManager.clearFocus()

                                        // Đợi một chút để input connection được xử lý
                                        delay(50)

                                        // Clear input
                                        message = TextFieldValue("")

                                        // Đợi thêm một chút trước khi gửi tin nhắn
                                        delay(50)

                                        // Tạo request và gửi tin nhắn
                                        val sendMessageRequest = SendMessageRequest(friendId, messageText)
                                        chatViewModel.sendMessage(authToken, sendMessageRequest)

                                        // Cuộn xuống sau khi gửi tin nhắn
                                        delay(100) // Đợi một chút để tin nhắn được thêm vào
                                        listState.animateScrollToItem(
                                            conversationResult?.let { result ->
                                                when (result) {
                                                    is Result.Success -> {
                                                        result.data?.metadata
                                                            ?.find { it.friendId == friendId }
                                                            ?.conversation?.size?.minus(1) ?: 0
                                                    }
                                                    else -> 0
                                                }
                                            } ?: 0
                                        )
                                    }
                                    finally {
                                        // Đảm bảo reset trạng thái submitting
                                        isSubmitting = false
                                    }
                                }
                            }
                        },
                        modifier = Modifier.padding(start = 8.dp),
                        enabled = message.text.isNotBlank() && !isSubmitting
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.send),
                            contentDescription = "Send",
                            tint = if (message.text.isNotBlank() && !isSubmitting)
                                Color(0xFFCFCFCF)
                            else
                                Color(0xFF666666)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun ChatHeader(
    profileImageUrl: String?,
    fullname: String
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .height(60.dp),
        color = Color(0xFF2D333B) // Màu tối hơn một chút so với background
    ) {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            if (profileImageUrl != null) {
                Image(
                    painter = rememberAsyncImagePainter(profileImageUrl),
                    contentDescription = "Profile Image",
                    modifier = Modifier
                        .size(50.dp)
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

            Spacer(modifier = Modifier.width(12.dp))

            Text(
                text = fullname,
                style = AppTheme.appTypography.title,
                color = Color.White
            )
        }
    }
}

@Composable
fun MessageItem(
    message: Message,
    currentUserId: String,
    isPending: Boolean,
    isError: Boolean,
) {
    val isCurrentUser = message.senderId._id == currentUserId

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 2.dp, horizontal = 8.dp),
        horizontalAlignment = if (isCurrentUser) Alignment.End else Alignment.Start
    ) {
        Box(
            modifier = Modifier
                .widthIn(max = 280.dp) // Giới hạn chiều rộng tối đa
                .background(
                    when {
                        isError -> Color.Red.copy(alpha = 0.7f)
                        isCurrentUser -> Color(0xFF4CAF50)
                        else -> Color(0xFF333333)
                    },
                    RoundedCornerShape(
                        topStart = 16.dp,
                        topEnd = 16.dp,
                        bottomStart = if (isCurrentUser) 16.dp else 4.dp,
                        bottomEnd = if (isCurrentUser) 4.dp else 16.dp
                    )
                )
                .padding(horizontal = 12.dp, vertical = 8.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    text = message.content,
                    color = Color.White
                )

                if (isPending) {
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .background(Color.White, CircleShape)
                    )
                } else if (isError) {
                    Icon(
                        imageVector = Icons.Default.Clear,
                        contentDescription = "Error",
                        tint = Color.White,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun MessageTimestamp(timestamp: String) {
    println("Debug - Timestamp received: $timestamp")
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = DateTimeUtils.formatMessageTime(timestamp),
            color = Color.Gray,
            fontSize = 12.sp,
            modifier = Modifier
                .background(
                    color = Color(0xFF2D333B),
                    shape = RoundedCornerShape(12.dp)
                )
                .padding(horizontal = 12.dp, vertical = 4.dp)
        )
    }
}