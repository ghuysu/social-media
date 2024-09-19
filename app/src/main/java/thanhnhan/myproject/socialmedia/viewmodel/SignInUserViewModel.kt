package thanhnhan.myproject.socialmedia.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import thanhnhan.myproject.socialmedia.data.Result
import thanhnhan.myproject.socialmedia.data.model.SignInUserRequest
import thanhnhan.myproject.socialmedia.data.model.SignInUserResponse
import thanhnhan.myproject.socialmedia.data.model.UserSession
import thanhnhan.myproject.socialmedia.data.repository.SignInUserRepository
import java.util.regex.Pattern

class SignInUserViewModel(
    private val signInUserRepository: SignInUserRepository
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
        Log.d("SignInUserViewModel", "Attempting to sign in with email: $email")
        viewModelScope.launch {
            try {
                signInUserRepository.signInUser(SignInUserRequest(email, password)).collect { result ->
                    if (result is Result.Success) {
                        // Thêm log để kiểm tra phản hồi thô từ API
                        Log.d("SignInUserViewModel", "Raw API Response: ${result.data}")

                        Log.d("SignInUserViewModel", "Sign-in successful")

                        // Lấy thông tin user và token từ metadata
                        val user = result.data?.metadata?.user
                        val token = result.data?.metadata?.signInToken

                        // Thêm log để kiểm tra giá trị của token
                        Log.d("SignInUserViewModel", "API Response - User: ${user?.fullname}, Token: $token")

                        // Lưu thông tin user và token vào UserSession
                        UserSession.setUserData(user, token)

                        // Kiểm tra dữ liệu đã lưu
                        Log.d("SignInUserViewModel", "User: ${UserSession.user?.fullname}, Token: ${UserSession.signInToken}")
                        _signInResult.value = result
                    } else if (result is Result.Error) {
                        Log.e("SignInUserViewModel", "Sign-in failed: ${result.message}")
                        _signInResult.value = result
                    }
                }
            } catch (e: Exception) {
                // Xử lý lỗi khi đăng nhập
                Log.e("SignInUserViewModel", "Login failed: ${e.message}")
                _signInResult.value = Result.Error(message = e.message)
            }
        }
    }

}
