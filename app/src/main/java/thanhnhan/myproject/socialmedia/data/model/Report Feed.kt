package thanhnhan.myproject.socialmedia.data.model

data class ReportFeedRequest(
    val reason: Int
)

data class ReportFeedResponse(
    val status: Int,
    val message: String
)