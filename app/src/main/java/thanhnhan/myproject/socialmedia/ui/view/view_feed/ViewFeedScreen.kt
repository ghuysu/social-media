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
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material.AlertDialog
import androidx.compose.material.DropdownMenu
import androidx.compose.material.DropdownMenuItem
import androidx.compose.material.MaterialTheme
import androidx.compose.material.RadioButton
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBox
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.MailOutline
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
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
import thanhnhan.myproject.socialmedia.data.network.SocketManager
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
    openChat: () -> Unit
) {

    val api = RetrofitInstance.api
    val repository = FeedRepository(api)
    val viewModel: FeedViewModel = viewModel(factory = FeedViewModelFactory(repository))
    val getEveryoneFeedResult by viewModel.getEveryoneFeedsResult.collectAsState()
    val reactFeedResult by viewModel.reactFeedResult.collectAsState()
    val commentResult by viewModel.commentResult.collectAsState()
    val getUserInfoResult by viewModel.getUserResult.collectAsState()
    val reportUserResult by viewModel.reportUserResult.collectAsState()
    val reportFeedResult by viewModel.reportFeedResult.collectAsState()
    val deleteFeedResult by viewModel.deleteFeedResult.collectAsState()

    var friendList by remember { mutableStateOf<List<SignInUserResponse.Metadata.Friend>>(emptyList()) }

    val context = LocalContext.current
    LaunchedEffect(key1 = true) {
        viewModel.getUser(UserSession.signInToken!!)
    }

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

    LaunchedEffect(commentResult) {
        commentResult?.let { result ->
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

    LaunchedEffect(reportUserResult) {
        reportUserResult?.let { result ->
            when (result) {
                is Result.Success -> {
                    Toast.makeText(
                        context,
                        result.data?.message,
                        Toast.LENGTH_LONG
                    ).show()
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

    LaunchedEffect(reportFeedResult) {
        reportFeedResult?.let { result ->
            when (result) {
                is Result.Success -> {
                    Toast.makeText(
                        context,
                        result.data?.message,
                        Toast.LENGTH_LONG
                    ).show()
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

    LaunchedEffect(deleteFeedResult) {
        deleteFeedResult?.let { result ->
            when (result) {
                is Result.Success -> {
                    Toast.makeText(
                        context,
                        result.data?.message,
                        Toast.LENGTH_LONG
                    ).show()
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

    // Socket
    val socketManager = SocketManager()
    socketManager.initSocket()
    socketManager.connect()

    socketManager.listenForCreateFeed { feed ->
        viewModel.getEveryoneFeeds(UserSession.signInToken!!, 0)
    }

    socketManager.listenForUpdateFeed { feed ->
        viewModel.getEveryoneFeeds(UserSession.signInToken!!, 0)
    }

    socketManager.listenForDeleteFeed { feedId ->
        viewModel.getEveryoneFeeds(UserSession.signInToken!!, 0)
    }

    socketManager.listenForReactFeed { feed ->
        viewModel.getEveryoneFeeds(UserSession.signInToken!!, 0)
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
                    openChat()
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
                    UserFeedItem(feed, openEditFeed, openHome, friendList, viewModel)
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
    friendList: List<SignInUserResponse.Metadata.Friend>,
    viewModel: FeedViewModel,
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
                ),
                textStyle = TextStyle(
                    color = Color.White,
                    textAlign = TextAlign.Center
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

        var showDialog by remember { mutableStateOf(false) }

        Button(
            onClick = {
                showDialog = !showDialog
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

        if (showDialog) {
            ActivityPopup(
                showDialog,
                onDismiss = { showDialog = false },
                reaction = feed.reactions,
                friendList = friendList,
                viewModel = viewModel
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
//                Icon(
//                    imageVector = Icons.Sharp.List,
//                    contentDescription = null,
//                    tint = Color.White,
//                    modifier = Modifier.size(40.dp)
//                )
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

                    var showDeleteFeedDialog by remember { mutableStateOf(false) }

                    if (showDeleteFeedDialog) {
                        ConfirmDeleteFeedDialog(
                            onDismissRequest = { showDialog = false },
                            onDelete = {
                                showDialog = false
                            },
                            onCancel = { showDialog = false },
                            viewmodel = viewModel,
                            feedId = feed._id
                        )
                    }

                    DropdownMenuItem(onClick = {
                        showDeleteFeedDialog = true
                    }) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(
                                    MaterialTheme.colors.surface,
                                    shape = RoundedCornerShape(8.dp)
                                ) // Nền với góc bo
                                .clickable {
                                    showDeleteFeedDialog = true
                                }, // Thêm sự kiện nhấp
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
    viewModel: FeedViewModel,
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
                ),
                textStyle = TextStyle(
                    color = Color.White,
                    textAlign = TextAlign.Center
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

        MessageInput(
            viewModel = viewModel,
            feedId = feed._id,
            receiverId = feed.userId._id
        )

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
//                Icon(
//                    imageVector = Icons.Sharp.List,
//                    contentDescription = null,
//                    tint = Color.White,
//                    modifier = Modifier.size(40.dp)
//                )
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
                        imageVector = Icons.Default.Warning,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(40.dp)
                    )
                }

                var showReportUserDialog by remember { mutableStateOf(false) }
                var showReportFeedDialog by remember { mutableStateOf(false) }

                if (showReportUserDialog) {
                    ReportUserDialog(
                        onDismissRequest = { showReportUserDialog = false },
                        onConfirm = { showReportUserDialog = false },
                        onCancel = { showReportUserDialog = false },
                        viewmodel = viewModel,
                        userId = feed.userId._id
                    )
                }

                if (showReportFeedDialog) {
                    ReportFeedDialog(
                        onDismissRequest = { showReportFeedDialog = false },
                        onConfirm = { showReportFeedDialog = false },
                        onCancel = { showReportFeedDialog = false },
                        viewmodel = viewModel,
                        feedId = feed._id
                    )
                }
                DropdownMenu(
                    expanded = expanded,
                    onDismissRequest = { expanded = false },
                    modifier = Modifier.width(150.dp)
                ) {
                    DropdownMenuItem(onClick = {
                        expanded = false
                        showReportUserDialog = true
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
                                    showReportUserDialog = true
                                }, // Thêm sự kiện nhấp
                            contentAlignment = Alignment.Center // Căn giữa nội dung
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically, // Căn giữa theo chiều dọc
                                modifier = Modifier.padding(16.dp) // Padding cho chữ
                            ) {
                                // Thêm biểu tượng ở đây
                                Icon(
                                    imageVector = Icons.Default.AccountBox, // Thay đổi thành biểu tượng bạn muốn
                                    contentDescription = "Report User",
                                    tint = AppTheme.appButtonStyle.backgroundColor, // Màu cho biểu tượng
                                    modifier = Modifier.size(26.dp) // Kích thước biểu tượng
                                )
                                Spacer(modifier = Modifier.width(8.dp)) // Khoảng cách giữa biểu tượng và chữ
                                Text(
                                    text = "Report User",
                                    style = MaterialTheme.typography.body1.copy(
                                        color = AppTheme.appButtonStyle.backgroundColor, // Màu chữ
                                        fontWeight = FontWeight.Bold // Chữ đậm
                                    )
                                )
                            }
                        }
                    }

                    DropdownMenuItem(onClick = {
                        expanded = false
                        showReportFeedDialog = true
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
                                    showReportFeedDialog = true
                                }, // Thêm sự kiện nhấp
                            contentAlignment = Alignment.Center // Căn giữa nội dung
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically, // Căn giữa theo chiều dọc
                                modifier = Modifier.padding(16.dp) // Padding cho chữ
                            ) {
                                // Thêm biểu tượng ở đây
                                Icon(
                                    painter = painterResource(id = R.drawable.ic_feed), // Thay đổi thành biểu tượng bạn muốn
                                    contentDescription = "Report Feed",
                                    tint = AppTheme.appButtonStyle.backgroundColor, // Màu cho biểu tượng
                                    modifier = Modifier.size(22.dp) // Kích thước biểu tượng
                                )
                                Spacer(modifier = Modifier.width(8.dp)) // Khoảng cách giữa biểu tượng và chữ
                                Text(
                                    text = "Report Feed",
                                    style = MaterialTheme.typography.body1.copy(
                                        color = AppTheme.appButtonStyle.backgroundColor, // Màu chữ
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

@Composable
fun ConfirmDeleteFeedDialog(
    onDismissRequest: () -> Unit,
    onDelete: () -> Unit,
    onCancel: () -> Unit,
    viewmodel: FeedViewModel,
    feedId: String,
) {
    AlertDialog(
        onDismissRequest = onDismissRequest,
        title = { Text(text = "Confirm Delete") },
        text = { Text("Are you sure you want to delete this feed?") },
        confirmButton = {
            TextButton(onClick = {
                onDelete.invoke()
                viewmodel.deleteFeed(UserSession.signInToken!!, feedId)
                viewmodel.getEveryoneFeeds(UserSession.signInToken!!, 0)
            }) {
                Text("Delete")
            }
        },
        dismissButton = {
            TextButton(onClick = onCancel) {
                Text("Cancel")
            }
        }
    )
}

@Composable
fun ReportUserDialog(
    onDismissRequest: () -> Unit,
    onConfirm: () -> Unit,
    onCancel: () -> Unit,
    viewmodel: FeedViewModel,
    userId: String,
) {
    var selectedOption by remember { mutableStateOf("Option 1") }

    AlertDialog(
        onDismissRequest = onDismissRequest,
        title = { Text(text = "Report User") },
        text = {
            Column {
                Text("Please choose a reason:")
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(vertical = 8.dp)
                ) {
                    RadioButton(
                        selected = selectedOption == "Option 1",
                        onClick = { selectedOption = "Option 1" }
                    )
                    Text("Post Inappropriate Feeds", modifier = Modifier.padding(start = 8.dp))
                }
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(vertical = 8.dp)
                ) {
                    RadioButton(
                        selected = selectedOption == "Option 2",
                        onClick = { selectedOption = "Option 2" }
                    )
                    Text("Offend Others", modifier = Modifier.padding(start = 8.dp))
                }
            }
        },
        confirmButton = {
            TextButton(
                onClick = {
                    onConfirm.invoke()
                    if (selectedOption == "Option 1") {
                        viewmodel.reportUser(UserSession.signInToken!!, userId, 0)
                    } else if (selectedOption == "Option 2") {
                        viewmodel.reportUser(UserSession.signInToken!!, userId, 1)
                    }
                }
            ) {
                Text("OK")
            }
        },
        dismissButton = {
            TextButton(onClick = onCancel) {
                Text("Cancel")
            }
        }
    )
}

@Composable
fun ReportFeedDialog(
    onDismissRequest: () -> Unit,
    onConfirm: () -> Unit,
    onCancel: () -> Unit,
    viewmodel: FeedViewModel,
    feedId: String,
) {
    var selectedOption by remember { mutableStateOf("Option 1") }

    AlertDialog(
        onDismissRequest = onDismissRequest,
        title = { Text(text = "Report Feed") },
        text = {
            Column {
                Text("Please choose a reason:")
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(vertical = 8.dp)
                ) {
                    RadioButton(
                        selected = selectedOption == "Option 1",
                        onClick = { selectedOption = "Option 1" }
                    )
                    Text("Sensitive Image", modifier = Modifier.padding(start = 8.dp))
                }
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(vertical = 8.dp)
                ) {
                    RadioButton(
                        selected = selectedOption == "Option 2",
                        onClick = { selectedOption = "Option 2" }
                    )
                    Text("Inappropriate Words", modifier = Modifier.padding(start = 8.dp))
                }
            }
        },
        confirmButton = {
            TextButton(
                onClick = {
                    onConfirm.invoke()
                    if (selectedOption == "Option 1") {
                        viewmodel.reportFeed(UserSession.signInToken!!, feedId, 0)
                    } else if (selectedOption == "Option 2") {
                        viewmodel.reportFeed(UserSession.signInToken!!, feedId, 1)
                    }
                }
            ) {
                Text("OK")
            }
        },
        dismissButton = {
            TextButton(onClick = onCancel) {
                Text("Cancel")
            }
        }
    )
}

@Composable
fun MessageInput(
    viewModel: FeedViewModel,
    feedId: String,
    receiverId: String,
) {
    val content = remember { mutableStateOf("") }

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
                value = content.value,
                onValueChange = { content.value = it },
                textStyle = TextStyle(color = Color.White, fontSize = 16.sp),
                modifier = Modifier.weight(1f),
                decorationBox = { innerTextField ->
                    if (content.value.isEmpty()) {
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
                viewModel = viewModel,
                feedId = feedId,
                receiverId = receiverId,
                content = content.value
            ) {
                content.value = ""
            }
        }
    }
}

@Composable
fun IconButtonWithBackground(
    iconSource: Painter, tint: Color,
    viewModel: FeedViewModel,
    icon: String,
    feedId: String,
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
fun CommentButton(
    icon: Painter,
    tint: Color,
    viewModel: FeedViewModel,
    feedId: String,
    receiverId: String,
    content: String,
    deleteValue: () -> Unit,
) {
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
                    viewModel.comment(UserSession.signInToken!!, receiverId, content, feedId)
                    deleteValue()
                }
        )
    }
}

@Composable
fun ActivityPopup(
    showDialog: Boolean,
    onDismiss: () -> Unit,
    reaction: List<GetEveryoneFeedsResponse.Feed.Reaction>,
    friendList: List<SignInUserResponse.Metadata.Friend>,
    viewModel: FeedViewModel,
) {
    Column(
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {

        if (showDialog) {
            val activityList = viewModel.createActivityList(friendList, reaction)
            AlertDialog(
                onDismissRequest = {
                    onDismiss()
                },
                title = {
                    Text(
                        text = "Activity",
                        style = TextStyle(
                            color = Color.White,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold
                        ),
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )
                },
                text = {
                    LazyColumn(
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        items(activityList) { item ->
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp)
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Image(
                                        painter = rememberAsyncImagePainter(
                                            model = item.profileImageUrl,
                                            placeholder = painterResource(id = R.drawable.ic_launcher_background),
                                            error = painterResource(id = R.drawable.ic_launcher_foreground)
                                        ),
                                        contentDescription = "Profile Image",
                                        modifier = Modifier
                                            .size(40.dp)
                                            .clip(CircleShape)
                                            .background(Color.Gray),
                                        contentScale = ContentScale.Crop
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = if (item.fullname.length > 12) {
                                            item.fullname.substring(0, 12) + "..."
                                        } else {
                                            item.fullname
                                        },
                                        color = Color.White
                                    )
                                }
                                Row {
                                    for (i in item.icon) {
                                        Log.d("DEBUG", i)
                                        when (i) {
                                            "like" -> Icon(
                                                painter = painterResource(id = R.drawable.ic_like),
                                                contentDescription = null,
                                                tint = AppTheme.appButtonStyle.backgroundColor,
                                                modifier = Modifier.size(15.dp)
                                            )

                                            "haha" -> Icon(
                                                painter = painterResource(id = R.drawable.ic_haha),
                                                contentDescription = null,
                                                tint = Color.Yellow,
                                                modifier = Modifier.size(15.dp)
                                            )

                                            "love" -> Icon(
                                                painter = painterResource(id = R.drawable.ic_heart),
                                                contentDescription = null,
                                                tint = Color.Unspecified,
                                                modifier = Modifier.size(15.dp)
                                            )

                                            "wow" -> Icon(
                                                painter = painterResource(id = R.drawable.ic_wow),
                                                contentDescription = null,
                                                tint = Color.Yellow,
                                                modifier = Modifier.size(15.dp)
                                            )

                                            "sad" -> Icon(
                                                painter = painterResource(id = R.drawable.ic_sad),
                                                contentDescription = null,
                                                tint = Color.Yellow,
                                                modifier = Modifier.size(15.dp)
                                            )

                                            "angry" -> Icon(
                                                painter = painterResource(id = R.drawable.ic_angry),
                                                contentDescription = null,
                                                tint = Color.Red,
                                                modifier = Modifier.size(15.dp)
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                buttons = {
                    Box(modifier = Modifier.padding(all = 8.dp)) {
                        TextButton(
                            onClick = { onDismiss() }
                        ) {
                            Text("Close")
                        }
                    }
                },
                backgroundColor = Color.Black
            )
        }
    }
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
        openProfile = {},
        openChat = {}
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
    val api = RetrofitInstance.api
    val repository = FeedRepository(api)
    val viewModel: FeedViewModel = viewModel(factory = FeedViewModelFactory(repository))
    UserFeedItem(feed1, { _, _, _, _ -> }, {}, listOf(), viewModel)
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