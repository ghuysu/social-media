package thanhnhan.myproject.socialmedia.ui.view.FriendsScreen

import androidx.compose.foundation.Image
import androidx.compose.foundation.background

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.rememberAsyncImagePainter
import thanhnhan.myproject.socialmedia.data.model.UserSession
import thanhnhan.myproject.socialmedia.data.network.RetrofitInstance
import thanhnhan.myproject.socialmedia.data.network.SocketManager
import thanhnhan.myproject.socialmedia.data.repository.FriendRepository
import thanhnhan.myproject.socialmedia.data.repository.UserRepository
import thanhnhan.myproject.socialmedia.ui.theme.AppTheme
import thanhnhan.myproject.socialmedia.viewmodel.FriendViewModel
import thanhnhan.myproject.socialmedia.viewmodel.UserViewModel
import thanhnhan.myproject.socialmedia.data.Result
import thanhnhan.myproject.socialmedia.data.model.GetUserResponse

@Composable
fun FriendsScreen(
    userViewModel: UserViewModel,
    friendViewModel: FriendViewModel,
    authToken: String,
    socketManager: SocketManager
) {
    // Collect state từ UserViewModel
    val user by userViewModel.user.collectAsState()
    
    LaunchedEffect(Unit) {
        socketManager.initSocket()
        userViewModel.getUser(authToken)
        
        // Lắng nghe sự kiện từ socket
        socketManager.listenForFriendInviteUpdates { newInvite ->
            userViewModel.addFriendInvite(newInvite)
        }
        
        socketManager.listenForNewFriendUpdates { newFriend ->
            userViewModel.addFriend(newFriend)
        }
    }

    AppTheme {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFF22272E))
                .padding(16.dp)
        ) {
            Header()
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Đảm bảo sử dụng user.friendList trực tiếp
            user?.let { currentUser ->
                YourFriendsList(
                    friends = currentUser.friendList,
                    friendViewModel = friendViewModel,
                    authToken = authToken
                )
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Sử dụng user.friendInvites trực tiếp
            user?.let { currentUser ->
                FriendsRequestList(
                    friendInvites = currentUser.friendInvites,
                    friendViewModel = friendViewModel,
                    authToken = authToken
                )
            }
        }
    }
}

@Composable
fun Header() {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.fillMaxWidth()
    ) {
        Text(
            text = "Bạn bè của bạn",
            style = AppTheme.appTypography.largeTitle,
            color = Color.White
        )
        Spacer(modifier = Modifier.height(20.dp))
    }
}

@Composable
fun YourFriendsList(
    friends: List<GetUserResponse.Friend>,
    friendViewModel: FriendViewModel,
    authToken: String
) {
    Text(
        text = "✨ Your Friends",
        style = AppTheme.appTypography.title,
        modifier = Modifier.padding(vertical = 8.dp)
    )
    if (friends.isNotEmpty()) {
        friends.forEach { friend ->
            val name = friend.fullname ?: "Unknown"
            FriendList(
                name = name,
                profileImageUrl = friend.profileImageUrl,
                friendId = friend._id,
                friendViewModel = friendViewModel,
                authToken = authToken
            )
        }
    } else {
        Text(
            text = "Bạn chưa có bạn bè nào.",
            style = AppTheme.appTypography.title,
            modifier = Modifier.padding(vertical = 8.dp)
        )
    }
    Spacer(modifier = Modifier.height(8.dp))
    TextButton(
        onClick = { /* Handle click */ },
        modifier = Modifier.fillMaxWidth()
    ) {
        Text("Xem thêm", color = Color.Gray)
    }
}

@Composable
fun FriendsRequestList(
    friendInvites: List<GetUserResponse.FriendInvite>,
    friendViewModel: FriendViewModel,
    authToken: String
) {
    val acceptFriendResult by friendViewModel.acceptFriendResult.collectAsState()
    
    LaunchedEffect(acceptFriendResult) {
        when (acceptFriendResult) {
            is Result.Success -> {
                println("Friend request accepted successfully")
                // UserViewModel sẽ tự động cập nhật thông qua socket listener
            }
            is Result.Error -> {
                println("Error accepting friend request: ${(acceptFriendResult as Result.Error).message}")
            }
            null -> { /* Initial state */ }
        }
    }

    Text(
        text = "✨ Friend Requests",
        style = AppTheme.appTypography.title,
        modifier = Modifier.padding(vertical = 8.dp)
    )
    if (friendInvites.isNotEmpty()) {
        friendInvites.forEach { invite ->
            if (invite.sender._id != UserSession.user?._id) {
                FriendInviteItem(
                    name = invite.sender.fullname ?: "Unknown",
                    profileImageUrl = invite.sender.profileImageUrl,
                    inviteId = invite._id,
                    friendViewModel = friendViewModel,
                    authToken = authToken
                )
            }
        }
    } else {
        Text(
            text = "Bạn chưa có lời mời kết bạn nào.",
            style = AppTheme.appTypography.title,
            modifier = Modifier.padding(vertical = 8.dp)
        )
    }
    Spacer(modifier = Modifier.height(8.dp))
    TextButton(
        onClick = { /* Handle click */ },
        modifier = Modifier.fillMaxWidth()
    ) {
        Text("Xem thêm", color = Color.Gray)
    }
}

@Composable
fun FriendInviteItem(name: String, profileImageUrl: String?, inviteId: String, friendViewModel: FriendViewModel, authToken: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 0.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        if (profileImageUrl != null) {
            Image(
                painter = rememberAsyncImagePainter(profileImageUrl),
                contentDescription = name,
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
            )
        } else {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .background(Color.Gray, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = name.take(2).uppercase(),
                    color = Color.White,
                    fontSize = 16.sp
                )
            }
        }

        Text(
            text = name,
            style = AppTheme.appTypography.title.copy(textAlign = TextAlign.Start),
            modifier = Modifier
                .weight(1f)
                .padding(start = 15.dp)
        )
        IconButton(onClick = { friendViewModel.removeFriendInvite(authToken, inviteId) }) {
            Icon(
                imageVector = Icons.Default.Close,
                contentDescription = "Remove friend",
                tint = Color.Gray
            )
        }

        // Nút Accept lời mời kết bạn
        Button(onClick = {
            println("Accept button clicked for inviteId: $inviteId") // Log để kiểm tra nút được nhấn
            friendViewModel.acceptFriendInvite(authToken, inviteId)
        },
            colors = ButtonDefaults.run {
                val buttonColors = buttonColors(
                    containerColor = AppTheme.appButtonStyle.backgroundColor,
                    contentColor = AppTheme.appButtonStyle.contentColor
                )
                buttonColors
            },
            modifier = Modifier
                .padding(3.dp) // Áp dụng padding từ style
                .clip(RoundedCornerShape(AppTheme.appButtonStyle.cornerRadius.dp)) // Áp dụng cornerRadius
        ) {
            Text(text = "Accept", style = AppTheme.appButtonStyle.textStyle) // Sử dụng textStyle từ AppTheme
        }
    }
}

@Composable
fun FriendList(name: String, profileImageUrl: String?, friendId: String, friendViewModel: FriendViewModel, authToken: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        if (profileImageUrl != null) {
            Image(
                painter = rememberAsyncImagePainter(profileImageUrl),
                contentDescription = name,
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(Color.Gray)
            )
        } else {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .background(Color.Gray, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = name.take(2).uppercase(),
                    color = Color.White,
                    fontSize = 16.sp
                )
            }
        }
        Text(
            text = name,
            style = AppTheme.appTypography.title.copy(textAlign = TextAlign.Start),
            modifier = Modifier
                .weight(1f)
                .padding(start = 15.dp)
        )
        IconButton(onClick = {
            println("Accept button clicked for inviteId: $friendId")
            friendViewModel.deleteFriend(authToken, friendId ) }) {
            Icon(
                imageVector = Icons.Default.Close,
                contentDescription = "Remove friend",
                tint = Color.Gray
            )
        }
    }
}
//@Preview(showBackground = true)
//@Composable
//fun FriendsScreenPreview() {
//    // Tạo một mock FriendViewModel
//    val mockRepository = FriendRepository(RetrofitInstance.api)
//    val mockUserRepository = UserRepository(RetrofitInstance.api)
//    val mockGetUserViewModel = UserViewModel(repository = mockUserRepository)
//    val mockFriendViewModel = FriendViewModel(repository = mockRepository)
//    val mockAuthToken = "mockAuthToken" // Token giả
//    val mockSocketManager = SocketManager() // Tạo một mock SocketManager
//
//    AppTheme { // Sử dụng AppTheme thay vì MaterialTheme
//        Surface(
//            modifier = Modifier.fillMaxSize(),
//            color = Color(0xFF22272E)
//        ) {
//            FriendsScreen(userViewModel = mockGetUserViewModel, friendViewModel = mockFriendViewModel, authToken = mockAuthToken, mockSocketManager)
//        }
//    }
//}