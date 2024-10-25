package thanhnhan.myproject.socialmedia.data.model

// Thông tin của người dùng gửi hoặc nhận
// Cuộc trò chuyện với một người bạn cụ thể
data class Conversation(
    val friendId: String,       // ID của người bạn
    val conversation: List<Message> // Danh sách các tin nhắn giữa hai người
)

// Response trả về từ API
data class ConversationResponse(
    val status: Int,
    val message: String,
    val metadata: List<Conversation>
)