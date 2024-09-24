package thanhnhan.myproject.socialmedia.viewmodel

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import thanhnhan.myproject.socialmedia.data.repository.SignInUserRepository

class SignInUserViewModelFactory(
    private val repository: SignInUserRepository,
    private val context: Context
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(SignInUserViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return SignInUserViewModel(repository, context) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}