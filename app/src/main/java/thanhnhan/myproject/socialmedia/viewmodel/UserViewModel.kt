package thanhnhan.myproject.socialmedia.viewmodel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import thanhnhan.myproject.socialmedia.data.model.GetUserResponse
import thanhnhan.myproject.socialmedia.data.repository.UserRepository
import thanhnhan.myproject.socialmedia.data.Result

class UserViewModel(private val repository: UserRepository) : ViewModel() {

    private val _user = MutableStateFlow<GetUserResponse.Metadata?>(null)
    val user: StateFlow<GetUserResponse.Metadata?> = _user

    fun getUser(authToken: String) {
        viewModelScope.launch {
            Log.d("UserViewModel1122", "AuthToken: $authToken") // Log token trước khi gọi API

            val result = repository.getUser(authToken)
            if (result is Result.Success) {
                Log.d("UserViewModel", "API Response: ${result.data}") // Log API response
                _user.value = result.data?.metadata
                Log.d("UserViewModel", "Updated User Metadata: ${_user.value}") // Log updated metadata
            } else if (result is Result.Error) {
                Log.e("UserViewModel", "API Error: ${result.message}") // Log API error
            }
        }
    }

    // Hàm trả về danh sách bạn bè
    fun getFriends(): List<GetUserResponse.Friend> {
        val friends = user.value?.friendList ?: emptyList()
        Log.d("UserViewModel", "Friends List: $friends") // Log friends list
        return friends
    }

    // Hàm trả về danh sách lời mời kết bạn
    fun getFriendInvites(): List<GetUserResponse.FriendInvite> {
        val friendInvites = user.value?.friendInvites ?: emptyList()
        Log.d("UserViewModel", "Friend Invites List: $friendInvites") // Log friend invites list
        return friendInvites
    }
}