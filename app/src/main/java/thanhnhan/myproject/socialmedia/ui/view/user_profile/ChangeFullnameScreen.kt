package thanhnhan.myproject.socialmedia.ui.view.user_profile

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.delay
import thanhnhan.myproject.socialmedia.data.model.UserSession
import thanhnhan.myproject.socialmedia.data.Result
import thanhnhan.myproject.socialmedia.data.database.UserDatabaseHelper
import thanhnhan.myproject.socialmedia.data.model.SignInUserResponse
import thanhnhan.myproject.socialmedia.data.network.RetrofitInstance
import thanhnhan.myproject.socialmedia.data.repository.UserProfileRepository
import thanhnhan.myproject.socialmedia.ui.theme.AppTextField
import thanhnhan.myproject.socialmedia.ui.theme.AppTheme
import thanhnhan.myproject.socialmedia.ui.theme.SocialMediaTheme
import thanhnhan.myproject.socialmedia.ui.view.sign_up.AppName
import thanhnhan.myproject.socialmedia.ui.view.sign_up.BackIconButton
import thanhnhan.myproject.socialmedia.ui.view.sign_up.ContinueButton
import thanhnhan.myproject.socialmedia.ui.view.sign_up.LogoImage
import thanhnhan.myproject.socialmedia.viewmodel.UserProfileViewModel
import thanhnhan.myproject.socialmedia.viewmodel.UserProfileViewModelFactory

@Composable
fun ChangeFullname(
    openUserProfile: () -> Unit,
    backAction: () -> Unit = {}
) {
    AppTheme {
        val context = LocalContext.current
        var fullname by remember { mutableStateOf(UserSession.user!!.fullname) } // Lưu tên đầy đủ hiện tại

        val api = RetrofitInstance.api
        val userRepository = UserProfileRepository(api)
        val userViewModel: UserProfileViewModel =
            viewModel(factory = UserProfileViewModelFactory(userRepository))
        val changeFullnameResult by userViewModel.changeFullnameResult.collectAsState() // Kết quả từ việc đổi tên đầy đủ

        LaunchedEffect(changeFullnameResult) {
            changeFullnameResult?.let { result ->
                when (result) {
                    is Result.Success -> {
                        val metadata = result.data?.metadata

                        // Nếu đổi tên thành công, cập nhật trong local SQLite và UserSession
                        val newFullname = metadata?.fullname ?: ""
                        Toast.makeText(
                            context,
                            "Fullname changed to: $newFullname",
                            Toast.LENGTH_LONG
                        ).show()

                        // Cập nhật vào SQLite
                        val dbHelper = UserDatabaseHelper(context)
                        dbHelper.updateFullname(newFullname)

                        // Cập nhật thông tin trong UserSession
                        UserSession.user?.fullname = newFullname

                        // Điều hướng quay lại UserProfile
                        openUserProfile()
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

        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(color = Color(0xFF22272E))
        ) {
            BackIconButton(backAction)
            LogoImage()
            AppName()
            Spacer(modifier = Modifier.height(80.dp))

            // TextField để nhập tên mới
            AppTextField(
                value = fullname,
                onValueChange = {
                    fullname = it
                },
                modifier = Modifier
                    .width(300.dp)
                    .align(Alignment.CenterHorizontally)
            )


            Spacer(modifier = Modifier.height(145.dp))

            // Nút tiếp tục
            ContinueButton(
                text = "Save",
                icon = Icons.Default.ArrowForward,
                isEnable = fullname.isNotEmpty(), // Kích hoạt nút nếu tên đầy đủ không rỗng
                onClick = {
                    userViewModel.changeFullname(UserSession.signInToken!!, fullname)
                }
            )
        }
    }
}

@Composable
@Preview(showBackground = true, showSystemUi = true)
fun ChangeFullnamePreview() {
    SocialMediaTheme {
        UserSession.setUserData(
            SignInUserResponse.Metadata.User(
                _id = "12345",
                email = "user@gmail.com",
                fullname = "John Doe",
                birthday = "15/07/2003",
                profileImageUrl = "https://via.placeholder.com/150",  // URL ảnh đại diện giả lập
                friendList = listOf(),
                friendInvites = listOf(),
                country = "VN"
            ),
            token = "mockToken"
        )

        ChangeFullname(
            openUserProfile = { }
        )
    }
}
