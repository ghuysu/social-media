package thanhnhan.myproject.socialmedia.ui.view.HomeScreen

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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import thanhnhan.myproject.socialmedia.R

class HomeScreen {
    @Composable
    fun LocketScreen() {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFFFEF8E8))
        ) {
            Column {
                TopBar()
                MainContent()
                Spacer(modifier = Modifier.weight(1f))
                BottomBar()
            }
        }
    }

    @Composable
    fun CameraPreview() {
        val context = LocalContext.current
        val lifecycleOwner = LocalLifecycleOwner.current

        val cameraProviderFuture = remember { ProcessCameraProvider.getInstance(context) }
        val previewView = remember { PreviewView(context) }

        AndroidView(
            factory = { previewView }, modifier = Modifier.fillMaxSize()
        )
    }

    @Composable
    fun TopBar() {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            IconButton(
                onClick = { /* TODO */ },
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.user),
                    contentDescription = "Profile",
                )
            }

            Button(
                onClick = { /* TODO */ },
                colors = ButtonDefaults.buttonColors(containerColor = Color.DarkGray),
                shape = RoundedCornerShape(20.dp)
            ) {
                Text("Bạn bè", color = Color.White, onTextLayout = {})
            }

            IconButton(
                onClick = { /* TODO */ },
                modifier = Modifier.size(48.dp).clip(RectangleShape)
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.chat),
                    contentDescription = "Chat",
                )
            }
        }
    }

    @Composable
    fun MainContent() {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(1f)
                .padding(16.dp)
                .clip(RoundedCornerShape(20.dp))
        ) {
            Image(
                painter = painterResource(id = R.drawable.ic_launcher_background),
                contentDescription = "Main Image",
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize()
            )
        }
    }

    @Composable
    fun BottomBar() {
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
                IconButton(
                    onClick = { /* TODO */ },
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.flash),
                        contentDescription = "Flash",
                        modifier = Modifier.size(60.dp)
                    )
                }

                IconButton(
                    onClick = { /* TODO */ },
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
                    onClick = { /* TODO */ },
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.switch_camera),
                        contentDescription = "Camera",
                        modifier = Modifier.size(60.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))
            Text("Lịch sử", color = Color.White, onTextLayout = {})
        }
    }

    @Preview(showBackground = true)
    @Composable
    fun LocketScreenPreview() {
        LocketScreen()
    }
}