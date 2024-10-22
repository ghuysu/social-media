package thanhnhan.myproject.socialmedia.data.model

data class CommentResponse(
    val status: Int,
    val message: String,
    val metadata: Message
) {
    data class Message(
        val _id: String,
        val senderId: User,
        val receiverId: User,
        val content: String,
        val isRead: Boolean,
        val createdAt: String
    ) {
        data class User(
            val _id: String,
            val fullname: String,
            val profileImageUrl: String
        )
    }
}

data class CommentRequest(
    val receiverId: String,
    val content: String,
    val feedId: String
)