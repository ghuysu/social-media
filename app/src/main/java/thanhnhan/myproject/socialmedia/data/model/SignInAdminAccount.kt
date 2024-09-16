package thanhnhan.myproject.socialmedia.data.model


data class SignInAdminRequest(
    val email: String,
    val password: String
)

// Phản hồi khi đăng nhập admin
data class SignInAdminResponse(
    val status: Int,
    val message: String,
    val metadata: Metadata?
) {
    data class Metadata(
        val admin: Admin?,
        val signInToken: String?
    ) {
        data class Admin(
            val _id: String,
            val email: String,
            val fullname: String,
            val birthday: String,
            val profileImageUrl: String,
            val role: String, // Admin có thêm thuộc tính role
            val friendList: List<String>,
            val friendInvites: List<String>,
            val country: String
        )
    }
}