package thanhnhan.myproject.socialmedia.ui.view.user_profile

import android.app.Activity
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.Log
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.result.launch
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.Surface
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.Place
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.rememberAsyncImagePainter
import com.yalantis.ucrop.UCrop
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody
import thanhnhan.myproject.socialmedia.R
import thanhnhan.myproject.socialmedia.data.database.UserDatabaseHelper
import thanhnhan.myproject.socialmedia.data.model.SignInUserResponse
import thanhnhan.myproject.socialmedia.data.model.UserSession
import thanhnhan.myproject.socialmedia.data.network.RetrofitInstance
import thanhnhan.myproject.socialmedia.data.repository.UserProfileRepository
import thanhnhan.myproject.socialmedia.ui.theme.AppTheme
import thanhnhan.myproject.socialmedia.utils.FileUtils.bitmapToUri
import thanhnhan.myproject.socialmedia.utils.FileUtils.uriToFile
import thanhnhan.myproject.socialmedia.viewmodel.UserProfileViewModel
import thanhnhan.myproject.socialmedia.viewmodel.UserProfileViewModelFactory
import java.io.File
import thanhnhan.myproject.socialmedia.data.Result
import thanhnhan.myproject.socialmedia.data.repository.SignInUserRepository
import thanhnhan.myproject.socialmedia.viewmodel.SignInUserViewModel
import thanhnhan.myproject.socialmedia.viewmodel.SignInUserViewModelFactory
import android.Manifest
import android.graphics.Bitmap
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.material.icons.filled.Close
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage
import androidx.camera.core.ExperimentalGetImage
import androidx.compose.ui.graphics.asImageBitmap
import com.google.zxing.BarcodeFormat
import com.google.zxing.qrcode.QRCodeWriter
import android.graphics.Color as AndroidColor

@Composable
fun ProfileScreen(
    openChangeEmail: () -> Unit,
    openChangeBirthday: () -> Unit,
    openChangeCountry: () -> Unit,
    openChangeFullname: () -> Unit,
    repository: UserProfileRepository,  // Truyền repository từ đây
    authToken: String,  // Nhận authToken
    openIntro: () -> Unit,
) {
    val user = UserSession.user
    val userProfileViewModel: UserProfileViewModel = viewModel(
        factory = UserProfileViewModelFactory(repository)
    )

    LaunchedEffect(Unit) {
        // Kết nối socket khi màn hình được mở
        userProfileViewModel.connectSocket()
    }

    DisposableEffect(Unit) {
        onDispose {
            // Ngắt kết nối socket khi màn hình bị hủy
            userProfileViewModel.disconnectSocket()
        }
    }
    if (user != null) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFF22272E))
                .padding(16.dp)
        ) {
            // Profile Section
            val linkAddFriend by remember {
                mutableStateOf("https://selection-page-production.up.railway.app/friend/" + user._id)
            }
            val context = LocalContext.current
            val clipboardManager =
                context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager

            ProfileSection(
                userAvatar = user.profileImageUrl,
                userName = user.fullname,
                openChangeFullname = openChangeFullname,
                repository = repository,
                authToken = authToken,
            )

            Spacer(modifier = Modifier.height(40.dp))

            // Invite Section
            InviteSection(
                userAvatar = user.profileImageUrl,
                linkAddFriend = linkAddFriend,
                context = context,
                clipboardManager = clipboardManager,
                viewmodel = userProfileViewModel
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Settings Section
            SettingsSection(
                openChangeEmail = openChangeEmail,
                openChangeBirthday = openChangeBirthday,
                openChangeCountry = openChangeCountry
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Summary Section
            SummarySection(openIntro)
        }
    } else {
        Text(
            text = "No user data available",
            style = TextStyle(color = Color.Black),
            modifier = Modifier.fillMaxSize(),
            textAlign = TextAlign.Center
        )
    }
}

@Composable
fun ProfileSection(
    userAvatar: String,
    userName: String,
    openChangeFullname: () -> Unit,
    repository: UserProfileRepository,  // Nhận repository
    authToken: String,  // Nhận authToken
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 60.dp)
    ) {
        // Profile Icon
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier
                .height(150.dp)
                .width(150.dp)
        ) {
            CircularImageView(
                size = 150,
                url = userAvatar
            )

            Box(
                modifier = Modifier
                    .size(40.dp)
                    .background(AppTheme.appButtonStyle.backgroundColor, CircleShape)
                    .align(Alignment.BottomEnd)
            ) {

                AvatarChangeButton(authToken = authToken, repository = repository)
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Display user's name
        Text(
            text = userName,  // Hiển thị tên người dùng từ UserSession
            style = TextStyle(color = Color.White, fontSize = 24.sp)
        )

        Spacer(modifier = Modifier.height(8.dp))

        // Edit Button
        Button(
            onClick = {
                openChangeFullname()
            },
            colors = ButtonDefaults.buttonColors(
                containerColor = AppTheme.appButtonStyle.backgroundColor,
                disabledContainerColor = Color.Gray,
                disabledContentColor = Color.White
            ),
        ) {
            Text(text = "Edit Username", color = Color.White)
        }
    }
}

@Composable
fun QRCodeDialog(onDismiss: () -> Unit, qrCodeBitmap: ImageBitmap?) {
    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(dismissOnClickOutside = true)
    ) {
        Surface(
            shape = MaterialTheme.shapes.medium,
            elevation = 8.dp
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                if (qrCodeBitmap != null) {
                    Image(bitmap = qrCodeBitmap, contentDescription = "QR Code")
                } else {
                    Text(text = "Failed to generate QR code")
                }
                Spacer(modifier = Modifier.height(8.dp))
                Button(onClick = onDismiss) {
                    Text(text = "Close")
                }
            }
        }
    }
}

@Composable
fun CircularImageView(
    url: String,
    size: Int,
) {
    // Thêm log để kiểm tra URL hình ảnh
    Log.d("CircularImageView", "Image URL: $url")
    Image(
        painter = rememberAsyncImagePainter(
            model = url,
            placeholder = painterResource(id = R.drawable.ic_launcher_background),
            error = painterResource(id = R.drawable.ic_launcher_foreground) // Hình ảnh hiển thị khi có lỗi
        ),
        contentDescription = null,
        contentScale = ContentScale.Crop,
        modifier = Modifier
            .size(size.dp)
            .clip(CircleShape)
            .border(
                width = 4.dp,
                color = AppTheme.appButtonStyle.backgroundColor,
                shape = CircleShape
            )
    )
}

@Composable
fun InviteSection(
    userAvatar: String,
    linkAddFriend: String,
    context: Context,
    clipboardManager: ClipboardManager,
    viewmodel: UserProfileViewModel,
) {
    var showQRDialog by remember { mutableStateOf(false) }
    var showScanner by remember { mutableStateOf(false) }
    
    // Request camera permission
    val launcher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (isGranted) {
            showScanner = true
        } else {
            Toast.makeText(context, "Camera permission required", Toast.LENGTH_SHORT).show()
        }
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFF3C434A), RoundedCornerShape(8.dp))
            .padding(16.dp)
    ) {
        Text(
            text = "Invite friends to join Sky Line",
            style = TextStyle(color = Color.White)
        )
        Spacer(modifier = Modifier.height(8.dp))
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            CircularImageView(
                size = 40,
                url = userAvatar
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                modifier = Modifier.width(200.dp),
                text = linkAddFriend,
                style = TextStyle(color = Color.Gray),
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            var showDialog by remember { mutableStateOf(false) }
            val qrCodeBitmap = viewmodel.generateQRCode(linkAddFriend, 700, 700)

            IconButton(onClick = {
                val clip = ClipData.newPlainText("simple text", linkAddFriend)
                clipboardManager.setPrimaryClip(clip)
                Toast.makeText(context, "Link copied to clipboard", Toast.LENGTH_SHORT).show()
                showQRDialog = true
            }) {
                Icon(
                    imageVector = Icons.Default.Share,
                    contentDescription = null,
                    tint = Color.Gray
                )
            }
            
            // Add QR Scanner button
            IconButton(modifier = Modifier.size(40.dp),onClick = {
                launcher.launch(Manifest.permission.CAMERA)
            }) {
                Icon(
                    painter = painterResource(R.drawable.scan),
                    contentDescription = "Scan QR Code",
                    tint = Color.Gray
                )
            }
        }
        
        if (showQRDialog) {
            QRCodeDialog(onDismiss = { showQRDialog = false }, qrCodeBitmap = generateQRCode(linkAddFriend, 800, 800))
        }
        
        if (showScanner) {
            QRScannerDialog(
                onDismiss = { showScanner = false },
                onQrCodeScanned = { url ->
                    try {
                        // Tạo Intent để mở trình duyệt
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                        // Thêm flag để mở trong tab mới
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        context.startActivity(intent)
                        
                        // Đóng scanner sau khi mở URL
                        showScanner = false
                    } catch (e: Exception) {
                        Toast.makeText(
                            context,
                            "Cannot open this URL: $url",
                            Toast.LENGTH_LONG
                        ).show()
                        e.printStackTrace()
                    }
                }
            )
        }
    }
}

@Composable
fun SettingsSection(
    openChangeEmail: () -> Unit,
    openChangeBirthday: () -> Unit,
    openChangeCountry: () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFF3C434A), RoundedCornerShape(8.dp))
            .padding(16.dp)
    ) {
        SettingItem(
            icon = Icons.Default.Email,
            text = "Change your email",
            onClick = {
                openChangeEmail()
            }
        )
        Divider(color = Color.Gray)
        Spacer(modifier = Modifier.height(10.dp))
        SettingItem(
            icon = Icons.Default.DateRange,
            text = "Change your birthday",
            onClick = {
                openChangeBirthday()
            }
        )
        Spacer(modifier = Modifier.height(10.dp))
        Divider(color = Color.Gray)
        SettingItem(
            icon = Icons.Default.Place,
            text = "Change your country",
            onClick = {
                openChangeCountry()
            }
        )
    }
}

@Composable
fun SummarySection(openIntro: () -> Unit) {
    val context = LocalContext.current
    val viewModelFactory =
        SignInUserViewModelFactory(SignInUserRepository(RetrofitInstance.api), context)
    val viewModel: SignInUserViewModel = viewModel(factory = viewModelFactory)
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFF3C434A), RoundedCornerShape(8.dp))
            .padding(16.dp)
    ) {
        SettingItem(
            icon = Icons.Default.ExitToApp,
            text = "Sign Out",
            onClick = {
                viewModel.logout()
                openIntro()
            }
        )
        Divider(color = Color.Gray)
        var showDialog by remember { mutableStateOf(false) }
        var inputValue by remember { mutableStateOf("") }

        val api = RetrofitInstance.api
        val repository = UserProfileRepository(api)
        val userViewModel: UserProfileViewModel = viewModel(factory = UserProfileViewModelFactory(repository))
        val sendDeleteAccountCodeResult = userViewModel.sendDeleteAccountCodeResult.collectAsState().value
        val deleteAccountResult = userViewModel.deleteAccountResult.collectAsState().value

        LaunchedEffect(key1 = sendDeleteAccountCodeResult) {
            sendDeleteAccountCodeResult?.let { result ->
                when (result) {
                    is Result.Success -> {
                        Toast.makeText(
                            context,
                            "${result.data?.message}",
                            Toast.LENGTH_LONG
                        ).show()
                    }
                    is Result.Error -> {
                        Toast.makeText(
                            context,
                            result.message ?: "Error occurred",
                            Toast.LENGTH_LONG
                        ).show()
                    }
                }
            }
        }

        LaunchedEffect(key1 = deleteAccountResult) {
            deleteAccountResult?.let { result ->
                when (result) {
                    is Result.Success -> {
                        Toast.makeText(
                            context,
                            "${result.data?.message}",
                            Toast.LENGTH_LONG
                        ).show()
                        viewModel.logout()
                        openIntro()
                    }
                    is Result.Error -> {
                        Toast.makeText(
                            context,
                            result.message ?: "Error occurred",
                            Toast.LENGTH_LONG
                        ).show()
                        Log.d("DEBUG", result.message ?: "Error occurred")
                    }
                }
            }
        }

        if (showDialog) {
            AlertDialog(
                onDismissRequest = { showDialog = false },
                title = { Text(text = "Confirmation") },
                text = {
                    Column {
                        Text(text = "Please enter the code sent to your email to delete your account.")
                        Spacer(modifier = Modifier.height(8.dp))
                        OutlinedTextField(
                            value = inputValue,
                            onValueChange = {
                                if (it.all { char -> char.isDigit() }) {
                                    inputValue = it
                                }
                            },
                            label = { Text("Enter number") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                        )
                    }
                },
                confirmButton = {
                    Button(
                        onClick = {
                            userViewModel.deleteAccount(UserSession.signInToken!!, inputValue.toInt())
                        }
                    ) {
                        Text("Confirm")
                    }
                },
                dismissButton = {
                    Button(
                        onClick = { showDialog = false }
                    ) {
                        Text("Cancel")
                    }
                }
            )
        }
        SettingItem(
            icon = Icons.Default.Delete,
            text = "Delete account",
            onClick = {
                userViewModel.sendDeleteAccountCode(UserSession.signInToken!!)
                showDialog = true
            },
            color = Color.Red
        )
    }
}

@Composable
fun SettingItem(
    icon: ImageVector,
    text: String,
    onClick: () -> Unit,
    color: Color = Color.White,
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick.invoke() }
            .padding(vertical = 8.dp)
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = color
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(
            text = text,
            style = TextStyle(color = color),
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AvatarChangeButton(authToken: String, repository: UserProfileRepository) {
    var showModalSheet by remember { mutableStateOf(false) }  // Trạng thái ể kiểm soát hiển thị ModalBottomSheet
    val context = LocalContext.current
    val userProfileViewModel: UserProfileViewModel = viewModel(
        factory = UserProfileViewModelFactory(repository) // Sử dụng factory để khởi tạo viewModel
    )
    val authToken = UserSession.signInToken ?: ""

    // Lắng nghe kết quả từ ViewModel
    val changeAvatarResult by userProfileViewModel.changeAvatarResult.collectAsState()

    // Launcher để xử lý UCrop
    val uCropLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            val resultUri = UCrop.getOutput(result.data!!)
            Log.d("UCrop", "Cropped image Uri: $resultUri")

            resultUri?.let { uri ->
                val avatarFile = uriToFile(uri, context)
                avatarFile?.let {
                    val requestFile = RequestBody.create("image/jpeg".toMediaTypeOrNull(), it)
                    val body = MultipartBody.Part.createFormData("file", it.name, requestFile)

                    Log.d("ChangeAvatar", "Cropped image path: ${it.absolutePath}")
                    userProfileViewModel.changeAvatar(authToken, body)
                    showModalSheet = false
                } ?: run {
                    Log.e("ChangeAvatar", "Failed to convert cropped Uri to File")
                }
            } ?: run {
                Log.e("ChangeAvatar", "No Uri returned from UCrop")
            }
        }
    }

    // Xử lý kết quả trả về của việc thay đổi avatar
    LaunchedEffect(changeAvatarResult) {
        changeAvatarResult?.let { result ->
            when (result) {
                is Result.Success -> {
                    val metadata = result.data?.metadata

                    // Lấy URL avatar mới
                    val newProfileImageUrl = metadata?.profileImageUrl ?: ""
                    Toast.makeText(
                        context,
                        "Avatar changed successfully",
                        Toast.LENGTH_LONG
                    ).show()

                    // Cập nhật vào SQLite
                    val dbHelper = UserDatabaseHelper(context)
                    dbHelper.updateProfileImage(newProfileImageUrl)

                    // Cập nhật UserSession
                    UserSession.user?.profileImageUrl = newProfileImageUrl
                }

                is Result.Error -> {
                    Toast.makeText(
                        context,
                        result.message ?: "Error occurred",
                        Toast.LENGTH_LONG
                    ).show()
                }

                else -> {
                    // Optional: handle other cases if needed
                }
            }
        }
    }

// Launcher để chọn ảnh từ thư viện
    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let {
            // Tạo URI đích cho ảnh đã cắt
            val destinationUri = Uri.fromFile(File(context.cacheDir, "cropped_image.jpg"))
            // Cấu hình UCrop để cắt ảnh vuông
            val uCropIntent = UCrop.of(uri, destinationUri)
                .withAspectRatio(1f, 1f)  // Kích thước vuông
                .withMaxResultSize(1080, 1080)
                .getIntent(context)

            uCropLauncher.launch(uCropIntent)  // Khởi chạy UCrop
        }
    }

    // Launcher để chụp ảnh từ Camera
    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicturePreview()
    ) { bitmap: Bitmap? ->
        bitmap?.let {
            val uri = bitmapToUri(bitmap, context)  // Chuyển bitmap sang URI để sử dụng với UCrop
            uri?.let { uri ->
                val destinationUri =
                    Uri.fromFile(File(context.cacheDir, "cropped_camera_image.jpg"))
                val uCropIntent = UCrop.of(uri, destinationUri)
                    .withAspectRatio(1f, 1f)  // Kích thước vuông
                    .withMaxResultSize(1080, 1080)
                    .getIntent(context)

                uCropLauncher.launch(uCropIntent)
            } ?: run {
                Log.e("ChangeAvatar", "Failed to convert Bitmap to Uri")
            }
        }
    }
    // IconButton khi được nhấn sẽ hiển thị ModalBottomSheet
    IconButton(onClick = {
        showModalSheet = true
    }) {
        Icon(
            imageVector = Icons.Default.Add,
            contentDescription = "Change avatar",
            tint = Color.White

        )
    }

    // ModalBottomSheet khi `showModalSheet` là true
    if (showModalSheet) {
        ModalBottomSheet(
            onDismissRequest = { showModalSheet = false },  // Đóng Modal khi nhấn ra ngoài
            modifier = Modifier.fillMaxHeight(0.4f)  // Hiển thị modal chiếm toàn bộ chiều cao
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(color = Color(0xFF22272E))
                    .padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Text(
                    "Choose an option",
                    style = MaterialTheme.typography.titleMedium,
                    color = Color.White
                )

                // Tùy chọn 1: Choose from Gallery
                Button(
                    onClick = {
                        galleryLauncher.launch("image/*")  // Mở Gallery để chọn ảnh
                        showModalSheet = false  // Ẩn modal sau khi chọn
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(70.dp)
                        .padding(horizontal = 8.dp, vertical = 8.dp),
                    colors = ButtonDefaults.buttonColors(Color(0xFF3C434A))
                ) {
                    Text("Choose from Gallery")
                }

                // Tùy chọn 2: Shot by camera
                Button(
                    onClick = {
                        cameraLauncher.launch()  // Mở camera để chụp ảnh
                        showModalSheet = false  // Ẩn modal sau khi chọn
                        // TODO: Implement camera capture
                        showModalSheet = false  // Ẩn modal sau khi chọn
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(70.dp)
                        .padding(horizontal = 8.dp, vertical = 8.dp),
                    colors = ButtonDefaults.buttonColors(Color(0xFF3C434A))
                ) {
                    Text("Shot by camera")
                }

                // Tùy chọn 3: Exit
                Button(
                    onClick = {
                        showModalSheet = false  // Đóng modal
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(70.dp)
                        .padding(horizontal = 8.dp, vertical = 8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color.Red)
                ) {
                    Text("Exit")
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun ProfileScreenPreview() {
    val mockRepository = UserProfileRepository(RetrofitInstance.api)
    UserSession.setUserData(
        SignInUserResponse.Metadata.User(
            _id = "12345",
            email = "ndhuynh13@gmail.com",
            fullname = "Nguyen Huynh",
            birthday = "13/07/2003",
            profileImageUrl = "https://via.placeholder.com/150",  // URL ảnh đại diện giả lập
            friendList = listOf(),
            friendInvites = listOf(),
            country = "VN"
        ),
        token = "mockToken"
    )

    ProfileScreen(
        openChangeEmail = {},
        openChangeBirthday = {},
        openChangeCountry = {},
        openChangeFullname = {},
        repository = mockRepository,  // Truyền repository giả lập
        authToken = "mockToken",
        openIntro = {}
    )  // Gọi ProfileScreen với dữ liệu đã giả lập
}

@androidx.annotation.OptIn(ExperimentalGetImage::class)
@Composable
fun QRScannerDialog(onDismiss: () -> Unit, onQrCodeScanned: (String) -> Unit) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val cameraProviderFuture = remember { ProcessCameraProvider.getInstance(context) }
    
    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(dismissOnClickOutside = true)
    ) {
        Surface(
            shape = MaterialTheme.shapes.medium,
            modifier = Modifier.size(300.dp)
        ) {
            Box {
                AndroidView(
                    factory = { ctx ->
                        PreviewView(ctx).apply {
                            implementationMode = PreviewView.ImplementationMode.COMPATIBLE
                        }
                    },
                    modifier = Modifier.fillMaxSize(),
                ) { previewView ->
                    cameraProviderFuture.addListener({
                        val cameraProvider = cameraProviderFuture.get()
                        val preview = androidx.camera.core.Preview.Builder().build()
                        preview.setSurfaceProvider(previewView.surfaceProvider)

                        val imageAnalysis = ImageAnalysis.Builder()
                            .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                            .build()

                        imageAnalysis.setAnalyzer(
                            ContextCompat.getMainExecutor(context)
                        ) { imageProxy ->
                            val mediaImage = imageProxy.image
                            if (mediaImage != null) {
                                val image = InputImage.fromMediaImage(
                                    mediaImage,
                                    imageProxy.imageInfo.rotationDegrees
                                )
                                
                                val scanner = BarcodeScanning.getClient()
                                scanner.process(image)
                                    .addOnSuccessListener { barcodes ->
                                        for (barcode in barcodes) {
                                            if (barcode.valueType == Barcode.TYPE_URL) {
                                                barcode.url?.url?.let { url ->
                                                    // Kiểm tra URL có hợp lệ không
                                                    if (isValidUrl(url)) {
                                                        onQrCodeScanned(url)
                                                    } else {
                                                        Toast.makeText(
                                                            context,
                                                            "Invalid URL detected",
                                                            Toast.LENGTH_SHORT
                                                        ).show()
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    .addOnCompleteListener {
                                        imageProxy.close()
                                    }
                            } else {
                                imageProxy.close()
                            }
                        }

                        try {
                            cameraProvider.unbindAll()
                            cameraProvider.bindToLifecycle(
                                lifecycleOwner,
                                CameraSelector.DEFAULT_BACK_CAMERA,
                                preview,
                                imageAnalysis
                            )
                        } catch (e: Exception) {
                            e.printStackTrace()
                        }
                    }, ContextCompat.getMainExecutor(context))
                }
                
                IconButton(
                    onClick = onDismiss,
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Close",
                        tint = Color.White
                    )
                }
            }
        }
    }
}

fun Bitmap.toImageBitmap() = android.graphics.Bitmap.createBitmap(
    this.width,
    this.height,
    android.graphics.Bitmap.Config.ARGB_8888
).apply {
    val canvas = android.graphics.Canvas(this)
    canvas.drawBitmap(this@toImageBitmap, 0f, 0f, null)
}.asImageBitmap()

fun generateQRCode(content: String, width: Int, height: Int): ImageBitmap? {
    return try {
        val writer = QRCodeWriter()
        val bitMatrix = writer.encode(content, BarcodeFormat.QR_CODE, width, height)
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.RGB_565)
        
        for (x in 0 until width) {
            for (y in 0 until height) {
                bitmap.setPixel(x, y, if (bitMatrix[x, y]) AndroidColor.BLACK else AndroidColor.WHITE)
            }
        }
        
        bitmap.toImageBitmap()
    } catch (e: Exception) {
        e.printStackTrace()
        null
    }
}

// Thêm hàm kiểm tra URL hợp lệ
private fun isValidUrl(urlString: String): Boolean {
    return try {
        val url = Uri.parse(urlString)
        url.scheme != null && (url.scheme == "http" || url.scheme == "https")
    } catch (e: Exception) {
        false
    }
}
