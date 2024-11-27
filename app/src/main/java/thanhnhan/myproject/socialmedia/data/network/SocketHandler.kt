package thanhnhan.myproject.socialmedia.data.network

import io.socket.client.IO
import io.socket.client.Socket
import java.net.URISyntaxException

object SocketHandler {
//    lateinit var mSocket: Socket

    val mSocket: Socket by lazy {
        try {
            IO.socket("https://skn7vgp9-10005.asse.devtunnels.ms")
        } catch (e: URISyntaxException) {
            throw RuntimeException(e)
        }
    }

//    @Synchronized
//    fun setSocket() {
//        try {
//            mSocket = IO.socket("https://skn7vgp9-10005.asse.devtunnels.ms ")
//        } catch (e: URISyntaxException) {
//
//        }
//    }

    @Synchronized
    fun getSocket(): Socket {
        return mSocket
    }
}