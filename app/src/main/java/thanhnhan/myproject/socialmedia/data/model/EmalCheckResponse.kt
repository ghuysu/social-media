package thanhnhan.myproject.socialmedia.data.model

data class EmailRequest(
    val email: String
)
data class EmailCheckResponse(
    val status: Int,
    val message: String,
    val metadata: Metadata?
)

data class Metadata(
    val code: Int?
)