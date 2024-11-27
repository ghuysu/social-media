package thanhnhan.myproject.socialmedia.data.network

import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import io.socket.client.IO
import io.socket.client.Socket
import org.json.JSONObject
import thanhnhan.myproject.socialmedia.data.model.Friend
import thanhnhan.myproject.socialmedia.data.model.GetEveryoneFeedsResponse
import thanhnhan.myproject.socialmedia.data.model.GetUserResponse
import thanhnhan.myproject.socialmedia.data.model.Message
import thanhnhan.myproject.socialmedia.data.model.User
import java.net.URISyntaxException

class SocketManager {
    lateinit var socket: Socket

    fun initSocket() {
        try {
            val options = IO.Options().apply {
                reconnection = true
                reconnectionDelay = 1000
                reconnectionAttempts = 10
            }
            socket = IO.socket("https://skn7vgp9-10005.asse.devtunnels.ms", options)
            socket.connect()
            println("Socket connected")
        } catch (e: URISyntaxException) {
            e.printStackTrace()
            println("Error connecting to socket: ${e.message}")
        }
    }

    fun connect() {
        if (!socket.connected()) {
            socket.connect()
        }
    }

    fun disconnect() {
        if (::socket.isInitialized && socket.connected()) {
            socket.disconnect()
        }
    }

    fun listenForFriendInviteUpdates(onInviteReceived: (GetUserResponse.FriendInvite) -> Unit) {
        socket.on("newFriendInvite") { args ->
            if (args.isNotEmpty()) {
                val invite = parseFriendInvite(args[0] as JSONObject)  // Chuyển đổi dữ liệu nhận được từ socket
                onInviteReceived(invite)
                println("Received new friend invite: $invite")
            }
        }
    }

    fun listenForNewFriendUpdates(onFriendAdded: (GetUserResponse.Friend) -> Unit) {
        socket.on("newFriendAdded") { args ->
            if (args.isNotEmpty()) {
                val friend = parseFriend(args[0] as JSONObject)
                onFriendAdded(friend)
                println("New friend added: $friend")
            }
        }
    }

    private fun parseFriendInvite(json: JSONObject): GetUserResponse.FriendInvite {
        val sender = parseFriend(json.getJSONObject("sender"))
        val receiver = parseFriend(json.getJSONObject("receiver"))
        return GetUserResponse.FriendInvite(
            _id = json.getString("_id"),
            sender = sender,
            receiver = receiver,
            createdAt = json.getString("createdAt")
        )
    }

    private fun parseFriend(json: JSONObject): GetUserResponse.Friend {
        return GetUserResponse.Friend(
            _id = json.getString("_id"),
            fullname = json.getString("fullname"),
            profileImageUrl = json.optString("profileImageUrl")
        )
    }
    fun <T> listenForEvent(event: String, onEventReceived: (T) -> Unit) {
        socket.on(event) { args ->
            if (args.isNotEmpty()) {
                val data = args[0] as JSONObject
                val parsedData: T = Gson().fromJson(data.toString(), object: TypeToken<T>() {}.type)
                onEventReceived(parsedData)
            }
        }
    }

    fun stopListeningForEvent(event: String) {
        socket.off(event)
    }
    fun emit(event: String, data: Any) {
        socket.emit(event, data)
    }

    fun listenForNewMessages(currentUserId: String, onNewMessage: (Message) -> Unit) {
        socket.on("send_message") { args ->
            if (args.isNotEmpty()) {
                try {
                    print("6677currentUserId: $currentUserId")
                    val data = args[0] as JSONObject
                    println("Payload received: $data")
                    val userId = data.getString("userId")

                    // Kiểm tra xem tin nhắn có phải gửi cho mình không
                    println("Checking userId: $userId against currentUserId: $currentUserId")
                    if (userId == currentUserId) {
                        val metadata = data.getJSONObject("metadata")
                        val message = Message(
                            _id = metadata.getString("_id"),
                            senderId = parseSender(metadata.getJSONObject("senderId")),
                            receiverId = parseReceiver(metadata.getJSONObject("receiverId")),
                            content = metadata.getString("content"),
                            isRead = metadata.getBoolean("isRead"),
                            createdAt = metadata.getString("createdAt")
                        )
                        println("New message received via socket: ${message.content}")
                        onNewMessage(message)
                    }
                } catch (e: Exception) {
                    println("Error parsing message: ${e.message}")
                }
            }
        }
    }
    private fun parseSender(json: JSONObject): Friend {
        return Friend(
            _id = json.getString("_id"),
            fullname = json.getString("fullname"),
            profileImageUrl = json.optString("profileImageUrl")
        )
    }

    private fun parseReceiver(json: JSONObject): Friend {
        return Friend(
            _id = json.getString("_id"),
            fullname = json.getString("fullname"),
            profileImageUrl = json.optString("profileImageUrl")
        )
    }
    fun sendMessage(messagePayload: JSONObject) {
        try {
            socket?.emit("send_message", messagePayload)
            println("Message sent via socket")
        } catch (e: Exception) {
            println("Error sending message via socket: ${e.message}")
        }
    }
    fun listenForFullnameChanges(onFullnameChanged: (String, String, String) -> Unit) {
        socket.on("change_fullname") { args ->
            if (args.isNotEmpty()) {
                try {
                    val data = args[0] as JSONObject
                    val userId = data.getString("userId")
                    val metadata = data.getJSONObject("metadata")
                    val newFullname = metadata.getString("fullname")
                    val profileImageUrl = metadata.getString("profileImageUrl")

                    onFullnameChanged(userId, newFullname, profileImageUrl)
                    println("Received fullname change: User $userId changed name to $newFullname")
                } catch (e: Exception) {
                    println("Error parsing fullname change: ${e.message}")
                }
            }
        }
    }
    fun listenForAcceptInvite(onAcceptInvite: (String, String, GetUserResponse.Friend) -> Unit) {
        socket.on("accept_invite") { args ->
            if (args.isNotEmpty()) {
                try {
                    val data = args[0] as JSONObject
                    val userId = data.getString("userId")
                    val metadata = data.getJSONObject("metadata")
                    val friendInviteId = metadata.getString("friendInviteId")
                    
                    val friendJson = metadata.getJSONObject("friend")
                    // Lấy object fullname và trích xuất trường fullname từ nó
                    val fullnameObject = friendJson.getJSONObject("fullname")
                    val actualFullname = fullnameObject.getString("fullname")
                    
                    val friend = GetUserResponse.Friend(
                        _id = friendJson.getString("_id"),
                        fullname = actualFullname,  // Sử dụng fullname đã trích xuất
                        profileImageUrl = friendJson.optString("profileImageUrl")
                    )
                    println("Parsed friend object with correct fullname: $friend")

                    onAcceptInvite(userId, friendInviteId, friend)
                } catch (e: Exception) {
                    println("Error parsing accept invite: ${e.message}")
                    e.printStackTrace()
                }
            }
        }
    }

    fun listenForCreateFeed(onCreateFeed: (GetEveryoneFeedsResponse.Feed) -> Unit) {
        socket.on("create_feed") { args ->
            if (args.isNotEmpty()) {
                try {
                    val feedJson = args[0] as JSONObject
                    val feed = Gson().fromJson(feedJson.toString(), GetEveryoneFeedsResponse.Feed::class.java)
                    onCreateFeed(feed)
                    println("Received new feed: $feed")
                } catch (e: Exception) {
                    println("Error parsing feed: ${e.message}")
                }
            }
        }
    }

    fun listenForUpdateFeed(onUpdateFeed: (GetEveryoneFeedsResponse.Feed) -> Unit) {
        socket.on("update_feed") { args ->
            if (args.isNotEmpty()) {
                try {
                    val feedJson = args[0] as JSONObject
                    val feed = Gson().fromJson(feedJson.toString(), GetEveryoneFeedsResponse.Feed::class.java)
                    onUpdateFeed(feed)
                    println("Received updated feed: $feed")
                } catch (e: Exception) {
                    println("Error parsing feed: ${e.message}")
                }
            }
        }
    }

    fun listenForDeleteFeed(onDeleteFeed: (String) -> Unit) {
        socket.on("delete_feed") { args ->
            if (args.isNotEmpty()) {
                try {
                    val feedId = args[0] as String
                    onDeleteFeed(feedId)
                    println("Received delete feed: $feedId")
                } catch (e: Exception) {
                    println("Error parsing delete feed: ${e.message}")
                }
            }
        }
    }

    fun listenForReactFeed(onReactFeed: (GetEveryoneFeedsResponse.Feed) -> Unit) {
        socket.on("react_feed") { args ->
            if (args.isNotEmpty()) {
                try {
                    val feedJson = args[0] as JSONObject
                    val feed = Gson().fromJson(feedJson.toString(), GetEveryoneFeedsResponse.Feed::class.java)
                    onReactFeed(feed)
                    println("Received react feed: $feed")
                } catch (e: Exception) {
                    println("Error parsing feed: ${e.message}")
                }
            }
        }
    }

    fun listenForDeleteFriend(onDeleteFriend: (String, String) -> Unit) {
        socket.on("delete_friend") { args ->
            if (args.isNotEmpty()) {
                try {
                    val data = args[0] as JSONObject
                    val userId = data.getString("userId")
                    val metadata = data.getJSONObject("metadata")
                    val friendId = metadata.getString("_id")

                    onDeleteFriend(userId, friendId)
                    println("Received delete friend: User $userId deleted friend $friendId")
                } catch (e: Exception) {
                    println("Error parsing delete friend: ${e.message}")
                }
            }
        }
    }
}

