package thanhnhan.myproject.socialmedia.data.model

// GetCertainConversationResponse.kt
data class GetCertainConversationResponse(
    val status: Int,                        // Trạng thái của API (200)
    val message: String,                     // Thông báo từ API
    val metadata: List<Message>              // Danh sách các tin nhắn trong cuộc trò chuyện
)