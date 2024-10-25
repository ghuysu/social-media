package thanhnhan.myproject.socialmedia.data.model

// Request model
data class ReadMessagesRequest(
    val messageIds: List<String>
)

// Response model
data class ReadMessagesResponse(
    val status: Int,
    val message: String
)
