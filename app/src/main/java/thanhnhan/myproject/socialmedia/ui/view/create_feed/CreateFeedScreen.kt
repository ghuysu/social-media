package thanhnhan.myproject.socialmedia.ui.view.create_feed

import android.content.Context
import android.net.Uri
import android.util.Log
import android.widget.Toast
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.rememberAsyncImagePainter
import kotlinx.coroutines.delay
import thanhnhan.myproject.socialmedia.R
import thanhnhan.myproject.socialmedia.data.Result
import thanhnhan.myproject.socialmedia.data.model.SignInUserResponse
import thanhnhan.myproject.socialmedia.data.model.UserSession
import thanhnhan.myproject.socialmedia.data.model.VisibleFriend
import thanhnhan.myproject.socialmedia.data.model.convertFriendList
import thanhnhan.myproject.socialmedia.data.network.RetrofitInstance
import thanhnhan.myproject.socialmedia.data.repository.FeedRepository
import thanhnhan.myproject.socialmedia.ui.theme.AppTheme
import thanhnhan.myproject.socialmedia.ui.view.sign_up.BackIconButton
import thanhnhan.myproject.socialmedia.utils.FileUtils.uriToFile
import thanhnhan.myproject.socialmedia.viewmodel.FeedViewModel
import thanhnhan.myproject.socialmedia.viewmodel.FeedViewModelFactory
import java.io.File


@Composable
fun CreateFeed(
    uri: String,
    openHome: () -> Unit,
    backAction: () -> Unit = {}
) {
    val api = RetrofitInstance.api
    val repository = FeedRepository(api)
    val viewModel: FeedViewModel = viewModel(factory = FeedViewModelFactory(repository))
    val createFeedResult by viewModel.createFeedResult.collectAsState()
    val getUserInfoResult by viewModel.getUserResult.collectAsState()

    val selectedFriendIds = remember { mutableStateOf<List<String>>(emptyList()) }
    var friendList by remember { mutableStateOf<List<SignInUserResponse.Metadata.Friend>>(emptyList()) }
    var desc by remember { mutableStateOf("") }

    val context = LocalContext.current

    // Chuyển uri nhận được từ string -> uri -> file
    val photoUri = uri.let { Uri.parse(it.replace("+", "/")) }
    val photoFile = uriToFile(photoUri, context)

    LaunchedEffect(key1 = true) {
        viewModel.getUser(UserSession.signInToken!!)
    }

    LaunchedEffect(createFeedResult) {
        createFeedResult?.let { result ->
            when (result) {
                is Result.Success -> {
                    Toast.makeText(
                        context,
                        result.data?.message,
                        Toast.LENGTH_LONG
                    ).show()
                    delay(1000)
                    openHome()
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

    LaunchedEffect(getUserInfoResult) {
        getUserInfoResult?.let { result ->
            when (result) {
                is Result.Success -> {
                    friendList = result.data?.metadata?.friendList ?: emptyList()
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

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF22272E)),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        BackIconButtonRow(backAction)

        Spacer(modifier = Modifier.height(60.dp))

        FeedImageWithDescription(
            photoUri = photoUri,
            value = desc,
            onValueChange = {
                desc = it
            },
        )

        Spacer(modifier = Modifier.height(20.dp))

        ContinueButton(
            photoFile = photoFile,
            visibleFriendIds = selectedFriendIds.value,
            description = desc,
            viewModel = viewModel,
            context = context
        )

        Spacer(modifier = Modifier.height(20.dp))

        UserScrollRow(selectedFriendIds, friendList)
    }
}

@Composable
fun BackIconButtonRow(backAction: () -> Unit) {
    Box(modifier = Modifier.fillMaxWidth()) {
        BackIconButton(backAction)
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FeedImageWithDescription(
    value: String,
    onValueChange: (String) -> Unit,
    photoUri: Uri
) {

    Box(
        modifier = Modifier
            .width(380.dp)
            .height(380.dp)
            .fillMaxWidth(),
        contentAlignment = Alignment.BottomCenter
    ) {
        Image(
            painter = rememberAsyncImagePainter(photoUri),
            contentDescription = null,
            modifier = Modifier
                .fillMaxSize()
                .clip(RoundedCornerShape(60.dp)),
            contentScale = ContentScale.Crop
        )

        TextField(
            value = value,
            onValueChange = { onValueChange(it) },
            modifier = Modifier
                .padding(bottom = 20.dp)
                .background(Color.Gray.copy(alpha = 0.7f), shape = RoundedCornerShape(50)),
            placeholder = {
                Text(
                    text = "Add description",
                    color = Color.White
                )
            },
            colors = TextFieldDefaults.textFieldColors(
                focusedTextColor = Color.White,
                containerColor = Color.Transparent,
                cursorColor = Color.White,
                focusedIndicatorColor = Color.Transparent,
                unfocusedIndicatorColor = Color.Transparent
            ),
            textStyle = TextStyle(
                color = Color.White,
                textAlign = TextAlign.Center
            )
        )
    }
}

@Composable
fun ContinueButton(
    visibleFriendIds: List<String>,
    description: String,
    viewModel: FeedViewModel,
    photoFile: File?,
    context: Context
) {
    Button(
        modifier = Modifier
            .height(100.dp)
            .width(100.dp)
            .clip(RoundedCornerShape(AppTheme.appButtonStyle.cornerRadius)),
        onClick = {
            if (visibleFriendIds.isEmpty()) {
                Toast.makeText(context, "Please choose your visible friends!", Toast.LENGTH_SHORT).show()
            } else if (description.isEmpty()) {
                Toast.makeText(context, "Please enter your description!", Toast.LENGTH_SHORT).show()
            } else {
                viewModel.createFeed(UserSession.signInToken!!, photoFile!!, description, visibleFriendIds)
            }
        },
        colors = ButtonDefaults.buttonColors(
            containerColor = AppTheme.appButtonStyle.backgroundColor
        )
    ) {
        Icon(
            imageVector = Icons.Default.Send,
            contentDescription = "Continue",
            modifier = Modifier
                .size(50.dp)
                .padding(top = 5.dp, start = 10.dp)
        )
    }
}

@Composable
fun UserScrollRow(
    selectedFriendIds: MutableState<List<String>>,
    friendList: List<SignInUserResponse.Metadata.Friend>
) {

    val scrollState = rememberScrollState()
    var selectedFriends by remember { mutableStateOf<Set<VisibleFriend>>(emptySet()) }
    val visibleFriendList = convertFriendList(friendList)

    Row(
        modifier = Modifier
            .padding(8.dp)
            .fillMaxWidth()
            .horizontalScroll(scrollState),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = Icons.Default.Person,
                contentDescription = "All",
                modifier = Modifier
                    .clickable {
                        if (selectedFriends.isEmpty()) {
                            selectedFriends = emptySet()
                            selectedFriendIds.value = emptyList()
                            visibleFriendList.forEach { user ->
                                selectedFriends += user
                            }
                            selectedFriendIds.value = selectedFriends.map { it._id }
                        } else {
                            selectedFriends = emptySet()
                            selectedFriendIds.value = emptyList()
                        }
                    }
//                    .border(
//                        width = if (selectedFriends.isEmpty()) 3.dp else 0.dp,
//                        color = AppTheme.appButtonStyle.backgroundColor,
//                        shape = CircleShape
//                    )
                    .size(60.dp)
                    .clip(CircleShape)
                    .background(Color.Gray)
                    .padding(8.dp)
            )

            Text(
                text = "All",
                color = Color.White,
                fontSize = 12.sp
            )
        }

        Spacer(modifier = Modifier.width(8.dp))

        visibleFriendList.forEach { user ->
            UserAvatarItem(user, selectedFriends.contains(user)) {
                selectedFriends = if (selectedFriends.contains(user)) {
                    selectedFriends - user
                } else {
                    selectedFriends + user
                }
                selectedFriendIds.value = selectedFriends.map { it._id }
            }
            Spacer(modifier = Modifier.width(8.dp))
        }
    }
}

@Composable
fun UserAvatarItem(user: VisibleFriend, isSelected: Boolean, onClick: () -> Unit) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.clickable(onClick = onClick)
    ) {
        Image(
            painter = rememberAsyncImagePainter(
                model = user.profileImageUrl,
                placeholder = painterResource(id = R.drawable.ic_launcher_background)
            ),
            contentDescription = user.fullname,
            modifier = Modifier
                .border(
                    width = if (isSelected) 3.dp else 0.dp,
                    color = AppTheme.appButtonStyle.backgroundColor,
                    shape = CircleShape
                )
                .size(60.dp)
                .clip(CircleShape)
                .background(Color.Gray)
        )
        Text(
            text = if (user.fullname.length > 8) user.fullname.take(8) else user.fullname,
            color = Color.White,
            fontSize = 12.sp
        )
    }
}

@Preview(showSystemUi = true, showBackground = true)
@Composable
fun CreateFeedPreview() {
    UserSession.setUserData(
        SignInUserResponse.Metadata.User(
            _id = "12345",
            email = "email@gmail.com",
            fullname = "Name",
            birthday = "13/07/2003",
            profileImageUrl = "https://via.placeholder.com/150",
            friendList = listOf(
                SignInUserResponse.Metadata.Friend(_id = "1", fullname = "John Doe", profileImageUrl = "https://example.com/john_doe.png"),
                SignInUserResponse.Metadata.Friend(_id = "2", fullname = "Jane Smith", profileImageUrl = "https://example.com/jane_smith.png"),
                SignInUserResponse.Metadata.Friend(_id = "3", fullname = "Mike Johnson", profileImageUrl = "https://example.com/mike_johnson.png"),
                SignInUserResponse.Metadata.Friend(_id = "4", fullname = "Emily Davis", profileImageUrl = "https://example.com/emily_davis.png"),
                SignInUserResponse.Metadata.Friend(_id = "5", fullname = "David Brown", profileImageUrl = "https://example.com/david_brown.png"),
                SignInUserResponse.Metadata.Friend(_id = "6", fullname = "Emma Wilson", profileImageUrl = "https://example.com/emma_wilson.png"),
                SignInUserResponse.Metadata.Friend(_id = "7", fullname = "Oliver Thompson", profileImageUrl = "https://example.com/oliver_thompson.png"),
                SignInUserResponse.Metadata.Friend(_id = "8", fullname = "Sophia White", profileImageUrl = "https://example.com/sophia_white.png"),
                SignInUserResponse.Metadata.Friend(_id = "9", fullname = "Lucas Martin", profileImageUrl = "https://example.com/lucas_martin.png"),
                SignInUserResponse.Metadata.Friend(_id = "10", fullname = "Ava Garcia", profileImageUrl = "https://example.com/ava_garcia.png")
            ),
            friendInvites = listOf(),
            country = "VN"
        ),
        token = "mockToken"
    )

    CreateFeed(
        openHome = {},
        uri = ""
    )
}
