package thanhnhan.myproject.socialmedia.data.model

data class UpdateFeedResponse(
    val status: Int,
    val message: String,
    val metadata: Metadata
) {
    data class Metadata(
        val id: String,
        val description: String,
        val imageUrl: String,
        val visibility: List<String>,
        val userId: UserId,
        val reactions: List<Reaction>,
        val createdAt: String
    ) {
        data class UserId(
            val id: String,
            val fullname: String,
            val profileImageUrl: String
        )

        data class Reaction(
            val id: String,
            val userId: UserId,
            val feedId: String,
            val icon: List<String>,
            val createdAt: String
        )
    }
}

data class EditFeedRequest(
    val description: String,
    val visibility: List<String>
)