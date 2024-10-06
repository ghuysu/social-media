package thanhnhan.myproject.socialmedia.data.repository

import thanhnhan.myproject.socialmedia.data.model.GetUserResponse
import thanhnhan.myproject.socialmedia.data.network.Api
import thanhnhan.myproject.socialmedia.data.Result
    // Hàm lấy thông tin người dùng
class UserRepository(private val api: Api) {

        // Hàm lấy thông tin người dùng
        suspend fun getUser(authToken: String): Result<GetUserResponse> {
            return try {
                val response = api.getUser(authToken)
                Result.Success(response)
            } catch (e: Exception) {
                Result.Error(message = e.message ?: "Unknown error")
            }
        }
    }
