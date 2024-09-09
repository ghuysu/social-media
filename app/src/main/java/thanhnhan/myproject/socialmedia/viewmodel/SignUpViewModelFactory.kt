package thanhnhan.myproject.socialmedia.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import thanhnhan.myproject.socialmedia.data.repository.SignupRepository

class SignupViewModelFactory(
    private val repository: SignupRepository
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(SignupViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return SignupViewModel(repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}