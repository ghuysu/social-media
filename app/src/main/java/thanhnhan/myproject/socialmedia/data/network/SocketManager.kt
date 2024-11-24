package thanhnhan.myproject.socialmedia.data.network

import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import io.socket.client.IO
import io.socket.client.Socket
import org.json.JSONObject
import thanhnhan.myproject.socialmedia.data.model.GetEveryoneFeedsResponse
import thanhnhan.myproject.socialmedia.data.model.GetUserResponse
import thanhnhan.myproject.socialmedia.data.model.Message
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

    fun listenForNewMessages(onNewMessage: (Message) -> Unit) {
        socket.on("newMessage") { args ->
            if (args.isNotEmpty()) {
                try {
                    val messageJson = args[0] as JSONObject
                    val message = Gson().fromJson(messageJson.toString(), Message::class.java)
                    onNewMessage(message)
                } catch (e: Exception) {
                    println("Error parsing message: ${e.message}")
                }
            }
        }
    }

    fun sendMessage(message: Message) {
        val messageJson = JSONObject(Gson().toJson(message))
        socket.emit("sendMessage", messageJson)
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
        socket.on("accpet_invite") { args ->
            if (args.isNotEmpty()) {
                try {
                    val data = args[0] as JSONObject
                    val userId = data.getString("userId")
                    val metadata = data.getJSONObject("metadata")
                    val friendInviteId = metadata.getString("friendInviteId")

                    // Parse friend object
                    val friendJson = metadata.getJSONObject("friend")
                    val friend = GetUserResponse.Friend(
                        _id = friendJson.getString("_id"),
                        fullname = friendJson.getString("fullname"),
                        profileImageUrl = friendJson.optString("profileImageUrl")
                    )

                    onAcceptInvite(userId, friendInviteId, friend)
                    println("Received accept invite: User $userId accepted invite $friendInviteId")
                } catch (e: Exception) {
                    println("Error parsing accept invite: ${e.message}")
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
}

