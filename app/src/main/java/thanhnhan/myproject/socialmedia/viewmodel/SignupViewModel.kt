package thanhnhan.myproject.socialmedia.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import thanhnhan.myproject.socialmedia.data.model.EmailCheckResponse
import thanhnhan.myproject.socialmedia.data.repository.SignupRepository
import thanhnhan.myproject.socialmedia.data.Result
import thanhnhan.myproject.socialmedia.data.model.UserRequest
import thanhnhan.myproject.socialmedia.data.model.UserResponse
import java.util.regex.Pattern


class SignupViewModel(
    private val signUpRepository: SignupRepository
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

    // Check if a string has exactly 6 characters
    private val _stringLengthValidationResult = MutableStateFlow<Boolean?>(null)
    val stringLengthValidationResult: StateFlow<Boolean?> get() = _stringLengthValidationResult

    fun checkStringLength(input: String) {
        viewModelScope.launch {
            val isLengthValid = isStringLengthValid(input)
            _stringLengthValidationResult.value = isLengthValid
        }
    }

    private fun isStringLengthValid(input: String): Boolean {
        return input.length == 6
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

    //Check email
    private val _emailCheckResult = MutableStateFlow<Result<EmailCheckResponse>?>(null)
    val emailCheckResult = _emailCheckResult.asStateFlow()

    fun checkEmail(email: String) {
        viewModelScope.launch {
            signUpRepository.checkEmail(email).collect { result ->
                _emailCheckResult.value = result
            }
        }
    }

    // Create account
    private val _userCreationResult = MutableStateFlow<Result<UserResponse>?>(null)
    val userCreationResult: StateFlow<Result<UserResponse>?> = _userCreationResult

    fun createUser(userRequest: UserRequest) {
        viewModelScope.launch {
            signUpRepository.createUser(userRequest).collect {
                _userCreationResult.value = it
            }
        }
    }
}
