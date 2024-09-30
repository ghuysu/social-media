package thanhnhan.myproject.socialmedia.data.network
import okhttp3.MultipartBody
import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.Multipart
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Part
import thanhnhan.myproject.socialmedia.data.model.ChangeAvatarRequest
import thanhnhan.myproject.socialmedia.data.model.ChangeAvatarResponse

import thanhnhan.myproject.socialmedia.data.model.SignInUserRequest
import thanhnhan.myproject.socialmedia.data.model.SignInUserResponse
import thanhnhan.myproject.socialmedia.data.model.ChangeBirthdayRequest
import thanhnhan.myproject.socialmedia.data.model.ChangeBirthdayResponse
import thanhnhan.myproject.socialmedia.data.model.ChangeCountryRequest
import thanhnhan.myproject.socialmedia.data.model.ChangeCountryResponse
import thanhnhan.myproject.socialmedia.data.model.ChangeEmailRequest
import thanhnhan.myproject.socialmedia.data.model.ChangeEmailResponse
import thanhnhan.myproject.socialmedia.data.model.ChangeFullnameRequest
import thanhnhan.myproject.socialmedia.data.model.ChangeFullnameResponse
import thanhnhan.myproject.socialmedia.data.model.CheckEmailCodeRequest
import thanhnhan.myproject.socialmedia.data.model.CheckEmailCodeResponse

import thanhnhan.myproject.socialmedia.data.model.EmailVerificationRequest
import thanhnhan.myproject.socialmedia.data.model.EmailVerificationResponse
import thanhnhan.myproject.socialmedia.data.model.SendInviteRequest
import thanhnhan.myproject.socialmedia.data.model.SendInviteResponse
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

    @POST("/api/user/sign-in")
    suspend fun signInUser(@Body request: SignInUserRequest): SignInUserResponse

    @PATCH("api/user/birthday")
    suspend fun changeBirthday(
        @Header("authorization") authToken: String,
        @Body request: ChangeBirthdayRequest
    ): ChangeBirthdayResponse

    @PATCH("api/user/country")
    suspend fun changeCountry(
        @Header("authorization") authToken: String,
        @Body request: ChangeCountryRequest
    ): ChangeCountryResponse

    @POST("api/user/email")
    suspend fun changeEmail(
        @Header("authorization") authToken: String,
        @Body request: ChangeEmailRequest
    ): ChangeEmailResponse

    @PATCH("api/user/email/check")
    suspend fun checkEmailCode(
        @Header("authorization") authToken: String,
        @Body request: CheckEmailCodeRequest
    ): CheckEmailCodeResponse

    @PATCH("api/user/fullname")
    suspend fun changeFullname(
        @Header("authorization") authToken: String,
            @Body request: ChangeFullnameRequest
    ): ChangeFullnameResponse

    @Multipart
    @PATCH("api/user/profile-image")
    suspend fun changeAvatar(
        @Header("authorization") authToken: String,
        @Part avatar: MultipartBody.Part
    ): ChangeAvatarResponse
    @PATCH("api/user/invite/add")
    suspend fun sendInvite(
        @Header("authorization") authToken: String,
        @Body request: SendInviteRequest
    ): SendInviteResponse
}

