package thanhnhan.myproject.socialmedia.viewmodel

import thanhnhan.myproject.socialmedia.data.Result
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import thanhnhan.myproject.socialmedia.data.model.ConversationResponse
import thanhnhan.myproject.socialmedia.data.model.Friend
import thanhnhan.myproject.socialmedia.data.model.GetCertainConversationResponse
import thanhnhan.myproject.socialmedia.data.model.Message
import thanhnhan.myproject.socialmedia.data.model.ReadMessagesRequest
import thanhnhan.myproject.socialmedia.data.model.ReadMessagesResponse
import thanhnhan.myproject.socialmedia.data.model.SendMessageRequest
import thanhnhan.myproject.socialmedia.data.model.SendMessageResponse
import thanhnhan.myproject.socialmedia.data.network.SocketManager
import thanhnhan.myproject.socialmedia.data.repository.MessageRepository

class ChatViewModel(
    private val repository: MessageRepository,
    private val socketManager: SocketManager
) : ViewModel() {

    // StateFlow để lưu trữ kết quả gửi tin nhắn
    private val _sendMessageResult = MutableStateFlow<Result<SendMessageResponse>?>(null)
    val sendMessageResult: StateFlow<Result<SendMessageResponse>?> get() = _sendMessageResult

    // Thêm StateFlow để theo dõi ID tin nhắn đang gửi
    private val _pendingMessageId = MutableStateFlow<String?>(null)
    val pendingMessageId: StateFlow<String?> = _pendingMessageId

    // StateFlow để lưu trữ tin nhắn mới từ socket
    private val _newMessage = MutableStateFlow<Message?>(null) // Sửa đổi kiểu dữ liệu
    val newMessage: StateFlow<Message?> get() = _newMessage

    // Thêm StateFlow mới để quản lý tin nhắn local
    private val _localMessages = MutableStateFlow<List<Message>>(emptyList())
    val localMessages: StateFlow<List<Message>> = _localMessages

    // Thêm property để lưu ID người dùng thực
    private var currentUserId: String = ""

    // Thêm function để set currentUserId
    fun setCurrentUserId(userId: String) {
        currentUserId = userId
    }

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

    // Hàm gửi tin nhắn local
    // Hàm gửi tin nhắn local
    private fun sendLocalMessage(content: String, receiverId: String): Message {
        val temporaryMessage = Message(
            _id = System.currentTimeMillis().toString(),
            content = content,
            senderId = Friend(currentUserId, "", ""),
            receiverId = Friend(receiverId, "", ""),
            isRead = false,
            createdAt = System.currentTimeMillis().toString()
        )

        _localMessages.value = _localMessages.value + temporaryMessage
        updateConversationWithNewMessage(temporaryMessage)
        return temporaryMessage
    }


    // Hàm chính để gửi tin nhắn
    fun sendMessage(authToken: String, sendMessageRequest: SendMessageRequest) {
        viewModelScope.launch {
            // Tạo và thêm tin nhắn local
            val localMessage = sendLocalMessage(sendMessageRequest.content, sendMessageRequest.receiverId)
            _pendingMessageId.value = localMessage._id

            repository.sendMessage(authToken, sendMessageRequest).collect { result ->
                _sendMessageResult.value = result
                when (result) {
                    is Result.Success -> {
                        result.data?.metadata?.let { serverMessage ->
                            // Xóa tin nhắn local trước
                            removeLocalMessage(localMessage._id)
                            // Sau đó mới thêm tin nhắn từ server
                            updateConversationWithNewMessage(serverMessage)
                            socketManager.sendMessage(serverMessage)
                        }
                        _pendingMessageId.value = null
                    }
                    is Result.Error -> {
                        _pendingMessageId.value = null
                    }
                }
            }
        }
    }

    private fun removeLocalMessage(messageId: String) {
        _conversationsResult.value?.let { currentResult ->
            when (currentResult) {
                is Result.Success -> {
                    currentResult.data?.metadata?.let { metadata ->
                        val updatedMetadata = metadata.map { conversationMetadata ->
                            conversationMetadata.copy(
                                conversation = conversationMetadata.conversation.filterNot {
                                    it._id == messageId
                                }
                            )
                        }
                        _conversationsResult.value = Result.Success(
                            currentResult.data.copy(metadata = updatedMetadata)
                        )
                    }
                }
                else -> { /* handle other cases */ }
            }
        }
    }

    // Hàm cập nhật tin nhắn local thành tin nhắn từ server
    private fun updateLocalMessageToServerMessage(localId: String, serverMessage: Message) {
        _localMessages.value = _localMessages.value.map { message ->
            if (message._id == localId) serverMessage else message
        }
    }


    // Lắng nghe tin nhắn mới từ socket và cập nhật giao diện
    private val _readMessagesResult = MutableStateFlow<Result<ReadMessagesResponse>?>(null)
    val readMessagesResult: StateFlow<Result<ReadMessagesResponse>?> get() = _readMessagesResult

    fun readMessages(authToken: String, friendId: String, messageIds: List<String>) {
        viewModelScope.launch {
            val request = ReadMessagesRequest(messageIds)
            repository.readMessages(authToken, request).collect { result ->
                _readMessagesResult.value = result
                when (result) {
                    is Result.Success -> {
                        println("readMessages success: ${result.data}")
                        // Cập nhật trạng thái đã đọc cho các tin nhắn
                        updateConversationReadStatus(
                            friendId = friendId,
                            messageIds = messageIds
                        )
                    }
                    is Result.Error -> {
                        println("readMessages error: ${result.message}")
                    }
                }
            }
        }
    }

    private fun updateConversationReadStatus(friendId: String, messageIds: List<String>) {
        _conversationsResult.value?.let { currentResult ->
            when (currentResult) {
                is Result.Success -> {
                    val updatedMetadata = currentResult.data?.metadata?.map { conversation ->
                        if (conversation.friendId == friendId) {
                            conversation.copy(
                                conversation = conversation.conversation.map { message ->
                                    if (messageIds.contains(message._id)) {
                                        message.copy(isRead = true)
                                    } else {
                                        message
                                    }
                                }
                            )
                        } else {
                            conversation
                        }
                    }

                    updatedMetadata?.let {
                        _conversationsResult.value = Result.Success(
                            currentResult.data?.copy(metadata = it)
                        )
                    }
                }
                else -> {}
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
        _conversationsResult.value?.let { currentResult ->
            when (currentResult) {
                is Result.Success -> {
                    currentResult.data?.metadata?.let { metadata ->
                        val updatedMetadata = metadata.map { conversationMetadata ->
                            // Kiểm tra xem tin nhắn đã tồn tại chưa
                            val existingMessage = conversationMetadata.conversation.find {
                                it._id == newMessage._id
                            }
                            if (existingMessage != null) {
                                // Nếu tin nhắn đã tồn tại, không thêm vào nữa
                                conversationMetadata
                            } else {
                                // Thêm tin nhắn mới
                                conversationMetadata.copy(
                                    conversation = conversationMetadata.conversation + newMessage
                                )
                            }
                        }
                        _conversationsResult.value = Result.Success(
                            currentResult.data.copy(metadata = updatedMetadata)
                        )
                    }
                }
                else -> { /* handle other cases */ }
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

