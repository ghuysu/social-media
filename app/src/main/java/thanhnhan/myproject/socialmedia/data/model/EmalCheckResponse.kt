package thanhnhan.myproject.socialmedia.data.model

data class EmailVerificationRequest(
    val email: String
)
data class EmailVerificationResponse(
    val status: Int,
    val message: String
)