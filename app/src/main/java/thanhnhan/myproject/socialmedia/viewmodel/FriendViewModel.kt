package thanhnhan.myproject.socialmedia.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import thanhnhan.myproject.socialmedia.data.repository.FriendRepository
import thanhnhan.myproject.socialmedia.data.Result
import thanhnhan.myproject.socialmedia.data.model.AcceptFriendResponse
import thanhnhan.myproject.socialmedia.data.model.DeleteFriendResponse
import thanhnhan.myproject.socialmedia.data.model.RemoveFriendInviteResponse
import thanhnhan.myproject.socialmedia.data.model.SendInviteResponse
import thanhnhan.myproject.socialmedia.data.model.UserSession
import thanhnhan.myproject.socialmedia.data.network.SocketManager
import thanhnhan.myproject.socialmedia.data.model.GetUserResponse
import thanhnhan.myproject.socialmedia.data.model.SignInUserResponse

class FriendViewModel(
    private val repository: FriendRepository,
    private val socketManager: SocketManager,
    private val userViewModel: UserViewModel
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
    private val _acceptFriendResult = MutableStateFlow<Result<AcceptFriendResponse>?>(null)
    val acceptFriendResult: StateFlow<Result<AcceptFriendResponse>?> get() = _acceptFriendResult

    fun acceptFriendInvite(authToken: String, inviteId: String) {
        viewModelScope.launch {
            repository.acceptFriendInvite(authToken, inviteId).collect { result ->
                _acceptFriendResult.value = result
                when (result) {
                    is Result.Success -> {
                        println("acceptFriendInvite success: ${result.data}")
                        setupAcceptInviteListener()
                    }
                    is Result.Error -> {
                        println("acceptFriendInvite error: ${result.message}")
                    }
                }
            }
        }
    }

    private fun setupAcceptInviteListener() {
        socketManager.listenForAcceptInvite { userId, friendInviteId, newFriend ->
            viewModelScope.launch {
                userViewModel.updateAfterAcceptInvite(friendInviteId, newFriend)
            }
        }
    }

    private val _removeFriendRequestResult = MutableStateFlow<Result<RemoveFriendInviteResponse>?>(null)
    val removeFriendRequestResult: StateFlow<Result<RemoveFriendInviteResponse>?> get() = _removeFriendRequestResult

    fun removeFriendInvite(authToken: String, inviteId: String) {
        viewModelScope.launch {
            repository.removeFriendInvite(authToken, inviteId).collect { result ->
                _removeFriendRequestResult.value = result
                when (result) {
                    is Result.Success -> {
                        println("RemoveFriendInvite success: ${result.data}")
                    }
                    is Result.Error -> {
                        println("RemoveFriendInvite error: ${result.message}")
                    }
                }
            }
        }
    }

    private val _deleteFriendResult = MutableStateFlow<Result<DeleteFriendResponse>?>(null)
    val deleteFriendResult: StateFlow<Result<DeleteFriendResponse>?> get() = _deleteFriendResult

    fun deleteFriend(authToken: String, friendId: String) {
        viewModelScope.launch {
            repository.deleteFriend(authToken, friendId).collect { result ->
                _deleteFriendResult.value = result
                when (result) {
                    is Result.Success -> {
                        println("RemoveFriend success: ${result.data}")
                        userViewModel.updateAfterDeleteFriend(friendId)
                        setupDeleteFriendListener()
                    }
                    is Result.Error -> {
                        println("RemoveFriend error: ${result.message}")
                    }
                }
            }
        }
    }

    private fun setupDeleteFriendListener() {
        socketManager.listenForDeleteFriend { userId, friendId ->
            viewModelScope.launch {
                userViewModel.updateAfterDeleteFriend(friendId)
            }
        }
    }

    private val _friendInvites = MutableStateFlow<List<SignInUserResponse.Metadata.FriendInvite>>(emptyList())
    val friendInvites: StateFlow<List<SignInUserResponse.Metadata.FriendInvite>> = _friendInvites

    private val _friendList = MutableStateFlow<List<SignInUserResponse.Metadata.Friend>>(emptyList())
    val friendList: StateFlow<List<SignInUserResponse.Metadata.Friend>> = _friendList

    init {
        setupSocketListeners()
        UserSession.user?.let { user ->
            _friendInvites.value = user.friendInvites
            _friendList.value = user.friendList
        }
    }

    private fun setupSocketListeners() {
        socketManager.listenForAcceptInvite { userId, friendInviteId, newFriend ->
            viewModelScope.launch {
                updateAfterAcceptInvite(userId, friendInviteId, newFriend)
            }
        }
        socketManager.listenForDeleteFriend { userId, friendId ->
            viewModelScope.launch {
                userViewModel.updateAfterDeleteFriend(friendId)
            }
        }
    }

    private fun updateAfterAcceptInvite(userId: String, friendInviteId: String, newFriend: GetUserResponse.Friend) {
        val convertedFriend = SignInUserResponse.Metadata.Friend(
            _id = newFriend._id,
            fullname = newFriend.fullname,
            profileImageUrl = newFriend.profileImageUrl ?: ""
        )

        val currentInvites = UserSession.user?.friendInvites?.toMutableList() ?: mutableListOf()
        currentInvites.removeAll { it._id == friendInviteId }

        val currentFriends = UserSession.user?.friendList?.toMutableList() ?: mutableListOf()
        currentFriends.add(convertedFriend)

        UserSession.user = UserSession.user?.copy(
            friendInvites = currentInvites,
            friendList = currentFriends
        )

        _friendInvites.value = currentInvites
        _friendList.value = currentFriends
    }

    override fun onCleared() {
        super.onCleared()
        socketManager.stopListeningForEvent("accept_invite")
        socketManager.stopListeningForEvent("delete_friend")
    }
}