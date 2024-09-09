package thanhnhan.myproject.socialmedia.data.network
import retrofit2.http.Body
import retrofit2.http.POST
import thanhnhan.myproject.socialmedia.data.model.EmailCheckResponse
import thanhnhan.myproject.socialmedia.data.model.EmailRequest
import thanhnhan.myproject.socialmedia.data.model.UserRequest
import thanhnhan.myproject.socialmedia.data.model.UserResponse

interface Api {
    companion object {
        const val BASE_URL = "https://skn7vgp9-10000.asse.devtunnels.ms/"
    }

    @POST("api/user/email/check")
    suspend fun checkEmail(
        @Body emailRequest: EmailRequest
    ): EmailCheckResponse

    @POST("api/user/sign-up")
    suspend fun createUser(
        @Body userRequest: UserRequest
    ): UserResponse
}

