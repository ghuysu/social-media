package thanhnhan.myproject.socialmedia.data.model

// Định nghĩa class Friend với trường isClicked
data class VisibleFriend(
    val _id: String,
    val fullname: String,
    val profileImageUrl: String,
    var isClicked: Boolean = false
)

// Hàm để chuyển đổi listFriend thành listFriend có thêm giá trị isClicked để dùng trong visibility
fun convertFriendList(oldList: List<SignInUserResponse.Metadata.Friend>): List<VisibleFriend> {
    return oldList.map { friend ->
        VisibleFriend(
            _id = friend._id,
            fullname = friend.fullname,
            profileImageUrl = friend.profileImageUrl
        )
    }
}

data class CreateFeedResponse(
    val status: Int,
    val message: String,
    val metadata: Metadata?
) {
    data class Metadata(
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
            val userId: String
        )
    }
}

