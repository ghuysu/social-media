package thanhnhan.myproject.socialmedia.data.repository

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import retrofit2.HttpException
import thanhnhan.myproject.socialmedia.data.model.SendInviteResponse
import thanhnhan.myproject.socialmedia.data.Result
import thanhnhan.myproject.socialmedia.data.model.SendInviteRequest
import thanhnhan.myproject.socialmedia.data.network.Api
import java.io.IOException

class FriendRepository(
    private val api: Api
) {
    suspend fun sendInvite(authToken: String, userId: String): Flow<Result<SendInviteResponse>> {
        return  flow {
            try {
                val response = api.sendInvite(authToken, SendInviteRequest(userId))
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