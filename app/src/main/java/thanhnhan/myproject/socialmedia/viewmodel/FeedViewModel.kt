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
import thanhnhan.myproject.socialmedia.data.model.Activity
import thanhnhan.myproject.socialmedia.data.model.CommentResponse
import thanhnhan.myproject.socialmedia.data.model.DeleteFeedResponse
import thanhnhan.myproject.socialmedia.data.model.GetEveryoneFeedsResponse
import thanhnhan.myproject.socialmedia.data.model.GetUserInfoResponse
import thanhnhan.myproject.socialmedia.data.model.ReactFeedResponse
import thanhnhan.myproject.socialmedia.data.model.ReportFeedResponse
import thanhnhan.myproject.socialmedia.data.model.ReportUserResponse
import thanhnhan.myproject.socialmedia.data.model.SignInUserResponse
import thanhnhan.myproject.socialmedia.data.model.UpdateFeedResponse
import thanhnhan.myproject.socialmedia.data.network.SocketManager
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

    private val _commentResult = MutableStateFlow<Result<CommentResponse>?>(null)
    val commentResult: MutableStateFlow<Result<CommentResponse>?> = _commentResult

    fun comment(authToken: String, receiverId: String, content: String, feedId: String) {
        viewModelScope.launch {
            repository.comment(authToken, receiverId, content, feedId).collect {
                _commentResult.value = it
            }
        }
    }

    fun createActivityList(friends: List<SignInUserResponse.Metadata.Friend>, reactions: List<GetEveryoneFeedsResponse.Feed.Reaction>): List<Activity> {
        val activityList = mutableListOf<Activity>()

        for (reaction in reactions) {
            val friend = friends.find { it._id == reaction.userId._id }
            if (friend != null) {
                activityList.add(
                    Activity(
                        _id = friend._id,
                        fullname = friend.fullname,
                        profileImageUrl = friend.profileImageUrl,
                        icon = reaction.icon
                    )
                )
            }
        }

        return activityList
    }

    private val _reportUserResult = MutableStateFlow<Result<ReportUserResponse>?>(null)
    val reportUserResult: MutableStateFlow<Result<ReportUserResponse>?> = _reportUserResult

    fun reportUser(authToken: String, userId: String, reason: Int) {
        viewModelScope.launch {
            repository.reportUser(authToken, userId, reason).collect {
                _reportUserResult.value = it
            }
        }
    }

    private val _reportFeedResult = MutableStateFlow<Result<ReportFeedResponse>?>(null)
    val reportFeedResult: MutableStateFlow<Result<ReportFeedResponse>?> = _reportFeedResult

    fun reportFeed(authToken: String, feedId: String, reason: Int) {
        viewModelScope.launch {
            repository.reportFeed(authToken, feedId, reason).collect {
                _reportFeedResult.value = it
            }
        }
    }

    private val _deleteFeedResult = MutableStateFlow<Result<DeleteFeedResponse>?>(null)
    val deleteFeedResult: MutableStateFlow<Result<DeleteFeedResponse>?> = _deleteFeedResult

    fun deleteFeed(authToken: String, feedId: String) {
        viewModelScope.launch {
            repository.deleteFeed(authToken, feedId).collect {
                _deleteFeedResult.value = it
            }
        }
    }

    // Socket
    private val socketManager = SocketManager()

    init {
        socketManager.initSocket()
    }

    fun connectSocket() {
        socketManager.connect()
    }

    fun disconnectSocket() {
        socketManager.disconnect()
    }

    override fun onCleared() {
        super.onCleared()
        socketManager.disconnect()
    }
}