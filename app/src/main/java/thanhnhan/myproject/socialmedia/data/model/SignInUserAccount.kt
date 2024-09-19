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
            var email: String,
            var fullname: String,
            var birthday: String,
            var profileImageUrl: String,
            var friendList: List<Friend>,
            var friendInvites: List<Friend>,
            var country: String
        )

        data class Friend(
            val _id: String,
            val fullname: String,
            val profileImageUrl: String,
        )
    }
}

object UserSession {
    var user: SignInUserResponse.Metadata.User? = null
    var signInToken: String? = null

    // Hàm để đặt thông tin người dùng và token sau khi đăng nhập thành công
    fun setUserData(user: SignInUserResponse.Metadata.User?, token: String?) {
        this.user = user
        this.signInToken = token
    }

    // Hàm để xóa thông tin người dùng và token khi đăng xuất
    fun clearSession() {
        user = null
        signInToken = null
    }

    // Hàm kiểm tra xem người dùng đã đăng nhập chưa
    fun isLoggedIn(): Boolean {
        return user != null && signInToken != null
    }
}

