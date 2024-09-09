package thanhnhan.myproject.socialmedia.data.model

data class UserRequest(
    val email: String,
    val fullname: String,
    val password: String,
    val country: String,
    val birthday: String
)

data class UserResponse(
    val status: Int,
    val message: String,
    val metadata: Metadata?
) {
    data class Metadata(
        val user: User?
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