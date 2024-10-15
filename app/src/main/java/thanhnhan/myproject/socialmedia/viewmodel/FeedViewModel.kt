package thanhnhan.myproject.socialmedia.viewmodel

import android.content.Context
import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.launch
import thanhnhan.myproject.socialmedia.data.model.CreateFeedResponse
import thanhnhan.myproject.socialmedia.data.repository.FeedRepository
import thanhnhan.myproject.socialmedia.data.Result
import thanhnhan.myproject.socialmedia.data.model.GetEveryoneFeedsResponse
import thanhnhan.myproject.socialmedia.data.model.GetUserInfoResponse
import thanhnhan.myproject.socialmedia.data.model.ReactFeedResponse
import thanhnhan.myproject.socialmedia.data.model.UpdateFeedResponse
import thanhnhan.myproject.socialmedia.utils.FileUtils.uriToFile
import java.io.File

class FeedViewModel(private val repository: FeedRepository) : ViewModel() {

    private val _createFeedResult = MutableStateFlow<Result<CreateFeedResponse>?>(null)
    val createFeedResult: MutableStateFlow<Result<CreateFeedResponse>?> = _createFeedResult

    fun createFeed(authToken: String, imageFile: File, description: String, visibility: List<String>) {
        viewModelScope.launch {
            repository.createFeed(authToken, imageFile, description, visibility).collect {
                _createFeedResult.value = it
            }
        }
    }

    private val _getEveryoneFeedsResult = MutableStateFlow<Result<GetEveryoneFeedsResponse>?>(null)
    val getEveryoneFeedsResult: MutableStateFlow<Result<GetEveryoneFeedsResponse>?> = _getEveryoneFeedsResult

    fun getEveryoneFeeds(authToken: String, skip: Int) {
        viewModelScope.launch {
            repository.getEveryoneFeeds(authToken, skip).collect {
                _getEveryoneFeedsResult.value = it
            }
        }
    }

    private val _getUserResult = MutableStateFlow<Result<GetUserInfoResponse>?>(null)
    val getUserResult: MutableStateFlow<Result<GetUserInfoResponse>?> = _getUserResult

    fun getUser(authToken: String) {
        viewModelScope.launch {
            repository.getUser(authToken).collect {
                _getUserResult.value = it
            }
        }
    }

    private val _updateFeedResult = MutableStateFlow<Result<UpdateFeedResponse>?>(null)
    val updateFeedResult: MutableStateFlow<Result<UpdateFeedResponse>?> = _updateFeedResult

    fun updateFeed(
        authToken: String,
        feedId: String,
        description: String,
        visibility: List<String>
    ) {
        viewModelScope.launch {
            repository.updateFeed(authToken, feedId, description, visibility).collect {
                _updateFeedResult.value = it
            }
        }
    }

    private val _reactFeedResult = MutableStateFlow<Result<ReactFeedResponse>?>(null)
    val reactFeedResult: MutableStateFlow<Result<ReactFeedResponse>?> = _reactFeedResult

    fun reactToFeed(authToken: String, feedId: String, icon: String) {
        viewModelScope.launch {
            repository.reactToFeed(authToken, feedId, icon).collect {
                _reactFeedResult.value = it
            }
        }
    }
}