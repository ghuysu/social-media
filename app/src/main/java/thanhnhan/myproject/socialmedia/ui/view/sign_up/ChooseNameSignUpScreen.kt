package thanhnhan.myproject.socialmedia.ui.view.sign_up

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Person
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import thanhnhan.myproject.socialmedia.ui.theme.SocialMediaTheme

@Composable
fun ChooseNameSignUp(
    email: String,
    password: String,
    openChooseBirthday: (String, String, String) -> Unit,
    backAction: () -> Unit = {}
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(color = Color(0xFF22272E))
    ) {
        var firstName by remember { mutableStateOf("") }
        var lastName by remember { mutableStateOf("") }

        BackIconButton(backAction)
        LogoImage()
        AppName()
        Spacer(modifier = Modifier.height(80.dp))
        SignUpTitle(text = "What's your name?")
        Spacer(modifier = Modifier.height(5.dp))
        InputField(
            placeHolder = "First Name",
            leadingIcon = Icons.Default.Person,
            trailingIconVector = Icons.Default.Clear,
            value = firstName,
            onValueChange = { firstName = it },
            onTrailingIconClick = { firstName = "" }
        )
        Spacer(modifier = Modifier.height(5.dp))
        InputField(
            placeHolder = "Last Name",
            leadingIcon = Icons.Default.Person,
            trailingIconVector = Icons.Default.Clear,
            value = lastName,
            onValueChange = { lastName = it },
            onTrailingIconClick = { lastName = "" }
        )
        Spacer(modifier = Modifier.height(5.dp))
        Spacer(modifier = Modifier.height(145.dp))
        ContinueButton(
            text = "Continue",
            icon = Icons.Default.ArrowForward,
            onClick = { openChooseBirthday(email, password, "$firstName $lastName") }
        )
    }
}

@Composable
@Preview(showBackground = true, showSystemUi = true)
fun ChooseNameSignUpPreview() {
    SocialMediaTheme {
        ChooseNameSignUp(
            openChooseBirthday = { _, _, _ -> },
            email = "example@example.com",
            password = "password123"
        )
    }
}