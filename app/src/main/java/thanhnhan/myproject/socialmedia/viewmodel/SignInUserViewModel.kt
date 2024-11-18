package thanhnhan.myproject.socialmedia.viewmodel

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import thanhnhan.myproject.socialmedia.data.Result
import thanhnhan.myproject.socialmedia.data.database.UserDatabaseHelper
import thanhnhan.myproject.socialmedia.data.model.SignInUserRequest
import thanhnhan.myproject.socialmedia.data.model.SignInUserResponse
import thanhnhan.myproject.socialmedia.data.model.UserSession
import thanhnhan.myproject.socialmedia.data.repository.SignInUserRepository
import java.util.regex.Pattern
import android.util.Log
import thanhnhan.myproject.socialmedia.data.Result.Error

class SignInUserViewModel(
    private val signInUserRepository: SignInUserRepository,
    private val context: Context
) : ViewModel() {

    // Check email format
    private val _emailValidationResult = MutableStateFlow<Boolean?>(null)
    val emailValidationResult: StateFlow<Boolean?> get() = _emailValidationResult

    fun checkEmailFormat(email: String) {
        viewModelScope.launch {
            val isValid = isValidEmail(email)
            _emailValidationResult.value = isValid
        }
    }

    private fun isValidEmail(email: String): Boolean {
        val emailPattern = "[a-zA-Z0-9._-]+@[a-z]+\\.+[a-z]+"
        return Pattern.compile(emailPattern).matcher(email).matches()
    }

    // Check password format
    private val _passwordValidationResult = MutableStateFlow<Boolean?>(null)
    val passwordValidationResult: StateFlow<Boolean?> get() = _passwordValidationResult

    fun checkPassword(password: String) {
        viewModelScope.launch {
            val isValid = isPasswordValid(password)
            _passwordValidationResult.value = isValid
        }
    }

    private fun isPasswordValid(password: String): Boolean {
        // Kiểm tra độ dài ít nhất 8 ký tự
        if (password.length < 8) return false

        // Kiểm tra có ký tự in hoa
        val hasUpperCase = password.any { it.isUpperCase() }
        // Kiểm tra có ký tự thường
        val hasLowerCase = password.any { it.isLowerCase() }
        // Kiểm tra có số
        val hasDigit = password.any { it.isDigit() }
        // Kiểm tra có ký tự đặc biệt
        val specialCharacters = "!@#$%^&*()-_=+[{]}|;:'\",<.>/?`~"
        val hasSpecialCharacter = password.any { it in specialCharacters }

        return hasUpperCase && hasLowerCase && hasDigit && hasSpecialCharacter
    }

    // Manage Sign-in result
    private val _signInResult = MutableStateFlow<Result<SignInUserResponse>?>(null)
    val signInResult: StateFlow<Result<SignInUserResponse>?> get() = _signInResult

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> get() = _isLoading

    // Function to sign in user
    fun signInUser(email: String, password: String) {
        viewModelScope.launch {
            try {
                _isLoading.value = true  // Đặt loading state trước khi thực hiện đăng nhập
                signInUserRepository.signInUser(SignInUserRequest(email, password)).collect { result ->
                    if (result is Result.Success) {
                        val user = result.data?.metadata?.user
                        val token = result.data?.metadata?.signInToken

                        // Lưu dữ liệu vào SQLite
                        if (user != null && token != null) {
                            val dbHelper = UserDatabaseHelper(context)
                            UserSession.setUserData(result.data.metadata.user, token)
                            dbHelper.insertUserData(
                                id = user._id,
                                email = user.email,
                                fullname = user.fullname,
                                birthday = user.birthday ?: "",
                                token = token,
                                profileImageUrl = user.profileImageUrl,
                                country = user.country?: ""
                            )

                            // Lưu thông tin người dùng vào UserSession
                            UserSession.setUserData(
                                user = SignInUserResponse.Metadata.User(
                                    _id = user._id,
                                    email = user.email,
                                    fullname = user.fullname,
                                    birthday = user.birthday,
                                    profileImageUrl = user.profileImageUrl,
                                    friendList = listOf(),
                                    friendInvites = listOf(),
                                    country = user.country
                                ),
                                token = token
                            )

                            // Cập nhật trạng thái đăng nhập thành công
                            _signInResult.value = result
                        }
                    } else if (result is Error) {
                        // Cập nhật kết quả đăng nhập thất bại
                        _signInResult.value = result
                    }
                }
            } catch (e: Exception) {
                // Cập nhật trạng thái lỗi
                _signInResult.value = Error(message = e.message)
            } finally {
                _isLoading.value = false // Tắt loading state
            }
        }
    }
    fun autoSignIn() {
        val dbHelper = UserDatabaseHelper(context)
        val savedUser = dbHelper.getUserData()

        if (savedUser != null) {
            // Thiết lập session người dùng
            UserSession.setUserData(
                user = SignInUserResponse.Metadata.User(
                    _id = savedUser.id,
                    email = savedUser.email,
                    fullname = savedUser.fullname,
                    birthday = savedUser.birthday?:"",
                    profileImageUrl = savedUser.profileImageUrl?:"",
                    friendList = listOf(),
                    friendInvites = listOf(),
                    country = savedUser.country?:""
                ),
                token = savedUser.token
            )
            // Cập nhật trạng thái auto-sign-in thành công
            _signInResult.value = Result.Success(SignInUserResponse(status = 200, message = "Auto sign-in success", metadata = null))
        } else {
            // Không có dữ liệu để tự động đăng nhập, cập nhật trạng thái thất bại
            _signInResult.value = Error(message = "No saved user data for auto login")
        }
    }
    // State cho Google Sign In
    private val _googleSignInResult = MutableStateFlow<Result<SignInUserResponse>?>(null)
    val googleSignInResult: StateFlow<Result<SignInUserResponse>?> = _googleSignInResult

    fun handleGoogleSignIn(firebaseToken: String) {
        viewModelScope.launch {
            try {
                _isLoading.value = true
                Log.d("SignInViewModel", "Starting Google sign in process")

                signInUserRepository.signInWithGoogle(firebaseToken).collect { result ->
                    Log.d("SignInViewModel", "Received result from repository: $result")
                    _googleSignInResult.value = result  // Cập nhật state ngay lập tức
                    when (result) {
                        is Result.Success -> {
                            Log.d("SignInViewModel", "API call successful")

                            result.data?.metadata?.let { metadata ->
                                val user = metadata.user
                                val signInToken = metadata.signInToken

                                if (user != null && signInToken != null) {
                                    try {
                                        // Lưu data
                                        val dbHelper = UserDatabaseHelper(context)
                                        dbHelper.insertUserData(
                                            id = user._id,
                                            email = user.email,
                                            fullname = user.fullname,
                                            birthday = user.birthday ?:"",
                                            token = signInToken,  // Sử dụng token gốc
                                            profileImageUrl = user.profileImageUrl ?:"",
                                            country = user.country ?:""
                                        )
                                        UserSession.setUserData(
                                            user = SignInUserResponse.Metadata.User(
                                                _id = user._id,
                                                email = user.email,
                                                fullname = user.fullname,
                                                birthday = user.birthday,
                                                profileImageUrl = user.profileImageUrl,
                                                friendList = listOf(),
                                                friendInvites = listOf(),
                                                country = user.country
                                            ),
                                            token = signInToken  // Sử dụng token gốc
                                        )

                                        // Emit state mới
                                        Log.d("SignInViewModel", "About to update googleSignInResult")
                                        _googleSignInResult.value = result
                                        Log.d("SignInViewModel", "State updated successfully to: ${_googleSignInResult.value}")

                                    } catch (e: Exception) {
                                        Log.e("SignInViewModel", "Error saving user data", e)
                                        _googleSignInResult.value = Result.Error(data = null,"Failed to save user data")
                                    }
                                } else {
                                    Log.e("SignInViewModel", "Missing user data or token")
                                    _googleSignInResult.value = Result.Error(data = null,"Invalid response data")
                                }
                            } ?: run {
                                Log.e("SignInViewModel", "Metadata is null")
                                _googleSignInResult.value = Result.Error(data = null,"Invalid response format")
                            }
                        }
                        is Error -> {
                            Log.e("SignInViewModel", "API call failed: ${result.message}")
                            _googleSignInResult.value = result
                        }
                    }
                }
            } catch (e: Exception) {
                Log.e("SignInViewModel", "Exception in handleGoogleSignIn", e)
                _googleSignInResult.value = Result.Error(data = null,e.message ?: "Unknown error")
            } finally {
                _isLoading.value = false
                Log.d("SignInViewModel", "Google Sign In process completed")
            }
        }
    }

    // Reset state sau khi xử lý xong
    fun resetGoogleSignInState() {
        _googleSignInResult.value = null
    }

    //Chức năng cho Sign out :
    fun logout() {
        val dbHelper = UserDatabaseHelper(context)
        dbHelper.clearUserData()
        UserSession.clearSession()
    }

}
