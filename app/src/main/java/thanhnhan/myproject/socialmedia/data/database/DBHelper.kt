package thanhnhan.myproject.socialmedia.data.database

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import thanhnhan.myproject.socialmedia.data.model.User
import thanhnhan.myproject.socialmedia.data.model.UserSession

class UserDatabaseHelper(context: Context) : SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {

    companion object {
        const val DATABASE_NAME = "UserDatabase.db"
        const val DATABASE_VERSION = 1
        const val TABLE_NAME = "user"
        const val COLUMN_ID = "id"
        const val COLUMN_EMAIL = "email"
        const val COLUMN_FULLNAME = "fullname"
        const val COLUMN_BIRTHDAY = "birthday"
        const val COLUMN_TOKEN = "token"
        const val COLUMN_PROFILE_IMAGE_URL = "profile_image_url"
        const val COLUMN_COUNTRY = "country"
    }

    override fun onCreate(db: SQLiteDatabase?) {
        val createTable = ("CREATE TABLE $TABLE_NAME ("
                + "$COLUMN_ID TEXT PRIMARY KEY,"
                + "$COLUMN_EMAIL TEXT,"
                + "$COLUMN_FULLNAME TEXT,"
                + "$COLUMN_BIRTHDAY TEXT,"
                + "$COLUMN_TOKEN TEXT,"
                + "$COLUMN_PROFILE_IMAGE_URL TEXT,"
                + "$COLUMN_COUNTRY TEXT)")
        db?.execSQL(createTable)
    }

    override fun onUpgrade(db: SQLiteDatabase?, oldVersion: Int, newVersion: Int) {
        db?.execSQL("DROP TABLE IF EXISTS $TABLE_NAME")
        onCreate(db)
    }

    fun insertUserData(id: String, email: String, fullname: String, birthday: String, token: String, profileImageUrl: String, country: String) {
        val db = this.writableDatabase
        val insertQuery = "INSERT OR REPLACE INTO $TABLE_NAME (id, email, fullname, birthday, token, profile_image_url, country) VALUES (?, ?, ?, ?, ?, ?, ?)"
        db.execSQL(insertQuery, arrayOf(id, email, fullname, birthday, token, profileImageUrl, country))
    }

    fun getUserData(): User? {
        val db = this.readableDatabase
        val query = "SELECT * FROM $TABLE_NAME LIMIT 1"
        val cursor = db.rawQuery(query, null)
        return if (cursor.moveToFirst()) {
            User(
                id = cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_ID)),
                email = cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_EMAIL)),
                fullname = cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_FULLNAME)),
                birthday = cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_BIRTHDAY)),
                token = cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_TOKEN)),
                profileImageUrl = cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_PROFILE_IMAGE_URL)),
                country = cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_COUNTRY))
            )
        } else {
            null
        }
    }

    fun updateFullname(newFullname: String) {
        val db = this.writableDatabase
        val contentValues = ContentValues()
        contentValues.put("fullname", newFullname)

        // Cập nhật bảng người dùng
        db.update("user", contentValues, "id = ?", arrayOf(UserSession.user?._id))
        db.close()
    }

    fun clearUserData() {
        val db = this.writableDatabase
        db.execSQL("DELETE FROM $TABLE_NAME")
    }
}