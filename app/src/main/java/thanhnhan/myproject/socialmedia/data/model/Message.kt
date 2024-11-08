package thanhnhan.myproject.socialmedia.data.model

data class Message(
    val _id: String,
    val senderId: Friend,
    val receiverId: Friend,
    val content: String,
    val isRead: Boolean,
    val createdAt: String,
    //val feedId: String? = null  // co the null
)

data class Friend(
    val _id: String,
    val fullname: String,
    val profileImageUrl: String
)
data class SendMessageRequest(
    val receiverId: String, // ID người nhận tin nhắn hoặc comment
    val content: String, // Nội dung tin nhắn/comment
    //val feedId: String? = null // Optional: Nếu là comment vào feed, sẽ có feedId
)
data class SendMessageResponse(
    val status: Int, // 201
    val message: String, // "Created message successfully."
    val metadata: Message // Thông tin chi tiết của tin nhắn
)
