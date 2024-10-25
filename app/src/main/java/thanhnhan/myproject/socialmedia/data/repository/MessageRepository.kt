package thanhnhan.myproject.socialmedia.data.repository

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import retrofit2.HttpException
import thanhnhan.myproject.socialmedia.data.model.SendMessageRequest
import thanhnhan.myproject.socialmedia.data.model.SendMessageResponse
import thanhnhan.myproject.socialmedia.data.network.Api
import java.io.IOException
import thanhnhan.myproject.socialmedia.data.Result
import thanhnhan.myproject.socialmedia.data.model.ConversationResponse
import thanhnhan.myproject.socialmedia.data.model.GetCertainConversationResponse
import thanhnhan.myproject.socialmedia.data.model.ReadMessagesRequest
import thanhnhan.myproject.socialmedia.data.model.ReadMessagesResponse

class MessageRepository (
    private val api: Api
) {
    suspend fun sendMessage(
        authToken: String,
        sendMessageRequest: SendMessageRequest
    ): Flow<Result<SendMessageResponse>> {
        return flow {
            try {
                // Gửi yêu cầu API để gửi tin nhắn
                val response = api.sendMessage(authToken, sendMessageRequest)
                emit(Result.Success(response)) // Nếu thành công, trả về response

            } catch (e: HttpException) {
                // Lấy thông điệp lỗi từ body của response nếu có
                val errorMessage = e.response()?.errorBody()?.string() ?: "Error occurred"
                emit(Result.Error(message = errorMessage)) // Trả về lỗi HTTP

            } catch (e: IOException) {
                // Xử lý lỗi kết nối mạng
                emit(Result.Error(message = "Network error: ${e.message}"))

            } catch (e: Exception) {
                // Xử lý lỗi bất ngờ
                emit(Result.Error(message = "Unexpected error: ${e.message}"))
            }
        }
    }

    suspend fun readMessages(
        authToken: String,
        readMessagesRequest: ReadMessagesRequest
    ): Flow<Result<ReadMessagesResponse>> {
        return flow {
            try {
                val response = api.readMessages(authToken, readMessagesRequest)

                emit(Result.Success(response)) // Nếu thành công, trả về response

            } catch (e: HttpException) {
                // Lấy thông điệp lỗi từ body của response nếu có
                val errorMessage = e.response()?.errorBody()?.string() ?: "Error occurred"
                emit(Result.Error(message = errorMessage)) // Trả về lỗi HTTP

            } catch (e: IOException) {
                // Xử lý lỗi kết nối mạng
                emit(Result.Error(message = "Network error: ${e.message}"))

            } catch (e: Exception) {
                // Xử lý lỗi bất ngờ
                emit(Result.Error(message = "Unexpected error: ${e.message}"))
            }
        }
    }

    suspend fun getAllConversations(
        authToken: String
    ): Flow<Result<ConversationResponse>> {
        return flow {
            try {
                val response = api.getAllConservation(authToken)
                emit(Result.Success(response)) // Nếu thành công, trả về response

            } catch (e: HttpException) {
                // Lấy thông điệp lỗi từ body của response nếu có
                val errorMessage = e.response()?.errorBody()?.string() ?: "Error occurred"
                emit(Result.Error(message = errorMessage)) // Trả về lỗi HTTP

            } catch (e: IOException) {
                // Xử lý lỗi kết nối mạng
                emit(Result.Error(message = "Network error: ${e.message}"))

            } catch (e: Exception) {
                // Xử lý lỗi bất ngờ
                emit(Result.Error(message = "Unexpected error: ${e.message}"))
            }
        }
    }
    // Hàm lấy conversation theo friendId
    suspend fun getConversationByFriendId(authToken: String, friendId: String, skip: Int): Flow<Result<GetCertainConversationResponse>> {
        return flow {
            try {
                val response = api.getConversationByFriendId(authToken, friendId, skip)
                println("API Response: $response") // Add this line
                emit(Result.Success(response))
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

