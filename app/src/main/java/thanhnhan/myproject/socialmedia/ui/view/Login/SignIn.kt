package thanhnhan.myproject.socialmedia.ui.view.Login

import android.util.Log
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch
import thanhnhan.myproject.socialmedia.R
import thanhnhan.myproject.socialmedia.ui.theme.AppTheme
import androidx.lifecycle.viewmodel.compose.viewModel
import thanhnhan.myproject.socialmedia.viewmodel.SignInUserViewModel
import thanhnhan.myproject.socialmedia.viewmodel.SignInUserViewModelFactory
import thanhnhan.myproject.socialmedia.data.Result
import thanhnhan.myproject.socialmedia.data.network.RetrofitInstance
import thanhnhan.myproject.socialmedia.data.repository.SignInUserRepository

@Composable
fun SignInScreen(
    onLoginSuccess: () -> Unit
) {
    // Khởi tạo ViewModelFactory với SignInUserRepository
    val viewModelFactory = SignInUserViewModelFactory(SignInUserRepository(RetrofitInstance.api))
    val viewModel: SignInUserViewModel = viewModel(factory = viewModelFactory)

    // Lấy các trạng thái từ ViewModel
    val emailValidationResult by viewModel.emailValidationResult.collectAsState()
    val passwordValidationResult by viewModel.passwordValidationResult.collectAsState()
    val signInResult by viewModel.signInResult.collectAsState() // Kết quả đăng nhập

    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var errorMessage by remember { mutableStateOf<String?>(null) } // Biến trạng thái cho thông báo lỗi
    val scope = rememberCoroutineScope()

    SignInContent(
        email = email,
        password = password,
        onEmailChange = {
            email = it
            viewModel.checkEmailFormat(it)
        },
        onPasswordChange = {
            password = it
            viewModel.checkPassword(it)
        },
        onContinueClick = {
            if (emailValidationResult == true && passwordValidationResult == true) {
                scope.launch {
                    viewModel.signInUser(email, password)
                }

            }
            else{
                Log.d("SignInScreen", "Đăng nhập thất bại")
                // Đăng nhập thất bại, cập nhật thông báo lỗi
                errorMessage = "Email or password incorrect"
            }
        },
        emailError = emailValidationResult == false,
        passwordError = passwordValidationResult == false
    )
    // Xử lý kết quả đăng nhập
    signInResult?.let { result ->
        when (result) {
            is Result.Success -> {
                onLoginSuccess()
                Log.d("SignInScreen", "Đăng nhập thành công")
            }
            is Result.Error -> {
                // Hiển thị thông báo lỗi
                Log.e("SignInScreen", "Đăng nhập thất bại: ${result.message ?: "Unknown error"}")
                Text(text = "Error: ${result.message ?: "Unknown error"}", color = Color.Red)
            }
        }
        // Hiển thị SignInReport nếu có lỗi
        errorMessage?.let {
            SignInReport(text = it) // Cập nhật nội dung Text cho SignInReport
        }
    }
}

@Composable
fun SignInContent(
    email: String,
    password: String,
    onEmailChange: (String) -> Unit,
    onPasswordChange: (String) -> Unit,
    onContinueClick: () -> Unit,
    emailError: Boolean,
    passwordError: Boolean
) {
    AppTheme {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFF22272E))
                .padding(horizontal = 30.dp),
            contentAlignment = Alignment.TopCenter
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Spacer(modifier = Modifier.height(50.dp))
                SignInLogo()
                Spacer(modifier = Modifier.height(80.dp))
                SignInTitle()


                SignInEmailField(
                    email = email,
                    onEmailChange = onEmailChange,
                    isError = emailError
                )
                Spacer(modifier = Modifier.height(20.dp))
                SignInPassTitle()
                SignInPasswordField(
                    password = password,
                    onPasswordChange = onPasswordChange,
                    isError = passwordError
                )
                Spacer(modifier = Modifier.height(30.dp))
                SignInReport("")

                Spacer(modifier = Modifier.height(100.dp))
                SignInAgreementText()

                Spacer(modifier = Modifier.height(20.dp))
                SignInButton(onClick = onContinueClick)
            }
        }
    }
}

@Composable
fun SignInLogo() {
    Image(
        painter = painterResource(id = R.drawable.logo),
        contentDescription = "Logo",
        modifier = Modifier
            .size(200.dp)
            .clip(CircleShape)
    )
    Text(
        text = "SkyLine",
        style = AppTheme.appTypography.largeTitle
    )
}

@Composable
fun SignInTitle() {
    Text(
        text = "What's your email?",
        style = AppTheme.appTypography.title,
        modifier = Modifier
            .fillMaxWidth()
            .padding(start = 0.dp, end = 150.dp)
    )
}
@Composable
fun SignInPassTitle() {
    Text(
        text = "Enter password",
        style = AppTheme.appTypography.title,
        modifier = Modifier
            .fillMaxWidth()
            .padding(start = 0.dp, end = 180.dp)
    )
}

@Composable
fun SignInReport(text: String){
    Text(text = "",
        style = AppTheme.appTypography.reportTitle)
}

@Composable
fun SignInEmailField(email: String, onEmailChange: (String) -> Unit, isError: Boolean) {
    val containerColor = if (isError) Color.Red else Color.Transparent
    TextField(
        value = email,
        onValueChange = onEmailChange,
        placeholder = { Text("Enter your email", color = Color.Gray) },
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 0.dp),
        isError = isError,
        colors = TextFieldDefaults.colors(
            focusedContainerColor = containerColor,
            unfocusedContainerColor = containerColor,
            disabledContainerColor = containerColor,
        )
    )
}

@Composable
fun SignInPasswordField(password: String, onPasswordChange: (String) -> Unit, isError: Boolean) {
    var passwordVisible by remember { mutableStateOf(false) }

    val containerColor = if (isError) Color.Red else Color.Transparent
    TextField(
        value = password,
        onValueChange = onPasswordChange,
        placeholder = { Text("Enter your password", color = Color.Gray) },
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 0.dp),
        visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
        trailingIcon = {
            val image = if (passwordVisible)
                painterResource(id = R.drawable.visibility)
            else
                painterResource(id = R.drawable.visible)

            IconButton(onClick = { passwordVisible = !passwordVisible }) {
                Icon(painter = image, contentDescription = null)
            }
        },
        isError = isError,
        colors = TextFieldDefaults.colors(
            focusedContainerColor = containerColor,
            unfocusedContainerColor = containerColor,
            disabledContainerColor = containerColor,
        )
    )
}

@Composable
fun SignInAgreementText() {
    Text(
        text = buildAnnotatedString {
            append("By tapping Continue, you are agreeing to our ")
            withStyle(style = SpanStyle(color = Color(0xFF19ADC8))) {
                append("Terms of Service")
            }
            append(" and ")
            withStyle(style = SpanStyle(color = Color(0xFF19ADC8))) {
                append("Privacy Policy")
            }
        },
        style = AppTheme.appTypography.subtitle.copy(color = Color.White),
        textAlign = TextAlign.Center
    )
}

@Composable
fun SignInButton(onClick: () -> Unit) {
    Button(
        onClick = onClick,
        colors = ButtonDefaults.buttonColors(
            containerColor = AppTheme.appButtonStyle.backgroundColor,
            contentColor = AppTheme.appButtonStyle.contentColor
        ),
        shape = RoundedCornerShape(AppTheme.appButtonStyle.cornerRadius.dp),
        modifier = Modifier
            .fillMaxWidth()
            .padding(AppTheme.appButtonStyle.padding.dp)
    ) {
        Text(
            text = "Continue",
            style = AppTheme.appButtonStyle.textStyle
        )
    }
}

@Preview(showBackground = true)
@Composable
fun SignInScreenPreview() {
    // Provide mocked content instead of using ViewModel for the preview
    SignInContent(
        email = "test@example.com",
        password = "password123",
        onEmailChange = {},
        onPasswordChange = {},
        onContinueClick = {},
        emailError = false,
        passwordError = false
    )
}