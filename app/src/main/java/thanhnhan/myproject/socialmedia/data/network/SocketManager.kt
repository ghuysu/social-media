package thanhnhan.myproject.socialmedia.data.network

import io.socket.client.IO
import io.socket.client.Socket
import org.json.JSONObject
import java.net.URISyntaxException

class SocketManager {

    companion object {
        private var socket: Socket? = null

        fun initializeSocket(authToken: String) {
            try {
                val options = IO.Options()
                options.query = "auth_token=$authToken" // Truyền SignInToken để xác thực
                socket = IO.socket("https://skn7vgp9-10005.asse.devtunnels.ms", options) // URL của Socket.IO server

                socket?.on(Socket.EVENT_CONNECT) {
                    println("Socket connected")
                }

                socket?.on(Socket.EVENT_DISCONNECT) {
                    println("Socket disconnected")
                }

                socket?.on("change_fullname") { args ->
                    if (args.isNotEmpty()) {
                        val data = args[0] as JSONObject
                        val userId = data.getString("userId")
                        val fullname = data.getJSONObject("metadata").getString("fullname")
                        println("User $userId changed their name to $fullname")
                        // Cập nhật giao diện hoặc dữ liệu của bạn khi có thay đổi
                    }
                }

                socket?.on("accept_invite") { args ->
                    if (args.isNotEmpty()) {
                        val data = args[0] as JSONObject
                        val friendId = data.getJSONObject("metadata").getString("friendInviteId")
                        println("Friend invite accepted for: $friendId")
                        // Cập nhật danh sách bạn bè
                    }
                }

                // Các sự kiện khác bạn có thể cần thêm tương tự như vậy
                socket?.connect()

            } catch (e: URISyntaxException) {
                e.printStackTrace()
            }
        }

        fun disconnectSocket() {
            socket?.disconnect()
        }
    }
}
