package thanhnhan.myproject.socialmedia.data.model

data class GetUserInfoResponse(
    val status: Int,
    val message: String,
    val metadata: User
) {
    data class User(
        val _id: String,
        val email: String,
        val fullname: String,
        val birthday: String,
        val profileImageUrl: String,
        val friendList: List<SignInUserResponse.Metadata.Friend>,
        val friendInvites: List<FriendInvite>,
        val country: String,
        val isSignedInByGoogle: Boolean,
        val role: String,
        val createdAt: String
    ) {

        data class FriendInvite(
            val _id: String,
            val sender: SignInUserResponse.Metadata.Friend,
            val receiver: SignInUserResponse.Metadata.Friend,
            val createdAt: String
        )
    }
}