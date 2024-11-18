package thanhnhan.myproject.socialmedia.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import okhttp3.MultipartBody
import thanhnhan.myproject.socialmedia.data.repository.UserProfileRepository
import thanhnhan.myproject.socialmedia.data.Result
import thanhnhan.myproject.socialmedia.data.model.ChangeAvatarResponse
import thanhnhan.myproject.socialmedia.data.model.ChangeBirthdayResponse
import thanhnhan.myproject.socialmedia.data.model.ChangeCountryResponse
import thanhnhan.myproject.socialmedia.data.model.ChangeEmailResponse
import thanhnhan.myproject.socialmedia.data.model.ChangeFullnameResponse
import thanhnhan.myproject.socialmedia.data.model.CheckEmailCodeResponse
import thanhnhan.myproject.socialmedia.data.model.DeleteAccountResponse
import thanhnhan.myproject.socialmedia.data.model.SendCodeDeleteAccountResponse
import thanhnhan.myproject.socialmedia.data.network.SocketManager
import java.io.File

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
    private val _changeFullnameResult = MutableStateFlow<Result<ChangeFullnameResponse>?>(null)
    val changeFullnameResult: MutableStateFlow<Result<ChangeFullnameResponse>?> = _changeFullnameResult

    fun changeFullname(authToken: String, fullname: String) {
        viewModelScope.launch {
            repository.changeFullname(authToken, fullname).collect {
                _changeFullnameResult.value = it
            }
        }
    }
    private val _changeAvatarResult = MutableStateFlow<Result<ChangeAvatarResponse>?>(null)
    val changeAvatarResult: StateFlow<Result<ChangeAvatarResponse>?> get() = _changeAvatarResult

    // Cập nhật hàm để nhận MultipartBody.Part thay vì File
    fun changeAvatar(authToken: String, avatar: MultipartBody.Part) {
        Log.d("ChangeAvatar", "Starting avatar change with token: $authToken")
        viewModelScope.launch {
            repository.changeAvatar(authToken, avatar).collect { result ->
                when (result) {
                    is Result.Success -> {
                        Log.d("ChangeAvatar", "Avatar changed successfully. New avatar URL: ${result.data?.metadata?.profileImageUrl}")
                    }
                    is Result.Error -> {
                        Log.e("ChangeAvatar", "Error changing avatar: ${result.message}")
                    }
                }
                _changeAvatarResult.value = result
            }
        }
    }
    private val socketManager = SocketManager()
    private val _friendFullnameUpdates = MutableStateFlow<Triple<String, String, String>?>(null)
    val friendFullnameUpdates: StateFlow<Triple<String, String, String>?> = _friendFullnameUpdates

    init {
        socketManager.initSocket()
        setupSocketListeners()
    }

    private fun setupSocketListeners() {
        socketManager.listenForFullnameChanges { userId, newFullname, profileImageUrl ->
            viewModelScope.launch {
                _friendFullnameUpdates.value = Triple(userId, newFullname, profileImageUrl)
            }
        }
    }
    fun connectSocket() {
        socketManager.connect()
    }

    fun disconnectSocket() {
        socketManager.disconnect()
    }

    override fun onCleared() {
        super.onCleared()
        socketManager.disconnect()
    }

    private val _sendDeleteAccountCodeResult = MutableStateFlow<Result<SendCodeDeleteAccountResponse>?>(null)
    val sendDeleteAccountCodeResult: MutableStateFlow<Result<SendCodeDeleteAccountResponse>?> = _sendDeleteAccountCodeResult

    fun sendDeleteAccountCode(authToken: String) {
        viewModelScope.launch {
            repository.sendDeleteAccountCode(authToken).collect {
                _sendDeleteAccountCodeResult.value = it
            }
        }
    }

    private val _deleteAccountResult = MutableStateFlow<Result<DeleteAccountResponse>?>(null)
    val deleteAccountResult: MutableStateFlow<Result<DeleteAccountResponse>?> = _deleteAccountResult

    fun deleteAccount(authToken: String, code: Int) {
        viewModelScope.launch {
            repository.deleteAccount(authToken, code).collect {
                _deleteAccountResult.value = it
            }
        }
    }
}