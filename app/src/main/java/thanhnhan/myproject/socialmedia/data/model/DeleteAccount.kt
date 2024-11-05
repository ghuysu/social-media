package thanhnhan.myproject.socialmedia.data.model

data class DeleteAccountRequest(
    val code: Int
)

data class DeleteAccountResponse(
    val status: Int,
    val message: String
)