package thanhnhan.myproject.socialmedia.ui.view.HomeScreen

import android.hardware.camera2.CameraAccessException
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.ViewGroup
import androidx.camera.core.CameraSelector
import androidx.camera.core.CameraState
import androidx.camera.core.ImageCapture
import androidx.camera.core.ImageCaptureException
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.camera.core.Preview as Preview1
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner

import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import coil.compose.rememberAsyncImagePainter
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import thanhnhan.myproject.socialmedia.R
import java.io.File

@Composable
fun LocketScreen(navController: NavController) {
    var lensFacing by remember { mutableStateOf(CameraSelector.LENS_FACING_BACK) }
    var capturedImageUri by remember { mutableStateOf<Uri?>(null) }
    val imageCapture = remember { ImageCapture.Builder().build() }
    var isCameraReady by remember { mutableStateOf(true) }
    var cameraProvider: ProcessCameraProvider? = null

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF22272E))
    ) {
        Column {
            TopBar(navController)
            MainContent(
                lensFacing = lensFacing,
                capturedImageUri = capturedImageUri,
                onCaptureImage = { uri -> capturedImageUri = uri },
                imageCapture = imageCapture,
                onCameraReady = { isCameraReady = true },
                cameraProvider = cameraProvider
            )
            Spacer(modifier = Modifier.weight(1f))
            BottomBar(
                lensFacing = lensFacing,
                onSwitchCamera = {
                    isCameraReady = false
                    lensFacing = if (lensFacing == CameraSelector.LENS_FACING_BACK) {
                        CameraSelector.LENS_FACING_FRONT
                    } else {
                        CameraSelector.LENS_FACING_BACK
                    }

                    // Đảm bảo camera được chuẩn bị kỹ càng
                    Handler(Looper.getMainLooper()).postDelayed({
                        isCameraReady = true
                    }, 500)
                },
                imageCapture = imageCapture,
                onCaptureImage = { uri -> capturedImageUri = uri },
                isCameraReady = isCameraReady,
                cameraProvider = cameraProvider
            )
        }
    }
}

    @Composable
    fun TopBar(navController: NavController) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            IconButton(
                onClick = { navController.navigate("UserProfile") },
                modifier = Modifier.size(60.dp)
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.user),
                    contentDescription = "Profile",
                    modifier = Modifier.size(50.dp),
                    tint = Color(0xFFCFCFCF) // Thay đổi màu sắc tại đây
                )
            }

            Button(
                onClick = { navController.navigate("friendsScreen") },
                modifier = Modifier
                    .height(50.dp)
                    .width(150.dp) ,
                colors = ButtonDefaults.buttonColors(containerColor = Color.DarkGray),
                shape = RoundedCornerShape(20.dp)
            ) {
                Text("Friends", color = Color.White, onTextLayout = {})
            }

            IconButton(
                onClick = { /* TODO */ },
                modifier = Modifier.size(60.dp)
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.chat),
                    contentDescription = "Chat",
                    tint = Color(0xFFCFCFCF),
                    modifier = Modifier.size(50.dp)

                )
            }
        }
    }

@Composable
fun MainContent(
    lensFacing: Int,
    capturedImageUri: Uri?,
    onCaptureImage: (Uri) -> Unit,
    imageCapture: ImageCapture,
    onCameraReady: () -> Unit,
    cameraProvider: ProcessCameraProvider?
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(1f)
            .padding(16.dp)
            .clip(RoundedCornerShape(20.dp))
    ) {
        if (capturedImageUri != null) {
            Image(
                painter = rememberAsyncImagePainter(capturedImageUri),
                contentDescription = "Captured Image",
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop
            )
        } else {
            CameraPreview(
                modifier = Modifier.fillMaxSize(),
                lensFacing = lensFacing,
                imageCapture = imageCapture,
                onCameraReady = onCameraReady,
                cameraProvider = cameraProvider // Truyền camera provider để quản lý lifecycle
            )
        }
    }
}



@Composable
fun BottomBar(
    lensFacing: Int,
    onSwitchCamera: () -> Unit,
    imageCapture: ImageCapture,
    onCaptureImage: (Uri) -> Unit,
    isCameraReady: Boolean,
    cameraProvider: ProcessCameraProvider? // Truyền camera provider để quản lý session
) {
    val context = LocalContext.current
    val mainExecutor = ContextCompat.getMainExecutor(context)

    // Sử dụng coroutine để xử lý ảnh trong background thread
    val scope = rememberCoroutineScope()

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = { /* TODO */ }, modifier = Modifier.size(60.dp)) {
                Icon(
                    painter = painterResource(id = R.drawable.flash),
                    contentDescription = "Flash",
                    modifier = Modifier.size(50.dp),
                    tint = Color(0xFFCFCFCF)
                )
            }

            IconButton(
                onClick = {
                    Log.d("Shot","Shot Button clicked")
                    if (isCameraReady) {
                        scope.launch {
                            val photoFile = withContext(Dispatchers.IO) {
                                File.createTempFile("IMG_", ".jpg", context.cacheDir)
                            }
                            val outputOptions = ImageCapture.OutputFileOptions.Builder(photoFile).build()

                            imageCapture.takePicture(
                                outputOptions,
                                mainExecutor,
                                object : ImageCapture.OnImageSavedCallback {
                                    override fun onImageSaved(outputFileResults: ImageCapture.OutputFileResults) {
                                        Log.d("CameraShot", "Image saved at: ${photoFile.absolutePath}")
                                        onCaptureImage(Uri.fromFile(photoFile))
                                    }

                                    override fun onError(exception: ImageCaptureException) {
                                        Log.e("CameraShot", "Image capture failed: ${exception.message}", exception)
                                    }
                                }
                            )
                        }
                    } else {
                        Log.d("CameraShot", "Camera is not ready yet!")
                    }
                },
                modifier = Modifier
                    .clip(CircleShape)
                    .size(70.dp)
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.rec),
                    contentDescription = "Shot",
                    tint = Color.Yellow,
                    modifier = Modifier.size(70.dp)
                )
            }

            IconButton(
                onClick = { onSwitchCamera() },
                modifier = Modifier.size(60.dp)
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.switch_camera),
                    contentDescription = "Camera",
                    modifier = Modifier
                        .size(50.dp)
                        .clip(RectangleShape),
                    tint = Color(0xFFCFCFCF)
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))
        Text("Lịch sử", color = Color.White)
    }
}

@Composable
fun CameraPreview(
    modifier: Modifier = Modifier,
    lensFacing: Int,
    imageCapture: ImageCapture,
    onCameraReady: () -> Unit,
    cameraProvider: ProcessCameraProvider? // Truyền camera provider để quản lý session
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current

    AndroidView(
        factory = { ctx ->
            PreviewView(ctx).apply {
                layoutParams = ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )
                implementationMode = PreviewView.ImplementationMode.COMPATIBLE
            }
        },
        modifier = modifier,
        update = { previewView ->
            val cameraProviderFuture = ProcessCameraProvider.getInstance(context)
            cameraProviderFuture.addListener({
                val cameraProvider: ProcessCameraProvider = cameraProviderFuture.get()
                cameraProvider.unbindAll()
                bindPreview(cameraProvider, previewView, lifecycleOwner, lensFacing, imageCapture)
                onCameraReady()
            }, ContextCompat.getMainExecutor(context))
        }
    )
}

fun bindPreview(
    cameraProvider: ProcessCameraProvider,
    previewView: PreviewView,
    lifecycleOwner: LifecycleOwner,
    lensFacing: Int,
    imageCapture: ImageCapture
) {
    val preview = Preview1.Builder().build().also {
        it.setSurfaceProvider(previewView.surfaceProvider)
    }

    val cameraSelector = CameraSelector.Builder()
        .requireLensFacing(lensFacing)
        .build()

    try {
        // Unbind mọi phiên camera trước khi bind phiên mới
        cameraProvider.unbindAll()

        val camera = cameraProvider.bindToLifecycle(
            lifecycleOwner,
            cameraSelector,
            preview,
            imageCapture
        )

        // Kiểm tra trạng thái của camera sau khi bind
        val cameraInfo = camera.cameraInfo
        cameraInfo.cameraState.observe(lifecycleOwner) { state ->
            when (state.type) {
                CameraState.Type.OPEN -> {
                    Log.d("CameraState", "Camera đã mở thành công")
                }

                CameraState.Type.CLOSED -> {
                    Log.d("CameraState", "Camera đã đóng")
                }

                CameraState.Type.PENDING_OPEN -> {
                    Log.d("CameraState", "Camera đang chờ mở")
                }

                CameraState.Type.CLOSING -> {
                    Log.d("CameraState", "Camera đang đóng")
                }

                else -> {
                    Log.d("CameraState", "Trạng thái camera không xác định: ${state.type}")
                }
            }

            if (state.error != null) {
                Log.e("CameraStateError", "Camera gặp lỗi: ${state.error}")
            }
        }

    } catch (exc: Exception) {
        Log.e("CameraBindError", "Lỗi khi bind camera", exc)
    }
}
    @Preview(showBackground = true)
    @Composable
    fun LocketScreenPreview() {
        val navController = rememberNavController()
        LocketScreen(navController = navController )
    }
