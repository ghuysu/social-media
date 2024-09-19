package thanhnhan.myproject.socialmedia.data.model

data class ChangeEmailRequest(
    val newEmail: String
)

data class ChangeEmailResponse(
    val status: Int,
    val message: String
)

data class CheckEmailCodeRequest(
    val newEmail: String,
    val code: Int
)

data class CheckEmailCodeResponse(
    val status: Int,
    val message: String,
    val metadata: Metadata?
) {
    data class Metadata(
        val user: User,
        val signInToken: String
    )

    data class User(
        val _id: String,
        val email: String,
        val fullname: String,
        val birthday: String,
        val profileImageUrl: String,
        val friendList: List<Friend>,
        val friendInvites: List<Friend>,
        val country: String,
        val role: String
    )

    data class Friend(
        val _id: String,
        val fullname: String,
        val profileImageUrl: String
    )
}

