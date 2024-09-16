package thanhnhan.myproject.socialmedia.data.repository

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import okio.IOException
import retrofit2.HttpException
import thanhnhan.myproject.socialmedia.data.network.Api
import thanhnhan.myproject.socialmedia.data.Result
import thanhnhan.myproject.socialmedia.data.model.SignInUserRequest
import thanhnhan.myproject.socialmedia.data.model.SignInUserResponse

class SignInUserRepository(
    private val api: Api
) {
    // Function to sign in user with email and password
    suspend fun signInUser(request: SignInUserRequest): Flow<Result<SignInUserResponse>> {
        return flow {
            try {
                val response = api.signInUser(request)
                emit(Result.Success(response)) // Đảm bảo response là kiểu SignInUserResponse
            } catch (e: HttpException) {
                val errorMessage = e.response()?.errorBody()?.string() ?: "Error occurred"
                emit(Result.Error(message = errorMessage))
            } catch (e: IOException) {
                emit(Result.Error(message = "Network error: ${e.message}"))
            } catch (e: Exception) {
                emit(Result.Error(message = "Unexpected error: ${e.message}"))
            }
        }
    }
}
