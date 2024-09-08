package thanhnhan.myproject.socialmedia.data.network

import okhttp3.Interceptor
import okhttp3.Request
import okhttp3.Response

class MyInterceptor : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val request: Request = chain.request()
            .newBuilder()
            .addHeader("api-key", "")
            .build()
        return chain.proceed(request)
    }
}

