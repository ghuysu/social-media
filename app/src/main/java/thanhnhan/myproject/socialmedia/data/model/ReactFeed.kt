package thanhnhan.myproject.socialmedia.data.model

data class ReactFeedResponse(
    val status: Int,
    val message: String,
    val metadata: Feed
) {
    data class Feed(
        val _id: String,
        val description: String,
        val imageUrl: String,
        val userId: User,
        val createdAt: String,
        val reactions: List<Reaction>
    ) {
        data class User(
            val _id: String,
            val fullname: String,
            val profileImageUrl: String
        )

        data class Reaction(
            val _id: String,
            val userId: User,
            val feedId: String,
            val icon: List<String>,
            val createdAt: String
        )
    }
}

data class IconRequest(
    val icon: String
)