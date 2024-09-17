package thanhnhan.myproject.socialmedia.data.model

data class SignUpRequest(
    val code: Int,
    val email: String,
    val fullname: String,
    val password: String,
    val country: String,
    val birthday: String
)

data class SignUpResponse(
    val status: Int,
    val message: String
)
