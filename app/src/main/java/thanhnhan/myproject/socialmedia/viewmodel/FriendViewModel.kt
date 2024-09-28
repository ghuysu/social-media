package thanhnhan.myproject.socialmedia.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.launch
import thanhnhan.myproject.socialmedia.data.repository.FriendRepository
import thanhnhan.myproject.socialmedia.data.Result
import thanhnhan.myproject.socialmedia.data.model.SendInviteResponse
import thanhnhan.myproject.socialmedia.data.model.UserSession

class FriendViewModel(
    private val repository: FriendRepository
) : ViewModel() {
    private val _sendInviteResult = MutableStateFlow<Result<SendInviteResponse>?>(null)
    val sendInviteResult: MutableStateFlow<Result<SendInviteResponse>?> = _sendInviteResult

    fun sendInvite(authToken: String, userId: String) {
        viewModelScope.launch {
            repository.sendInvite(authToken, userId).collect{ result ->
                _sendInviteResult.value = result
                if (result is Result.Success) {
                    result.data?.metadata?.let { metadata ->
                        metadata.friendInvites.firstOrNull()?.let { newFriendInvite ->
                            UserSession.updateFriendInvites(newFriendInvite)
                        }
                    }
                }
            }
        }
    }
}