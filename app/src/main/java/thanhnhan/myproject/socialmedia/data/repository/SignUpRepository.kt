package thanhnhan.myproject.socialmedia.data.repository

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import okio.IOException
import retrofit2.HttpException
import thanhnhan.myproject.socialmedia.data.model.EmailCheckResponse
import thanhnhan.myproject.socialmedia.data.model.EmailRequest
import thanhnhan.myproject.socialmedia.data.network.Api
import thanhnhan.myproject.socialmedia.data.Result
import thanhnhan.myproject.socialmedia.data.model.UserRequest
import thanhnhan.myproject.socialmedia.data.model.UserResponse

class SignupRepository(
    private val api: Api
) {
    suspend fun checkEmail(email: String): Flow<Result<EmailCheckResponse>> {
        return flow {
            try {
                val response = api.checkEmail(EmailRequest(email))
                emit(Result.Success(response))
            } catch (e: HttpException) {
                val errorMessage = e.response()?.errorBody()?.string()
                emit(Result.Error(message = errorMessage ?: "Error occurred"))
            } catch (e: IOException) {
                emit(Result.Error(message = "Network error: ${e.message}"))
            } catch (e: Exception) {
                emit(Result.Error(message = "Unexpected error: ${e.message}"))
            }
        }
    }

    suspend fun createUser(userRequest: UserRequest): Flow<Result<UserResponse>> {
        return flow {
            try {
                val response = api.createUser(userRequest)
                emit(Result.Success(response))
            } catch (e: HttpException) {
                val errorMessage = e.response()?.errorBody()?.string()
                emit(Result.Error(message = errorMessage ?: "Error occurred"))
            } catch (e: IOException) {
                emit(Result.Error(message = "Network error: ${e.message}"))
            } catch (e: Exception) {
                emit(Result.Error(message = "Unexpected error: ${e.message}"))
            }
        }
    }
}
