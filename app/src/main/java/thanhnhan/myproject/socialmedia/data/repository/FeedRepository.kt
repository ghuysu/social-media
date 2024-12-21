package thanhnhan.myproject.socialmedia.data.repository

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.HttpException
import thanhnhan.myproject.socialmedia.data.model.CreateFeedResponse
import thanhnhan.myproject.socialmedia.data.network.Api
import thanhnhan.myproject.socialmedia.data.Result
import thanhnhan.myproject.socialmedia.data.model.CommentRequest
import thanhnhan.myproject.socialmedia.data.model.CommentResponse
import thanhnhan.myproject.socialmedia.data.model.DeleteFeedResponse
import thanhnhan.myproject.socialmedia.data.model.EditFeedRequest
import thanhnhan.myproject.socialmedia.data.model.GetEveryoneFeedsResponse
import thanhnhan.myproject.socialmedia.data.model.GetUserInfoResponse
import thanhnhan.myproject.socialmedia.data.model.IconRequest
import thanhnhan.myproject.socialmedia.data.model.ReactFeedResponse
import thanhnhan.myproject.socialmedia.data.model.ReportFeedRequest
import thanhnhan.myproject.socialmedia.data.model.ReportFeedResponse
import thanhnhan.myproject.socialmedia.data.model.ReportUserRequest
import thanhnhan.myproject.socialmedia.data.model.ReportUserResponse
import thanhnhan.myproject.socialmedia.data.model.UpdateFeedResponse
import java.io.File
import java.io.IOException

class FeedRepository(private val api: Api) {

    suspend fun createFeed(
        authToken: String,
        imageFile: File,
        description: String,
        visibility: List<String>
    ): Flow<Result<CreateFeedResponse>> {
        return flow {
            try {
                if (!imageFile.exists() || !imageFile.isFile || !imageFile.name.matches(Regex(".*\\.(jpg|jpeg|png)$"))) {
                    emit(Result.Error(message = "Invalid image file"))
                    return@flow
                }

                val requestBody = RequestBody.create("image/jpeg".toMediaTypeOrNull(), imageFile)
                val imagePart = MultipartBody.Part.createFormData("image", imageFile.name, requestBody)

                val descriptionPart = RequestBody.create("text/plain".toMediaTypeOrNull(), description)

                // Convert visibility list to MultipartBody.Part list
                val visibilityParts = visibility.map {
                    MultipartBody.Part.createFormData("visibility[]", it)
                }

                val response = api.createFeed(authToken, imagePart, descriptionPart, visibilityParts)
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

    suspend fun getEveryoneFeeds(authToken: String, skip: Int): Flow<Result<GetEveryoneFeedsResponse>> {
        return flow {
            try {
                val response = api.getEveryoneFeeds(authToken, skip)
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

    suspend fun getUser(authToken: String): Flow<Result<GetUserInfoResponse>> {
        return flow {
            try {
                val response = api.getUserInfo(authToken)
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

    suspend fun updateFeed(
        authToken: String,
        feedId: String,
        description: String,
        visibility: List<String>
    ): Flow<Result<UpdateFeedResponse>> {
        return flow {
            try {
                val response = api.updateFeed(authToken, feedId, EditFeedRequest(description, visibility))
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

    suspend fun reactToFeed(authToken: String, feedId: String, icon: String): Flow<Result<ReactFeedResponse>> {
        return flow {
            try {
                val response = api.reactToFeed(authToken, feedId, IconRequest(icon))
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

    suspend fun comment(authToken: String, receiverId: String, content: String, feedId: String): Flow<Result<CommentResponse>> {
        return flow {
            try {
                val response = api.sendMessage(authToken, CommentRequest(receiverId, content, feedId))
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

    suspend fun reportUser(authToken: String, userId: String, reason: Int): Flow<Result<ReportUserResponse>> {
        return flow {
            try {
                val request = ReportUserRequest(reason)
                val response = api.reportUser(authToken, userId, request)
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

    suspend fun reportFeed(authToken: String, feedId: String, reason: Int): Flow<Result<ReportFeedResponse>> {
        return flow {
            try {
                val request = ReportFeedRequest(reason)
                val response = api.reportFeed(authToken, feedId, request)
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

    suspend fun deleteFeed(authToken: String, feedId: String): Flow<Result<DeleteFeedResponse>> {
        return flow {
            try {
                val response = api.deleteFeed(authToken, feedId)
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