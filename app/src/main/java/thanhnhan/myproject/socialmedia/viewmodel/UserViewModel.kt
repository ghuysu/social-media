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

open class UserViewModel(private val repository: UserRepository) : ViewModel() {

    private val _user = MutableStateFlow<GetUserResponse.Metadata?>(null)
    val user: StateFlow<GetUserResponse.Metadata?> = _user
    // Thêm thuộc tính để lưu trữ currentUserId
    val currentUserId: String?
        get() = _user.value?._id
    fun getUser(authToken: String) {
        viewModelScope.launch {
            Log.d("UserViewModel1122", "AuthToken: $authToken") // Log token trước khi gọi API

            val result = repository.getUser(authToken)
            if (result is Result.Success) {
                Log.d("UserViewModel", "API Response: ${result.data}") // Log API response
                _user.value = result.data?.metadata
                Log.d("UserViewModel", "Updated User Metadata: ${_user.value}")
            Log.d("UserViewModel", "laad current id: $currentUserId")// Log updated metadata
            } else if (result is Result.Error) {
                Log.e("UserViewModel", "API Error: ${result.message}") // Log API error
            }
        }
    }
    fun getCurrentId(): String? {
        val userId = currentUserId
        Log.d("UserViewModel", "Current user ID: $userId")
        return userId
    }

    // Hàm trả về danh sách bạn bè
    open fun getFriends(): List<GetUserResponse.Friend> {
        val friends = user.value?.friendList ?: emptyList()
        Log.d("UserViewModelGetFriends", "Friends List: $friends") // Log friends list
        return friends
    }

    // Hàm trả về danh sách lời mời kết bạn
    fun getFriendInvites(): List<GetUserResponse.FriendInvite> {
        val friendInvites = user.value?.friendInvites ?: emptyList()
        Log.d("UserViewModelGetFriendInvites", "Friend Invites List: $friendInvites") // Log friend invites list
        return friendInvites
    }
    // Thêm bạn mới vào danh sách
    fun addFriend(newFriend: GetUserResponse.Friend) {
        _user.value?.let { metadata ->
            val updatedFriends = metadata.friendList.toMutableList().apply {
                add(newFriend)
            }
            _user.value = metadata.copy(friendList = updatedFriends)
        }
    }

    // Thêm lời mời kết bạn mới vào danh sách
    fun addFriendInvite(newInvite: GetUserResponse.FriendInvite) {
        _user.value?.let { metadata ->
            val updatedInvites = metadata.friendInvites.toMutableList().apply {
                add(newInvite)
            }
            _user.value = metadata.copy(friendInvites = updatedInvites)
        }
    }

    // Thêm phương thức để cập nhật danh sách sau khi accept friend
    fun updateAfterAcceptInvite(friendInviteId: String, newFriend: GetUserResponse.Friend) {
        _user.value?.let { currentUser ->
            // Xóa friend invite
            val updatedInvites = currentUser.friendInvites.filterNot { it._id == friendInviteId }
            
            // Thêm friend mới
            val updatedFriends = currentUser.friendList.toMutableList().apply {
                add(newFriend)
            }
            
            // Cập nhật state
            _user.value = currentUser.copy(
                friendInvites = updatedInvites,
                friendList = updatedFriends
            )
        }
    }

    // Thêm phương thức để xóa friend khỏi danh sách
    fun updateAfterDeleteFriend(friendId: String) {
        _user.value?.let { currentUser ->
            // Lọc ra danh sách bạn bè mới, loại bỏ friend vừa xóa
            val updatedFriends = currentUser.friendList.filterNot { it._id == friendId }
            
            // Cập nhật state
            _user.value = currentUser.copy(
                friendList = updatedFriends
            )
        }
    }
}