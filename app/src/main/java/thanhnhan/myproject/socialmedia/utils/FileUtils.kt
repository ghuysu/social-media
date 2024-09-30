package thanhnhan.myproject.socialmedia.utils

import android.content.ContentResolver
import android.content.Context
import android.graphics.Bitmap
import android.net.Uri
import android.provider.OpenableColumns
import android.util.Base64
import androidx.core.content.FileProvider
import java.io.File

object FileUtils {
    // Chuyển đổi Uri thành File
    fun uriToFile(uri: Uri, context: Context): File? {
        return try {
            // Kiểm tra schema của Uri
            if (uri.scheme == "file") {
                // Lấy đường dẫn trực tiếp từ Uri nếu là schema file://
                File(uri.path!!)
            } else {
                // Trường hợp Uri là content://, vẫn thực hiện như bình thường
                val contentResolver = context.contentResolver
                val file = File(context.cacheDir, contentResolver.getFileName(uri))
                contentResolver.openInputStream(uri)?.use { inputStream ->
                    file.outputStream().use { outputStream ->
                        inputStream.copyTo(outputStream)
                    }
                }
                file
            }
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    // Helper function to get the file name from Uri
    fun ContentResolver.getFileName(uri: Uri): String? {
        val cursor = this.query(uri, null, null, null, null)
        return cursor?.use {
            if (it.moveToFirst()) {
                it.getString(it.getColumnIndexOrThrow(OpenableColumns.DISPLAY_NAME))
            } else {
                null
            }
        }
    }
    // Hàm để chuyển Bitmap thành Uri để dùng với UCrop
    fun bitmapToUri(bitmap: Bitmap, context: Context): Uri? {
        return try {
            val file = File(context.cacheDir, "camera_image_${System.currentTimeMillis()}.jpg")
            val outputStream = file.outputStream()
            bitmap.compress(Bitmap.CompressFormat.JPEG, 100, outputStream)
            outputStream.flush()
            outputStream.close()

            // Sử dụng FileProvider để lấy Uri cho tệp
            FileProvider.getUriForFile(context, "${context.packageName}.provider", file)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

}