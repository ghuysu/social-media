package thanhnhan.myproject.socialmedia.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.launch
import thanhnhan.myproject.socialmedia.data.repository.UserProfileRepository
import thanhnhan.myproject.socialmedia.data.Result
import thanhnhan.myproject.socialmedia.data.model.ChangeBirthdayResponse
import thanhnhan.myproject.socialmedia.data.model.ChangeCountryResponse
import thanhnhan.myproject.socialmedia.data.model.ChangeEmailResponse
import thanhnhan.myproject.socialmedia.data.model.CheckEmailCodeResponse

class UserProfileViewModel(
    private val repository: UserProfileRepository
) : ViewModel() {

    private val _changeBirthdayResult = MutableStateFlow<Result<ChangeBirthdayResponse>?>(null)
    val changeBirthdayResult: MutableStateFlow<Result<ChangeBirthdayResponse>?> = _changeBirthdayResult

    fun changeBirthday(authToken: String, birthday: String) {
        viewModelScope.launch {
            repository.changeBirthday(authToken, birthday).collect {
                _changeBirthdayResult.value = it
            }
        }
    }

    private val _changeCountryResult = MutableStateFlow<Result<ChangeCountryResponse>?>(null)
    val changeCountryResult: MutableStateFlow<Result<ChangeCountryResponse>?> = _changeCountryResult

    fun changeCountry(authToken: String, country: String) {
        viewModelScope.launch {
            repository.changeCountry(authToken, country).collect {
                _changeCountryResult.value = it
            }
        }
    }

    private val _changeEmailResult = MutableStateFlow<Result<ChangeEmailResponse>?>(null)
    val changeEmailResult: MutableStateFlow<Result<ChangeEmailResponse>?> = _changeEmailResult

    fun changeEmail(authToken: String, newEmail: String) {
        viewModelScope.launch {
            repository.changeEmail(authToken, newEmail).collect {
                _changeEmailResult.value = it
            }
        }
    }

    private val _checkEmailCodeResult = MutableStateFlow<Result<CheckEmailCodeResponse>?>(null)
    val checkEmailCodeResult: MutableStateFlow<Result<CheckEmailCodeResponse>?> = _checkEmailCodeResult

    fun checkEmailCode(authToken: String, newEmail: String, code: Int) {
        viewModelScope.launch {
            repository.checkEmailCode(authToken, newEmail, code).collect {
                _checkEmailCodeResult.value = it
            }
        }
    }
}