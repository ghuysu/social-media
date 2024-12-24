package thanhnhan.myproject.socialmedia.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import thanhnhan.myproject.socialmedia.data.repository.FeedRepository
import thanhnhan.myproject.socialmedia.data.repository.FriendRepository
import thanhnhan.myproject.socialmedia.viewmodel.ChatViewModel

class FeedViewModelFactory(
    private val repository: FeedRepository,
    private val chatViewModel: ChatViewModel
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(FeedViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return FeedViewModel(repository, chatViewModel) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}