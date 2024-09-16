package thanhnhan.myproject.socialmedia.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import thanhnhan.myproject.socialmedia.data.Result
import thanhnhan.myproject.socialmedia.data.model.SignInUserRequest
import thanhnhan.myproject.socialmedia.data.model.SignInUserResponse
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
        viewModelScope.launch {
            _isLoading.value = true // Bắt đầu xử lý
            try {
                signInUserRepository.signInUser(SignInUserRequest(email, password)).collect { result ->
                    _signInResult.value = result // Đảm bảo rằng result là kiểu SignInUserResponse
                }
            } catch (e: Exception) {
                _signInResult.value = Result.Error(message = "Login failed: ${e.message}") // Truyền message
            } finally {
                _isLoading.value = false // Kết thúc xử lý
            }
        }
    }
}
