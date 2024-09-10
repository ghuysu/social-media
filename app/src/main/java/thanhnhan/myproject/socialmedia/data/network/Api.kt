package thanhnhan.myproject.socialmedia.data.network
import retrofit2.http.Body
import retrofit2.http.POST
import thanhnhan.myproject.socialmedia.data.model.EmailVerificationRequest
import thanhnhan.myproject.socialmedia.data.model.EmailVerificationResponse
import thanhnhan.myproject.socialmedia.data.model.SignUpRequest
import thanhnhan.myproject.socialmedia.data.model.SignUpResponse

interface Api {
    companion object {
        const val BASE_URL = "https://skn7vgp9-10000.asse.devtunnels.ms/"
    }

    @POST("api/user/check")
    suspend fun checkEmail(
        @Body emailVerificationRequest: EmailVerificationRequest
    ): EmailVerificationResponse

    @POST("api/user/sign-up")
    suspend fun signUp(@Body request: SignUpRequest): SignUpResponse
}

