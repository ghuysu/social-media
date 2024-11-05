package thanhnhan.myproject.socialmedia.data.repository

import android.util.Log
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import okhttp3.MultipartBody
import okio.IOException
import retrofit2.HttpException
import thanhnhan.myproject.socialmedia.data.network.Api
import thanhnhan.myproject.socialmedia.data.Result
import thanhnhan.myproject.socialmedia.data.model.ChangeAvatarResponse
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
import thanhnhan.myproject.socialmedia.data.model.DeleteAccountRequest
import thanhnhan.myproject.socialmedia.data.model.DeleteAccountResponse
import thanhnhan.myproject.socialmedia.data.model.SendCodeDeleteAccountResponse


class UserProfileRepository(
    private val api: Api
) {
    suspend fun changeBirthday(
        authToken: String,
        birthday: String
    ): Flow<Result<ChangeBirthdayResponse>> {
        return flow {
            try {
                val response = api.changeBirthday(authToken, ChangeBirthdayRequest(birthday))
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

    suspend fun changeCountry(
        authToken: String,
        country: String
    ): Flow<Result<ChangeCountryResponse>> {
        return flow {
            try {
                val response = api.changeCountry(authToken, ChangeCountryRequest(country))
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

    suspend fun changeEmail(
        authToken: String,
        newEmail: String
    ): Flow<Result<ChangeEmailResponse>> {
        return flow {
            try {
                val response = api.changeEmail(authToken, ChangeEmailRequest(newEmail))
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

    suspend fun checkEmailCode(
        authToken: String,
        newEmail: String,
        code: Int
    ): Flow<Result<CheckEmailCodeResponse>> {
        return flow {
            try {
                val response = api.checkEmailCode(authToken, CheckEmailCodeRequest(newEmail, code))
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

    suspend fun changeFullname(authToken: String, fullname: String): Flow<Result<ChangeFullnameResponse>> {
        return flow {
            try {
                val response = api.changeFullname(authToken, ChangeFullnameRequest(fullname))
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
    suspend fun changeAvatar(authToken: String, avatar: MultipartBody.Part): Flow<Result<ChangeAvatarResponse>> {
        return flow {
            try {
                // Gọi API để thay đổi avatar
                Log.d("ChangeAvatar", "Sending request to change avatar with token: $authToken")
                val response = api.changeAvatar(authToken, avatar)
                emit(Result.Success(response))
            } catch (e: HttpException) {
                val errorMessage = e.response()?.errorBody()?.string() ?: "Error occurred"
                Log.e("ChangeAvatar", "HTTP Exception: $errorMessage")
                emit(Result.Error(message = errorMessage))
            } catch (e: IOException) {
                Log.e("ChangeAvatar", "Network error: ${e.message}")
                emit(Result.Error(message = "Network error: ${e.message}"))
            } catch (e: Exception) {
                Log.e("ChangeAvatar", "Unexpected error: ${e.message}")
                emit(Result.Error(message = "Unexpected error: ${e.message}"))
            }
        }
    }

    suspend fun sendDeleteAccountCode(authToken: String): Flow<Result<SendCodeDeleteAccountResponse>> {
        return flow {
            try {
                val response = api.sendDeleteAccountCode(authToken)
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

    suspend fun deleteAccount(authToken: String, code: Int): Flow<Result<DeleteAccountResponse>> {
        return flow {
            try {
//                val request = DeleteAccountRequest(code)
                val response = api.deleteAccount(authToken, code)
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
