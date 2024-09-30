package thanhnhan.myproject.socialmedia.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import thanhnhan.myproject.socialmedia.data.repository.FriendRepository

class FriendViewModelFactory(
    private val repository: FriendRepository
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(FriendViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return FriendViewModel(repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}