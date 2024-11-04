package thanhnhan.myproject.socialmedia.viewmodel

import thanhnhan.myproject.socialmedia.data.Result
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import thanhnhan.myproject.socialmedia.data.model.ConversationResponse
import thanhnhan.myproject.socialmedia.data.model.GetCertainConversationResponse
import thanhnhan.myproject.socialmedia.data.model.Message
import thanhnhan.myproject.socialmedia.data.model.MessageMetadata
import thanhnhan.myproject.socialmedia.data.model.ReadMessagesRequest
import thanhnhan.myproject.socialmedia.data.model.ReadMessagesResponse
import thanhnhan.myproject.socialmedia.data.model.SendMessageRequest
import thanhnhan.myproject.socialmedia.data.model.SendMessageResponse
import thanhnhan.myproject.socialmedia.data.network.SocketManager
import thanhnhan.myproject.socialmedia.data.repository.MessageRepository

class ChatViewModel(
    private val repository: MessageRepository,
    private val socketManager: SocketManager // Thêm SocketManager
) : ViewModel() {

    // StateFlow để lưu trữ kết quả gửi tin nhắn
    private val _sendMessageResult = MutableStateFlow<Result<SendMessageResponse>?>(null)
    val sendMessageResult: StateFlow<Result<SendMessageResponse>?> get() = _sendMessageResult

    // StateFlow để lưu trữ tin nhắn mới từ socket
    private val _newMessage = MutableStateFlow<Message?>(null) // Sửa đổi kiểu dữ liệu
    val newMessage: StateFlow<Message?> get() = _newMessage


    init {
        socketManager.initSocket()
        // Lắng nghe tin nhắn mới
        socketManager.listenForNewMessages { message ->
            viewModelScope.launch {
                _newMessage.value = message
                // Cập nhật danh sách tin nhắn
                updateConversationWithNewMessage(message)
            }
        }
    }

    // Hàm để gọi API gửi tin nhắn
    fun sendMessage(authToken: String, sendMessageRequest: SendMessageRequest) {
        viewModelScope.launch {
            repository.sendMessage(authToken, sendMessageRequest).collect { result ->
                _sendMessageResult.value = result
                when (result) {
                    is Result.Success -> {
                        result.data?.metadata?.let { message ->
                            // Gửi tin nhắn qua socket
                            socketManager.sendMessage(message)
                            // Cập nhật UI
                            _newMessage.value = message
                            updateConversationWithNewMessage(message)
                        }
                        println("sendMessage success: ${result.data}")
                    }
                    is Result.Error -> {
                        println("Send message error: ${result.message}")
                    }
                }
            }
        }
    }

    // Lắng nghe tin nhắn mới từ socket và cập nhật giao diện
    private val _readMessagesResult = MutableStateFlow<Result<ReadMessagesResponse>?>(null)
    val readMessagesResult: StateFlow<Result<ReadMessagesResponse>?> get() = _readMessagesResult

    fun readMessages(authToken: String, readMessagesRequest: ReadMessagesRequest) {
        viewModelScope.launch {
            repository.readMessages(authToken, readMessagesRequest).collect { result ->
                _readMessagesResult.value = result
                when (result) {
                    is Result.Success -> {
                        println("readMessages success: ${result.data}")
                    }
                    is Result.Error -> {
                        println("readMessages error: ${result.message}")
                    }
                }
            }
        }
    }

    // StateFlow để lưu trữ kết quả của getAllConversations
    private val _conversationsResult = MutableStateFlow<Result<ConversationResponse>?>(null)
    val conversationsResult: StateFlow<Result<ConversationResponse>?> get() = _conversationsResult

    // Hàm để gọi API getAllConversations
    fun getAllConversations(authToken: String) {
        viewModelScope.launch {
            repository.getAllConversations(authToken).collect { result ->
                _conversationsResult.value = result
                when (result) {
                    is Result.Success -> {
                        println("getAllConversations success: ${result.data}")
                    }
                    is Result.Error -> {
                        println("getAllConversations error: ${result.message}")
                    }
                }
            }
        }
    }
    fun updateConversationWithNewMessage(newMessage: Message) {
        _conversationsResult.value?.let { result ->
            if (result is Result.Success) {
                val updatedConversations = result.data?.metadata?.map { conversation ->
                    if (conversation.friendId == newMessage.receiverId._id) {
                        // Thêm tin nhắn mới vào danh sách conversation
                        conversation.copy(conversation = conversation.conversation + newMessage)
                    } else {
                        conversation
                    }
                }
                _conversationsResult.value = Result.Success(result.data?.copy(metadata = updatedConversations ?: listOf()))
            }
        }
    }

    // StateFlow để lưu trữ kết quả của getCertainConversation
    private val _conversationResult = MutableStateFlow<Result<GetCertainConversationResponse>?>(null)
    val conversationResult: StateFlow<Result<GetCertainConversationResponse>?> get() = _conversationResult

    // Hàm để gọi API getCertainConversation
    fun getCertainConversation(authToken: String, friendId: String, skip: Int) {
        viewModelScope.launch {
            repository.getConversationByFriendId(authToken, friendId, skip).collect { result ->
                _conversationResult.value = result
                when (result) {
                    is Result.Success -> {
                        println("getCertainConversation success: ${result.data}")
                    }
                    is Result.Error -> {
                        println("getCertainConversation error: ${result.message}")
                    }
                }
            }
        }
    }

    // Ngắt kết nối khi ViewModel bị hủy để tránh rò rỉ tài nguyên
    override fun onCleared() {
        super.onCleared()
        socketManager.disconnect() // Ngắt kết nối socket
    }
}

