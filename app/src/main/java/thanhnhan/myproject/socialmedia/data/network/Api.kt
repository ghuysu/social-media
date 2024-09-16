package thanhnhan.myproject.socialmedia.data.network
import retrofit2.http.Body
import retrofit2.http.POST
import thanhnhan.myproject.socialmedia.data.model.EmailCheckResponse
import thanhnhan.myproject.socialmedia.data.model.EmailRequest
import thanhnhan.myproject.socialmedia.data.model.SignInAdminRequest
import thanhnhan.myproject.socialmedia.data.model.SignInAdminResponse
import thanhnhan.myproject.socialmedia.data.model.SignInUserRequest
import thanhnhan.myproject.socialmedia.data.model.SignInUserResponse
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

    @POST("/api/user/sign-in")
    suspend fun signInUser(@Body request: SignInUserRequest): SignInUserResponse

    @POST("/admin/sign-in")
    suspend fun signInAdmin(@Body request: SignInAdminRequest): SignInAdminResponse
}

