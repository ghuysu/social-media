package thanhnhan.myproject.socialmedia.data.model

import android.util.Log
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

// Request model for signing in a user
data class SignInUserRequest(
    val email: String,
    val password: String
)
data class GoogleSignInRequest(
    val token: String
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
            var friendInvites: List<FriendInvite>,
            var country: String
        )

        data class Friend(
            val _id: String,
            val fullname: String,
            val profileImageUrl: String,
        )

        data class FriendInvite(
            val _id: String,
            val sender: Friend,
            val receiver: Friend,
            val createdAt: String
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
        // Thêm log để kiểm tra giá trị của token
        Log.d("UserSession", "setUserData - User: ${user?.fullname}, Token: $token")
    }

    // Hàm để xóa thông tin người dùng và token khi đăng xuất
    fun clearSession() {
        user = null
        signInToken = null
    }
    private val _friendListFlow = MutableStateFlow<List<SignInUserResponse.Metadata.Friend>>(emptyList())
    val friendListFlow: StateFlow<List<SignInUserResponse.Metadata.Friend>> = _friendListFlow

    private val _friendInvitesFlow = MutableStateFlow<List<SignInUserResponse.Metadata.FriendInvite>>(emptyList())
    val friendInvitesFlow: StateFlow<List<SignInUserResponse.Metadata.FriendInvite>> = _friendInvitesFlow

    fun updateFriends(friendList: List<SignInUserResponse.Metadata.Friend>) {
        _friendListFlow.value = friendList
    }

    fun updateFriendInvites(friendInvites: List<SignInUserResponse.Metadata.FriendInvite>) {
        _friendInvitesFlow.value = friendInvites
    }

    fun updateFriendInvites(newFriendInvite: SignInUserResponse.Metadata.FriendInvite) {
        user?.friendInvites = user?.friendInvites?.toMutableList()?.apply {
            add(newFriendInvite)
        } ?: listOf(newFriendInvite)
    }
}

