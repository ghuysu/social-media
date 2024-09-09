package thanhnhan.myproject.socialmedia.data.network

import okhttp3.Interceptor
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
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

    val api: Api = Retrofit.Builder()
        .addConverterFactory(GsonConverterFactory.create())
        .baseUrl(Api.BASE_URL)
        .client(client)
        .build()
        .create(Api::class.java)
}