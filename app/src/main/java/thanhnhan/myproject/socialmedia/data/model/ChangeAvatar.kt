package thanhnhan.myproject.socialmedia.data.model

import okhttp3.MultipartBody

data class ChangeAvatarRequest(
    val avatar: MultipartBody.Part // sử dụng File hay MultipartBody ??
)

data class ChangeAvatarResponse(
    val status: Int,
    val message: String,
    val metadata: Metadata
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
        val role: String
    )

    data class Friend(
        val _id: String,
        val fullname: String,
        val profileImageUrl: String
    )
}