package thanhnhan.myproject.socialmedia.ui.view.add_friend

import android.os.Handler
import android.os.Looper
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalInspectionMode
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.delay
import thanhnhan.myproject.socialmedia.data.model.SignInUserResponse
import thanhnhan.myproject.socialmedia.data.model.UserSession
import thanhnhan.myproject.socialmedia.data.network.RetrofitInstance
import thanhnhan.myproject.socialmedia.data.repository.FriendRepository
import thanhnhan.myproject.socialmedia.data.Result
import thanhnhan.myproject.socialmedia.data.network.SocketManager
import thanhnhan.myproject.socialmedia.data.repository.SignInUserRepository
import thanhnhan.myproject.socialmedia.data.repository.UserRepository
import thanhnhan.myproject.socialmedia.ui.theme.AppTheme
import thanhnhan.myproject.socialmedia.ui.view.user_profile.CircularImageView
import thanhnhan.myproject.socialmedia.viewmodel.FriendViewModel
import thanhnhan.myproject.socialmedia.viewmodel.FriendViewModelFactory
import thanhnhan.myproject.socialmedia.viewmodel.SignInUserViewModel
import thanhnhan.myproject.socialmedia.viewmodel.SignInUserViewModelFactory
import thanhnhan.myproject.socialmedia.viewmodel.UserViewModel
import thanhnhan.myproject.socialmedia.viewmodel.UserViewModelFactory

@Composable
fun AddFriendScreen(
    idOfFriend: String,
    nameOfFriend: String,
    urlOfFriend: String,
    openUserProfile: () -> Unit,
    openSignIn: () -> Unit
) {
    val context = LocalContext.current
    val viewModelFactory = SignInUserViewModelFactory(SignInUserRepository(RetrofitInstance.api), context)
    val signInViewModel: SignInUserViewModel = viewModel(factory = viewModelFactory)
    // Khởi tạo UserViewModel
    val userRepository = UserRepository(RetrofitInstance.api)
    val userViewModel: UserViewModel = viewModel(factory = UserViewModelFactory(userRepository))
    if (LocalInspectionMode.current) {
        // Chế độ preview không chạy logic phức tạp
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFF22272E))
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            CircularImageView(url = urlOfFriend, size = 200)
            Spacer(modifier = Modifier.height(10.dp))
            Text(
                text = nameOfFriend,
                fontWeight = FontWeight.Bold,
                fontSize = 30.sp,
                color = Color.White,
            )
            Spacer(modifier = Modifier.height(10.dp))
            Button(
                onClick = { /* No action in preview */ },
                colors = ButtonDefaults.buttonColors(
                    containerColor = AppTheme.appButtonStyle.backgroundColor,
                    disabledContainerColor = Color.Gray,
                    disabledContentColor = Color.White
                ),
            ) {
                Text(text = "Send invite", color = Color.White, fontSize = 20.sp)
            }
        }
        return
    }
    signInViewModel.autoSignIn()

    val user = UserSession.user

    if (user != null) {

        if (user._id != idOfFriend) {

            val api = RetrofitInstance.api
            val socketManager = SocketManager()
            socketManager.initSocket()

            val repository = FriendRepository(api)
            val viewModel: FriendViewModel = viewModel(factory = FriendViewModelFactory(repository, socketManager, userViewModel ))

            val sendInviteResult by viewModel.sendInviteResult.collectAsState()

            LaunchedEffect(sendInviteResult) {
                sendInviteResult?.let { result ->
                    when (result) {
                        is Result.Success -> {
                            Toast.makeText(
                                context,
                                "Send Invite Successfully",
                                Toast.LENGTH_LONG
                            ).show()
                            delay(1000)
                            UserSession.user!!.friendInvites = result.data!!.metadata!!.friendInvites
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
                    .background(Color(0xFF22272E))
                    .padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                CircularImageView(url = urlOfFriend, size = 200)
                Spacer(modifier = Modifier.height(10.dp))
                Text(
                    text = nameOfFriend,
                    fontWeight = FontWeight.Bold,
                    fontSize = 30.sp,
                    color = Color.White,
                )
                Spacer(modifier = Modifier.height(10.dp))
                Button(
                    onClick = {
                        viewModel.sendInvite(UserSession.signInToken!!, idOfFriend)
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = AppTheme.appButtonStyle.backgroundColor,
                        disabledContainerColor = Color.Gray,
                        disabledContentColor = Color.White
                    ),
                ) {
                    Text(text = "Send invite", color = Color.White, fontSize = 20.sp)
                }
            }
        } else {
            Toast.makeText(context, "Can't send invite yourself", Toast.LENGTH_LONG).show()
        }
    } else {
        Toast.makeText(context, "Sign in and send invite again", Toast.LENGTH_LONG).show()
        Handler(Looper.getMainLooper()).postDelayed({
            openSignIn()
        }, 3000)
    }
}

@Preview(showBackground = true, showSystemUi = true)
@Composable
fun AddFriendScreenPreview() {
    UserSession.setUserData(
        SignInUserResponse.Metadata.User(
            _id = "12345",
            email = "email@gmail.com",
            fullname = "User Name",
            birthday = "01/01/2000",
            profileImageUrl = "https://via.placeholder.com/150",
            friendList = listOf(),
            friendInvites = listOf(),
            country = "VN"
        ),
        token = "mockToken"
    )
    AddFriendScreen(
        idOfFriend = "67890",
        nameOfFriend = "Friend Name",
        urlOfFriend = "https://via.placeholder.com/150",
        openUserProfile = {},
        openSignIn = {}
    )
}