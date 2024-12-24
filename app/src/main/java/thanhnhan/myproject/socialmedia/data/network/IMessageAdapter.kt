package thanhnhan.myproject.socialmedia.data.network


import com.google.gson.JsonDeserializationContext
import com.google.gson.JsonDeserializer
import com.google.gson.JsonElement
import com.google.gson.JsonObject
import thanhnhan.myproject.socialmedia.data.model.Friend
import thanhnhan.myproject.socialmedia.data.model.IMessage
import thanhnhan.myproject.socialmedia.data.model.Message
import thanhnhan.myproject.socialmedia.data.model.MessageWithFeed
import java.lang.reflect.Type

class IMessageTypeAdapter : JsonDeserializer<IMessage> {
    override fun deserialize(
        json: JsonElement,
        typeOfT: Type,
        context: JsonDeserializationContext
    ): IMessage {
        val jsonObject = json.asJsonObject
        println("Debug - Deserializing JSON: $jsonObject") // Debug log

        // Sửa từ "feed" thành "feedId"
        return if (jsonObject.has("feedId") && !jsonObject.get("feedId").isJsonNull) {
            // Nếu có feedId, deserialize thành MessageWithFeed
            MessageWithFeed(
                _id = jsonObject.get("_id").asString,
                senderId = deserializeFriend(jsonObject.getAsJsonObject("senderId")),
                receiverId = deserializeFriend(jsonObject.getAsJsonObject("receiverId")),
                content = jsonObject.get("content").asString,
                isRead = jsonObject.get("isRead").asBoolean,
                createdAt = jsonObject.get("createdAt").asString,
                feedId = deserializeFeed(jsonObject.getAsJsonObject("feedId")) // Sửa từ "feed" thành "feedId"
            )
        } else {
            // Nếu không có feedId, deserialize thành Message thông thường
            Message(
                _id = jsonObject.get("_id").asString,
                senderId = deserializeFriend(jsonObject.getAsJsonObject("senderId")),
                receiverId = deserializeFriend(jsonObject.getAsJsonObject("receiverId")),
                content = jsonObject.get("content").asString,
                isRead = jsonObject.get("isRead").asBoolean,
                createdAt = jsonObject.get("createdAt").asString
            )
        }
    }

    private fun deserializeFriend(jsonObject: JsonObject): Friend {
        return Friend(
            _id = jsonObject.get("_id").asString,
            fullname = jsonObject.get("fullname").asString,
            profileImageUrl = jsonObject.get("profileImageUrl").asString
        )
    }

    private fun deserializeFeed(jsonObject: JsonObject): MessageWithFeed.Feed {
        return MessageWithFeed.Feed(
            _id = jsonObject.get("_id").asString,
            description = jsonObject.get("description").asString,
            imageUrl = jsonObject.get("imageUrl").asString
        )
    }
}