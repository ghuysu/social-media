package thanhnhan.myproject.socialmedia.data.network

import com.google.gson.GsonBuilder
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import thanhnhan.myproject.socialmedia.data.model.IMessage
import thanhnhan.myproject.socialmedia.utils.Constants.Companion.BASE_URL

object RetrofitInstance {

    private val headerInterceptor = Interceptor { chain ->
        val request = chain.request().newBuilder()
            .addHeader("x-api-key", "abc-xyz-www")
            .build()
        chain.proceed(request)
    }

    private val client: OkHttpClient = OkHttpClient
        .Builder()
        .addInterceptor(headerInterceptor)
        .build()

    private val gson = GsonBuilder()
        .registerTypeAdapter(IMessage::class.java, IMessageTypeAdapter())
        .create()

    val api: Api = Retrofit.Builder()
        .addConverterFactory(GsonConverterFactory.create(gson))
        .baseUrl(Api.BASE_URL)
        .client(client)
        .build()
        .create(Api::class.java)
}