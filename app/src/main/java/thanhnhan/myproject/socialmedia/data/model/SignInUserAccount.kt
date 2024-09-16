package thanhnhan.myproject.socialmedia.data.model

// Request model for signing in a user
data class SignInUserRequest(
    val email: String,
    val password: String
)

// Response model for handling the sign-in response
data class SignInUserResponse(
    val status: Int,
    val message: String,
    val metadata: Metadata?
) {
    data class Metadata(
        val user: User?,
        val signInToken: String?
    ) {
        data class User(
            val _id: String,
            val email: String,
            val fullname: String,
            val birthday: String,
            val profileImageUrl: String,
            val friendList: List<String>,
            val friendInvites: List<String>,
            val country: String
        )
    }
}

