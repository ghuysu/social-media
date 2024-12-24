package thanhnhan.myproject.socialmedia.data.model

sealed interface IMessage {
    val _id: String
    val senderId: Friend
    val receiverId: Friend
    val content: String
    val isRead: Boolean
    val createdAt: String
    
    fun copyWithRead(isRead: Boolean): IMessage
}

data class Message(
    override val _id: String,
    override val senderId: Friend,
    override val receiverId: Friend,
    override val content: String,
    override val isRead: Boolean,
    override val createdAt: String
) : IMessage {
    override fun copyWithRead(isRead: Boolean): IMessage = copy(isRead = isRead)
}

data class Friend(
    val _id: String,
    val fullname: String,
    val profileImageUrl: String
)
data class SendMessageRequest(
    val receiverId: String,
    val content: String,
    val feedId: String? = null
)
data class SendMessageResponse(
    val status: Int,
    val message: String,
    val metadata: Message
)

data class MessageWithFeed(
    override val _id: String,
    override val senderId: Friend,
    override val receiverId: Friend,
    override val content: String,
    override val isRead: Boolean,
    override val createdAt: String,
    val feedId: Feed? = null
) : IMessage {
    override fun copyWithRead(isRead: Boolean): IMessage = copy(isRead = isRead)
    
    data class Feed(
        val _id: String,
        val description: String,
        val imageUrl: String
    )
}
