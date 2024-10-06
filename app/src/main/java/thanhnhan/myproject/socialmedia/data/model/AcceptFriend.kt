package thanhnhan.myproject.socialmedia.data.model

data class AcceptFriendResponse(
    val status: Int,
    val message: String,
    val metadata: Metadata?
) {
    data class Metadata(
        val _id: String,
        val email: String,
        val fullname: String,
        val birthday: String,
        val profileImageUrl: String,
        val friendList: List<Friend>,
        val friendInvites: List<FriendInvite>,
        val country: String,
        val role: String
    )

    data class Friend(
        val _id: String,
        val fullname: String,
        val profileImageUrl: String
    )
    data class FriendInvite(
        val _id: String,
        val sender: GetUserResponse.Friend,
        val receiver: GetUserResponse.Friend,
        val createdAt: String
    )
}