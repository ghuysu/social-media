package thanhnhan.myproject.socialmedia.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import thanhnhan.myproject.socialmedia.data.network.SocketManager
import thanhnhan.myproject.socialmedia.data.repository.FriendRepository
import thanhnhan.myproject.socialmedia.data.repository.MessageRepository

class ChatViewModelFactory(
    private val userViewModel: UserViewModel,
    private val repository: MessageRepository,
    private val socketManager: SocketManager // Thêm socketManager vào constructor
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(ChatViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return ChatViewModel(userViewModel,repository, socketManager) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}