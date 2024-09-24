package thanhnhan.myproject.socialmedia.data.model

data class ChangeFullnameRequest(
    val fullname: String,
)

data class ChangeFullnameResponse(
    val status: Int,
    val message: String,
    val metadata: Metadata,
) {
    data class Metadata(
        val _id: String,
        val email: String,
        val fullname: String,
        val birthday: String,
        val profileImageUrl: String,
        val friendList: List<Friend>,
        val friendInvites: List<Friend>,
        val country: String,
        val role: String,
    )

    data class Friend(
        val _id: String,
        val fullname: String,
        val profileImageUrl: String,
    )
}




