package thanhnhan.myproject.socialmedia.ui.view.sign_up

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.ParagraphStyle
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import thanhnhan.myproject.socialmedia.R
import thanhnhan.myproject.socialmedia.data.network.RetrofitInstance
import thanhnhan.myproject.socialmedia.data.repository.SignupRepository
import thanhnhan.myproject.socialmedia.ui.theme.SocialMediaTheme
import thanhnhan.myproject.socialmedia.viewmodel.SignupViewModel
import thanhnhan.myproject.socialmedia.viewmodel.SignupViewModelFactory

@Composable
fun ChoosePasswordSignUp(
    email: String,
    backAction: () -> Unit = {},
    openChooseName: (String, String) -> Unit,
) {
    val api = RetrofitInstance.api
    val repository = SignupRepository(api)
    val viewModel: SignupViewModel = viewModel(factory = SignupViewModelFactory(repository))

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(color = Color(0xFF22272E))
    ) {
        var password by remember { mutableStateOf("") }
        var isPassword by remember { mutableStateOf(true) }
        val paswordValidationResult by viewModel.passwordValidationResult.collectAsState()

        BackIconButton(backAction)
        LogoImage()
        AppName()
        Spacer(modifier = Modifier.height(80.dp))
        SignUpTitle(text = "Choose a password")
        InputField(
            placeHolder = "Password",
            leadingIcon = Icons.Default.Lock,
            trailingIconResource = R.drawable.eye,
            value = password,
            onValueChange = {
                password = it
                viewModel.checkPassword(it)
            },
            onTrailingIconClick = { isPassword = !isPassword },
            isPassword = isPassword
        )
        Spacer(modifier = Modifier.height(5.dp))
        ConditionOfPassword()
        Spacer(modifier = Modifier.height(145.dp))
        ContinueButton(
            text = "Continue",
            icon = Icons.Default.ArrowForward,
            onClick = {
                openChooseName(email, password)
            },
            isEnable = paswordValidationResult == true
        )
    }
}

@Composable
fun ConditionOfPassword() {
    Box(
        modifier = Modifier.fillMaxWidth()
    ) {
        Text(
            text = buildAnnotatedString {
                withStyle(style = ParagraphStyle(textAlign = TextAlign.End)) {
                    withStyle(style = SpanStyle(color = Color.Gray)) {
                        append("Your password must be at least ")
                    }
                    withStyle(style = SpanStyle(color = Color(0xFF19ADC8))) {
                        append("8 characters")
                    }
                }
            },
            modifier = Modifier.align(Alignment.Center)
        )
    }
}

@Composable
@Preview(showBackground = true, showSystemUi = true)
fun ChoosePasswordSignUpPreview() {
    SocialMediaTheme {
        ChoosePasswordSignUp(
            email = "example@email.com",
            backAction = {},
            openChooseName = { _, _ -> }
        )
    }
}