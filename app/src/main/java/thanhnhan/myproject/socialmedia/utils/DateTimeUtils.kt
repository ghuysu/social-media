package thanhnhan.myproject.socialmedia.utils

import thanhnhan.myproject.socialmedia.data.model.Message
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale
import java.util.TimeZone

object DateTimeUtils {
    fun formatMessageTime(timestamp: String): String {
        return try {
            println("Original timestamp: $timestamp")

            if (timestamp.all { it.isDigit() }) {
                val messageTime = timestamp.toLong()
                val calendar = Calendar.getInstance()
                calendar.timeInMillis = messageTime

                val now = Calendar.getInstance()

                when {
                    // Cùng ngày
                    calendar.get(Calendar.DATE) == now.get(Calendar.DATE) &&
                            calendar.get(Calendar.MONTH) == now.get(Calendar.MONTH) &&
                            calendar.get(Calendar.YEAR) == now.get(Calendar.YEAR) -> {
                        SimpleDateFormat("HH:mm", Locale.getDefault()).format(messageTime)
                    }
                    // Trong tuần này
                    calendar.get(Calendar.WEEK_OF_YEAR) == now.get(Calendar.WEEK_OF_YEAR) &&
                            calendar.get(Calendar.YEAR) == now.get(Calendar.YEAR) -> {
                        SimpleDateFormat("EEEE HH:mm", Locale.getDefault()).format(messageTime)
                    }
                    // Khác tuần
                    else -> {
                        SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault()).format(messageTime)
                    }
                }
            } else {
                // Nếu timestamp không phải là số, thử parse ISO format
                val parser = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
                parser.timeZone = TimeZone.getTimeZone("UTC")
                val date = parser.parse(timestamp)

                val calendar = Calendar.getInstance()
                calendar.time = date

                val now = Calendar.getInstance()

                when {
                    // Cùng ngày
                    calendar.get(Calendar.DATE) == now.get(Calendar.DATE) &&
                            calendar.get(Calendar.MONTH) == now.get(Calendar.MONTH) &&
                            calendar.get(Calendar.YEAR) == now.get(Calendar.YEAR) -> {
                        SimpleDateFormat("HH:mm", Locale.getDefault()).format(date)
                    }
                    // Trong tuần này
                    calendar.get(Calendar.WEEK_OF_YEAR) == now.get(Calendar.WEEK_OF_YEAR) &&
                            calendar.get(Calendar.YEAR) == now.get(Calendar.YEAR) -> {
                        SimpleDateFormat("EEEE HH:mm", Locale.getDefault()).format(date)
                    }
                    // Khác tuần
                    else -> {
                        SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault()).format(date)
                    }
                }
            }
        } catch (e: Exception) {
            println("Error parsing timestamp: $timestamp")
            println("Error: ${e.message}")
            e.printStackTrace()
            "Invalid time"
        }
    }

    fun shouldShowTimestamp(currentMessage: Message, previousMessage: Message?): Boolean {
        if (previousMessage == null) return true

        try {
            val currentTime = if (currentMessage.createdAt.all { it.isDigit() }) {
                currentMessage.createdAt.toLong()
            } else {
                val parser = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
                parser.timeZone = TimeZone.getTimeZone("UTC")
                parser.parse(currentMessage.createdAt).time
            }

            val previousTime = if (previousMessage.createdAt.all { it.isDigit() }) {
                previousMessage.createdAt.toLong()
            } else {
                val parser = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
                parser.timeZone = TimeZone.getTimeZone("UTC")
                parser.parse(previousMessage.createdAt).time
            }

            // Hiển thị timestamp nếu khoảng cách > 4 giờ
            return (currentTime - previousTime) > 4 * 60 * 60 * 1000
        } catch (e: Exception) {
            println("Error comparing timestamps: ${e.message}")
            return false
        }
    }
}