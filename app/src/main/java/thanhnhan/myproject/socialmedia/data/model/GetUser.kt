package thanhnhan.myproject.socialmedia.data.model

data class GetUserResponse(
    val status: Int,
    val message: String,
    val metadata: Metadata
) {
    data class Metadata(
        val _id: String,
        val fullname: String,
        val email: String,
        val profileImageUrl: String,
        val birthday: String,
        val country: String,
        val friendList: List<Friend>,
        val friendInvites: List<FriendInvite>
    )

    data class Friend(
        val _id: String,
        val fullname: String,
        val profileImageUrl: String?
    )
    data class FriendInvite(
        val _id: String,
        val sender: Friend,
        val receiver: Friend,
        val createdAt: String
    )
}
