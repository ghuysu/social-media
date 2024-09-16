package thanhnhan.myproject.socialmedia.data.repository

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import okio.IOException
import retrofit2.HttpException
import thanhnhan.myproject.socialmedia.data.model.SignInAdminRequest
import thanhnhan.myproject.socialmedia.data.model.SignInAdminResponse
import thanhnhan.myproject.socialmedia.data.network.Api
import thanhnhan.myproject.socialmedia.data.Result

class SignInAdminRepository(
    private val api: Api
) {
    suspend fun signInAdmin(request: SignInAdminRequest): Flow<Result<SignInAdminResponse>> {
        return flow {
            try {
                val response = api.signInAdmin(request) // Truyền request vào API
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
