package thanhnhan.myproject.socialmedia.data.model

data class User(
    val id: String,
    val email: String,
    val fullname: String,
    val birthday: String,
    val token: String,
    val profileImageUrl: String,
    val country: String
)