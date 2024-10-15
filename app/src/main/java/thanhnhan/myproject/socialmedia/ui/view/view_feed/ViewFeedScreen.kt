package thanhnhan.myproject.socialmedia.ui.view.view_feed

import android.annotation.SuppressLint
import android.util.Log
import android.widget.Toast
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material.Divider
import androidx.compose.material.DropdownMenu
import androidx.compose.material.DropdownMenuItem
import androidx.compose.material.MaterialTheme
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.MailOutline
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.sharp.List
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
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
import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.rememberAsyncImagePainter
import com.google.accompanist.pager.ExperimentalPagerApi
import com.google.accompanist.pager.VerticalPager
import com.google.accompanist.pager.rememberPagerState
import thanhnhan.myproject.socialmedia.R
import thanhnhan.myproject.socialmedia.data.Result
import thanhnhan.myproject.socialmedia.data.model.GetEveryoneFeedsResponse
import thanhnhan.myproject.socialmedia.data.model.SignInUserResponse
import thanhnhan.myproject.socialmedia.data.model.UserSession
import thanhnhan.myproject.socialmedia.data.network.RetrofitInstance
import thanhnhan.myproject.socialmedia.data.repository.FeedRepository
import thanhnhan.myproject.socialmedia.ui.theme.AppTheme
import thanhnhan.myproject.socialmedia.viewmodel.FeedViewModel
import thanhnhan.myproject.socialmedia.viewmodel.FeedViewModelFactory
import java.text.SimpleDateFormat
import java.util.Date
import java.util.TimeZone

@OptIn(ExperimentalPagerApi::class)
@Composable
fun ViewFeed(
    openEditFeed: (String, String, String, String) -> Unit,
    openProfile: () -> Unit,
    openHome: () -> Unit,
) {

    val api = RetrofitInstance.api
    val repository = FeedRepository(api)
    val viewModel: FeedViewModel = viewModel(factory = FeedViewModelFactory(repository))
    val getEveryoneFeedResult by viewModel.getEveryoneFeedsResult.collectAsState()
    val reactFeedResult by viewModel.reactFeedResult.collectAsState()

    val context = LocalContext.current

    var everyoneFeed by remember { mutableStateOf<List<GetEveryoneFeedsResponse.Feed>>(listOf()) }
    LaunchedEffect(key1 = true) {
        viewModel.getEveryoneFeeds(UserSession.signInToken!!, 0)
    }

    LaunchedEffect(getEveryoneFeedResult) {
        getEveryoneFeedResult?.let { result ->
            when (result) {
                is Result.Success -> {
                    everyoneFeed = result.data?.metadata ?: listOf()
                }

                is Result.Error -> {
                    Log.d("DEBUG", result.message ?: "Error occurred")
                }
            }
        }
    }

    LaunchedEffect(reactFeedResult) {
        reactFeedResult?.let { result ->
            when (result) {
                is Result.Success -> {
                    Toast.makeText(
                        context,
                        result.data?.message,
                        Toast.LENGTH_LONG
                    ).show()
                }
                is Result.Error -> {
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
        Spacer(modifier = Modifier.height(15.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = {
                    openProfile()
                },
                modifier = Modifier
                    .size(55.dp)
                    .clip(CircleShape)
                    .background(Color(0xFF3C434A))
            ) {
                Icon(
                    imageVector = Icons.Default.AccountCircle,
                    contentDescription = null,
                    modifier = Modifier
                        .size(35.dp),
                    tint = Color.White
                )
            }

            Spacer(modifier = Modifier.width(30.dp))

            Button(
                onClick = {
                    // TODO: Show friend
                },
                modifier = Modifier
                    .width(170.dp)
                    .height(50.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF3C434A)
                )
            ) {
                Row {
                    Text(
                        text = "All friends",
                        fontSize = 17.sp
                    )
                    Spacer(modifier = Modifier.width(15.dp))
                    Icon(
                        imageVector = Icons.Default.KeyboardArrowDown,
                        contentDescription = null
                    )
                }
            }

            Spacer(modifier = Modifier.width(30.dp))

            IconButton(
                onClick = {
                    // TODO: Open Chat
                },
                modifier = Modifier
                    .size(55.dp)
                    .clip(CircleShape)
                    .background(Color(0xFF3C434A))
            ) {
                Icon(
                    imageVector = Icons.Default.MailOutline,
                    contentDescription = null,
                    modifier = Modifier
                        .size(35.dp),
                    tint = Color.White
                )
            }
        }

        Spacer(modifier = Modifier.height(40.dp))

        val pagerState = rememberPagerState()

        VerticalPager(
            count = everyoneFeed.size,
            state = pagerState,
            modifier = Modifier.fillMaxSize()
        ) { page ->
            val feed = everyoneFeed[page]
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp)
            ) {
                if (feed.userId._id == UserSession.user!!._id) {
                    UserFeedItem(feed, openEditFeed, openHome)
                } else {
                    FriendFeedItem(feed, openHome, viewModel)
                }
            }
        }
    }
}

@SuppressLint("SimpleDateFormat")
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UserFeedItem(
    feed: GetEveryoneFeedsResponse.Feed,
    openEditFeed: (String, String, String, String) -> Unit,
    openHome: () -> Unit,
) {

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .height(750.dp)
            .background(Color(0xFF22272E)),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            modifier = Modifier
                .width(380.dp)
                .height(380.dp)
                .fillMaxWidth(),
            contentAlignment = Alignment.BottomCenter
        ) {
            Image(
                painter = rememberAsyncImagePainter(
                    model = feed.imageUrl,
                    placeholder = painterResource(id = R.drawable.ic_launcher_background),
                    error = painterResource(id = R.drawable.ic_launcher_foreground)
                ),
                contentDescription = null,
                modifier = Modifier
                    .fillMaxSize()
                    .clip(RoundedCornerShape(60.dp)),
                contentScale = ContentScale.Crop
            )
            TextField(
                value = feed.description,
                onValueChange = { },
                modifier = Modifier
                    .padding(bottom = 20.dp)
                    .background(Color.Gray.copy(alpha = 0.7f), shape = RoundedCornerShape(50)),
                colors = TextFieldDefaults.textFieldColors(
                    focusedTextColor = Color.White,
                    containerColor = Color.Transparent,
                    cursorColor = Color.White,
                    focusedIndicatorColor = Color.Transparent,
                    unfocusedIndicatorColor = Color.Transparent
                )
            )
        }

        Spacer(modifier = Modifier.height(20.dp))

        Row {
            Text(
                text = "You",
                fontWeight = FontWeight.Bold,
                color = Color.White,
                fontSize = 20.sp,
            )
            Spacer(modifier = Modifier.width(10.dp))

            val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
            inputFormat.timeZone = TimeZone.getTimeZone("UTC")
            val outputFormat = SimpleDateFormat("dd/MM/yyyy")
            val date: Date? = inputFormat.parse(feed.createdAt)
            val formattedDate = outputFormat.format(date)
            Text(
                text = formattedDate,
                fontWeight = FontWeight.Light,
                color = Color.White,
                fontSize = 20.sp,
            )
        }

        Spacer(modifier = Modifier.height(30.dp))

        Button(
            onClick = {

            },
            modifier = Modifier
                .width(170.dp)
                .height(50.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color(0xFF3C434A)
            )
        ) {
            Text(
                text = "Activity",
                fontSize = 17.sp
            )
        }

        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(25.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = {
                    // TODO: Open all feed in grid
                },
                modifier = Modifier.size(40.dp)
            ) {
                Icon(
                    imageVector = Icons.Sharp.List,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(40.dp)
                )
            }

            IconButton(
                onClick = {
                    openHome()
                },
                modifier = Modifier
                    .size(80.dp)
                    .clip(CircleShape)
                    .background(color = Color.Black)
                    .border(
                        width = 3.dp,
                        color = AppTheme.appButtonStyle.backgroundColor,
                        shape = CircleShape
                    )
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.circle),
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(78.dp)
                )
            }



            Box() {
                var expanded by remember { mutableStateOf(false) }

                IconButton(
                    onClick = {
                        expanded = true
                    },
                    modifier = Modifier.size(40.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.MoreVert,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(40.dp)
                    )
                }

                DropdownMenu(
                    expanded = expanded,
                    onDismissRequest = { expanded = false },
                    modifier = Modifier.width(150.dp)
                ) {
                    DropdownMenuItem(onClick = {
                        expanded = false
                        val visibility = feed.visibility.joinToString((", "))
                        val imageUrl = feed.imageUrl.replace("/", "+")
                        openEditFeed(visibility, imageUrl, feed.description, feed._id)
                    }) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(
                                    MaterialTheme.colors.surface,
                                    shape = RoundedCornerShape(8.dp)
                                ) // Nền với góc bo
                                .clickable {
                                    expanded = false
                                    val visibility = feed.visibility.joinToString((", "))
                                    val imageUrl = feed.imageUrl.replace("/", "+")
                                    openEditFeed(visibility, imageUrl, feed.description, feed._id)
                                }, // Thêm sự kiện nhấp
                            contentAlignment = Alignment.Center // Căn giữa nội dung
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically, // Căn giữa theo chiều dọc
                                modifier = Modifier.padding(16.dp) // Padding cho chữ
                            ) {
                                // Thêm biểu tượng ở đây
                                Icon(
                                    imageVector = Icons.Default.Edit, // Thay đổi thành biểu tượng bạn muốn
                                    contentDescription = "Edit",
                                    tint = MaterialTheme.colors.primary, // Màu cho biểu tượng
                                    modifier = Modifier.size(24.dp) // Kích thước biểu tượng
                                )
                                Spacer(modifier = Modifier.width(8.dp)) // Khoảng cách giữa biểu tượng và chữ
                                Text(
                                    text = "Edit",
                                    style = MaterialTheme.typography.body1.copy(
                                        color = MaterialTheme.colors.primary, // Màu chữ
                                        fontWeight = FontWeight.Bold // Chữ đậm
                                    )
                                )
                            }
                        }
                    }

                    DropdownMenuItem(onClick = {

                    }) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(
                                    MaterialTheme.colors.surface,
                                    shape = RoundedCornerShape(8.dp)
                                ) // Nền với góc bo
                                .clickable { }, // Thêm sự kiện nhấp
                            contentAlignment = Alignment.Center // Căn giữa nội dung
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically, // Căn giữa theo chiều dọc
                                modifier = Modifier.padding(16.dp) // Padding cho chữ
                            ) {
                                // Thêm biểu tượng ở đây
                                Icon(
                                    imageVector = Icons.Default.Delete, // Thay đổi thành biểu tượng bạn muốn
                                    contentDescription = "Delete",
                                    tint = MaterialTheme.colors.error, // Màu cho biểu tượng
                                    modifier = Modifier.size(24.dp) // Kích thước biểu tượng
                                )
                                Spacer(modifier = Modifier.width(8.dp)) // Khoảng cách giữa biểu tượng và chữ
                                Text(
                                    text = "Delete",
                                    style = MaterialTheme.typography.body1.copy(
                                        color = MaterialTheme.colors.error, // Màu chữ
                                        fontWeight = FontWeight.Bold // Chữ đậm
                                    )
                                )
                            }
                        }
                    }
                }
            }

        }
    }
}

@SuppressLint("SimpleDateFormat")
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FriendFeedItem(
    feed: GetEveryoneFeedsResponse.Feed,
    openHome: () -> Unit,
    viewModel: FeedViewModel
) {

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .height(750.dp)
            .background(Color(0xFF22272E)),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            modifier = Modifier
                .width(380.dp)
                .height(380.dp)
                .fillMaxWidth(),
            contentAlignment = Alignment.BottomCenter
        ) {
            Image(
                painter = rememberAsyncImagePainter(
                    model = feed.imageUrl,
                    placeholder = painterResource(id = R.drawable.ic_launcher_background),
                    error = painterResource(id = R.drawable.ic_launcher_foreground) // Hình ảnh hiển thị khi có lỗi
                ),
                contentDescription = null,
                modifier = Modifier
                    .fillMaxSize()
                    .clip(RoundedCornerShape(60.dp)),
                contentScale = ContentScale.Crop
            )
            TextField(
                value = feed.description,
                onValueChange = { },
                modifier = Modifier
                    .padding(bottom = 20.dp)
                    .background(Color.Gray.copy(alpha = 0.7f), shape = RoundedCornerShape(50)),
                colors = TextFieldDefaults.textFieldColors(
                    focusedTextColor = Color.White,
                    containerColor = Color.Transparent,
                    cursorColor = Color.White,
                    focusedIndicatorColor = Color.Transparent,
                    unfocusedIndicatorColor = Color.Transparent
                )
            )
        }

        Spacer(modifier = Modifier.height(20.dp))

        Row {
            Text(
                text = if (feed.userId.fullname.length > 12) {
                    feed.userId.fullname.substring(0, 12) + "..."
                } else {
                    feed.userId.fullname
                },
                fontWeight = FontWeight.Bold,
                color = Color.White,
                fontSize = 20.sp,
            )
            Spacer(modifier = Modifier.width(10.dp))

            val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
            inputFormat.timeZone = TimeZone.getTimeZone("UTC")
            val outputFormat = SimpleDateFormat("dd/MM/yyyy")
            val date: Date? = inputFormat.parse(feed.createdAt)
            val formattedDate = outputFormat.format(date)
            Text(
                text = formattedDate,
                fontWeight = FontWeight.Light,
                color = Color.White,
                fontSize = 20.sp,
            )
        }

        Spacer(modifier = Modifier.height(10.dp))

        Row {
            IconButtonWithBackground(
                iconSource = painterResource(id = R.drawable.ic_heart),
                tint = AppTheme.appButtonStyle.backgroundColor,
                viewModel = viewModel,
                icon = "love",
                feedId = feed._id
            )
            Spacer(modifier = Modifier.width(8.dp))
            IconButtonWithBackground(
                iconSource = painterResource(id = R.drawable.ic_like),
                tint = AppTheme.appButtonStyle.backgroundColor,
                viewModel = viewModel,
                icon = "like",
                feedId = feed._id
            )
            Spacer(modifier = Modifier.width(8.dp))
            IconButtonWithBackground(
                iconSource = painterResource(id = R.drawable.ic_haha),
                tint = Color.Yellow,
                viewModel = viewModel,
                icon = "haha",
                feedId = feed._id
            )
            Spacer(modifier = Modifier.width(8.dp))
            IconButtonWithBackground(
                iconSource = painterResource(id = R.drawable.ic_wow),
                tint = Color.Yellow,
                viewModel = viewModel,
                icon = "wow",
                feedId = feed._id
            )
            Spacer(modifier = Modifier.width(8.dp))
            IconButtonWithBackground(
                iconSource = painterResource(id = R.drawable.ic_sad),
                tint = Color.Yellow,
                viewModel = viewModel,
                icon = "sad",
                feedId = feed._id
            )
            Spacer(modifier = Modifier.width(8.dp))
            IconButtonWithBackground(
                iconSource = painterResource(id = R.drawable.ic_angry),
                tint = Color.Red,
                viewModel = viewModel,
                icon = "angry",
                feedId = feed._id
            )
        }

        MessageInput(viewModel)

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(start = 25.dp, end = 25.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = {
                    // TODO: Open all feed in grid
                },
                modifier = Modifier.size(40.dp)
            ) {
                Icon(
                    imageVector = Icons.Sharp.List,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(40.dp)
                )
            }

            IconButton(
                onClick = {
                    openHome()
                },
                modifier = Modifier
                    .size(80.dp)
                    .clip(CircleShape)
                    .background(color = Color.Black)
                    .border(
                        width = 3.dp,
                        color = AppTheme.appButtonStyle.backgroundColor,
                        shape = CircleShape
                    )
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.circle),
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(78.dp)
                )
            }

            IconButton(
                onClick = {
                    // TODO: Save image
                },
                modifier = Modifier.size(40.dp)
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.ic_download),
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(40.dp)
                )
            }
        }
    }
}

@Composable
fun MessageInput(viewModel: FeedViewModel) {
    val textState = remember { mutableStateOf("") }

    Surface(
        shape = RoundedCornerShape(50),
        color = Color(0xFF424242),
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
        ) {
            BasicTextField(
                value = textState.value,
                onValueChange = { textState.value = it },
                textStyle = TextStyle(color = Color.White, fontSize = 16.sp),
                modifier = Modifier.weight(1f),
                decorationBox = { innerTextField ->
                    if (textState.value.isEmpty()) {
                        Text(
                            text = "Send message...",
                            style = TextStyle(color = Color.Gray, fontSize = 16.sp)
                        )
                    }
                    innerTextField()
                }
            )

            Spacer(modifier = Modifier.width(32.dp))

            CommentButton(
                icon = painterResource(id = R.drawable.ic_send),
                tint = Color.White,
                viewModel = viewModel
            )
        }
    }
}

@Composable
fun IconButtonWithBackground(
    iconSource: Painter, tint: Color,
    viewModel: FeedViewModel,
    icon: String,
    feedId: String
) {
    Box(
        modifier = Modifier
            .size(50.dp)
            .background(color = Color(0xFF424242), shape = CircleShape),
        contentAlignment = Alignment.Center
    ) {
        Icon(
            painter = iconSource,
            contentDescription = null,
            tint = tint,
            modifier = Modifier
                .size(30.dp)
                .clickable {
                    viewModel.reactToFeed(UserSession.signInToken!!, feedId, icon)
                }
        )
    }
}

@Composable
fun CommentButton(icon: Painter, tint: Color, viewModel: FeedViewModel) {
    Box(
        modifier = Modifier
            .size(50.dp)
            .background(color = Color(0xFF424242), shape = CircleShape),
        contentAlignment = Alignment.Center
    ) {
        Icon(
            painter = icon,
            contentDescription = null,
            tint = tint,
            modifier = Modifier
                .size(30.dp)
                .clickable {
                    // TODO: Comment
                }
        )
    }
}

@Composable
fun LikePopup(
    likes: List<String>,
    onDismissRequest: () -> Unit
) {
    Dialog(onDismissRequest = onDismissRequest) {
        Surface(
            shape = MaterialTheme.shapes.medium,
            color = Color.Yellow
        ) {
            Column(
                modifier = Modifier
                    .padding(16.dp)
                    .fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Likes",
                    style = MaterialTheme.typography.h6,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
                Divider()
                LazyColumn(
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(max = 300.dp)
                ) {
                    items(likes) { like ->
                        Text(
                            text = like,
                            style = MaterialTheme.typography.body1,
                            modifier = Modifier.padding(vertical = 4.dp)
                        )
                    }
                }
                Spacer(modifier = Modifier.height(16.dp))
                Button(onClick = onDismissRequest) {
                    Text("Close")
                }
            }
        }
    }
}

@Preview(showBackground = true, showSystemUi = true)
@Composable
fun LikePopupDialogPreview() {
    LikePopup(
        likes = listOf("User 1", "User 2", "User 3"),
        onDismissRequest = {}
    )
}

@Preview(showBackground = true, showSystemUi = true)
@Composable
fun ViewFeedPreview() {
    UserSession.setUserData(
        SignInUserResponse.Metadata.User(
            _id = "66e14253840f0686f5624e81",
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
    ViewFeed(
        openEditFeed = { _, _, _, _ -> },
        openHome = {},
        openProfile = {}
    )
}

@Preview(showBackground = true, showSystemUi = true)
@Composable
fun UserFeedItemPreview() {
    val feed1 = GetEveryoneFeedsResponse.Feed(
        _id = "66f83383c7568b672c8c090b",
        description = "Seventh feed",
        imageUrl = "https://social-media-pbl6.s3.ap-southeast-2.amazonaws.com/1727542147245_a",
        visibility = listOf("66e981d0463acb70864b6d45"),
        userId = GetEveryoneFeedsResponse.Feed.User(
            _id = "66e14253840f0686f5624e81",
            fullname = "Gia Huy",
            profileImageUrl = "https://social-media-pbl6.s3.ap-southeast-2.amazonaws.com/1727634219292_avatar"
        ),
        reactions = listOf(),
        createdAt = "2024-09-28T16:49:07.247Z"
    )
    UserFeedItem(feed1, { _, _, _, _ -> }, {})
}

@Preview(showBackground = true, showSystemUi = true)
@Composable
fun FriendFeedItemPreview() {
    val feed2 = GetEveryoneFeedsResponse.Feed(
        _id = "66f83381c7568b672c8c0905",
        description = "Seventh feed",
        imageUrl = "https://social-media-pbl6.s3.ap-southeast-2.amazonaws.com/1727542145891_a",
        visibility = listOf(),
        userId = GetEveryoneFeedsResponse.Feed.User(
            _id = "66e981d0463acb70864b6d45",
            fullname = "Nguyen Huynh co dang cap khong",
            profileImageUrl = "https://social-media-pbl6.s3.ap-southeast-2.amazonaws.com/1727720786943_cropped_image"
        ),
        reactions = listOf(
            GetEveryoneFeedsResponse.Feed.Reaction(
                _id = "66fad4910fc980e6766b336e",
                userId = GetEveryoneFeedsResponse.Feed.User(
                    _id = "66e14253840f0686f5624e81",
                    fullname = "Gia Huy",
                    profileImageUrl = "https://social-media-pbl6.s3.ap-southeast-2.amazonaws.com/1727634219292_avatar"
                ),
                feedId = "66f83381c7568b672c8c0905",
                icon = listOf("haha", "like"),
                createdAt = "2024-09-30T16:40:49.494Z"
            )
        ),
        createdAt = "2024-09-28T16:49:05.926Z"
    )
    val api = RetrofitInstance.api
    val repository = FeedRepository(api)
    val viewModel: FeedViewModel = viewModel(factory = FeedViewModelFactory(repository))
    FriendFeedItem(feed2, {}, viewModel)
}