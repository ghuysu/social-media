package thanhnhan.myproject.socialmedia.data.model

data class ReportUserRequest(
    val reason: Int
)

data class ReportUserResponse(
    val status: Int,
    val message: String
)