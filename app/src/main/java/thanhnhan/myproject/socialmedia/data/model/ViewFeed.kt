package thanhnhan.myproject.socialmedia.data.model

data class GetEveryoneFeedsResponse(
    val status: Int,
    val message: String,
    val metadata: List<Feed>
) {
    data class Feed(
        val _id: String,
        val description: String,
        val imageUrl: String,
        val visibility: List<String>,
        val userId: User,
        val reactions: List<Reaction>,
        val createdAt: String
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

data class GetUserFeedsResponse(
    val status: Int,
    val message: String,
    val metadata: List<Feed>
) {
    data class Feed(
        val _id: String,
        val description: String,
        val imageUrl: String,
        val userId: User,
        val reactions: List<Reaction>,
        val createdAt: String
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