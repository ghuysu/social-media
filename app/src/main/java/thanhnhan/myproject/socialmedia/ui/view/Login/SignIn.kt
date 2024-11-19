package thanhnhan.myproject.socialmedia.ui.view.Login

import android.content.Context
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.selection.TextSelectionColors
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.TextStyle
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
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.firebase.auth.ktx.auth
import com.google.firebase.ktx.Firebase

class SignIn {
    companion object {
        const val RC_SIGN_IN = 9001
    }
}

@Composable
fun SignInScreen(
    context: Context,
    onLoginSuccess: () -> Unit,
    openIntro: () -> Unit
) {
    // Khởi tạo ViewModelFactory với SignInUserRepository
    val viewModelFactory = SignInUserViewModelFactory(SignInUserRepository(RetrofitInstance.api), context)
    val viewModel: SignInUserViewModel = viewModel(factory = viewModelFactory)

    // Lấy các trạng thái từ ViewModel
    val emailValidationResult by viewModel.emailValidationResult.collectAsState()
    val passwordValidationResult by viewModel.passwordValidationResult.collectAsState()
    val signInResult by viewModel.signInResult.collectAsState()
    val googleSignInResult by viewModel.googleSignInResult.collectAsState()

    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var manualLoginAttempted by remember { mutableStateOf(false) }  // Biến trạng thái để theo dõi xem đăng nhập thủ công hay không
    val scope = rememberCoroutineScope()
    var isLoading by remember { mutableStateOf(false) }

    val gso = remember {
        GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken(context.getString(R.string.default_web_client_id))
            .requestEmail()
            .build()
    }
    val googleSignInClient = remember {
        GoogleSignIn.getClient(context, gso)
    }

    // Thêm hàm signOut để xóa tài khoản đã lưu
    fun signOutGoogle() {
        googleSignInClient.signOut().addOnCompleteListener {
            Log.d("SignInScreen", "Google Sign Out completed")
        }
    }

    // Gọi autoSignIn khi SignInScreen được khởi tạo
    LaunchedEffect(Unit) {
        viewModel.autoSignIn()  // Thực hiện auto sign-in
    }

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
            Log.d("SignInScreen", "Button 'Continue' clicked")
            Log.d("SignInScreen", "Email validation result: $emailValidationResult")
            Log.d("SignInScreen", "Password validation result: $passwordValidationResult")

            manualLoginAttempted = true  // Đánh dấu đã thử đăng nhập thủ công

            if (emailValidationResult == true && passwordValidationResult == true) {
                scope.launch {
                    Log.d("SignInScreen", "Valid email and password. Attempting to sign in.")
                    viewModel.signInUser(email, password)
                }
            } else {
                Log.d("SignInScreen", "Sign-in failed: Invalid email or password")
                errorMessage = "Incorrect username or password"
            }
        },
        onGoogleSignInClick = {
            // Sign out trước khi hiển thị dialog chọn tài khoản
            signOutGoogle()
            googleSignInClient.signOut().addOnCompleteListener {
                val signInIntent = googleSignInClient.signInIntent
                (context as ComponentActivity).startActivityForResult(
                    signInIntent,
                    SignIn.RC_SIGN_IN
                )
            }
        },
        emailError = emailValidationResult == false,
        passwordError = passwordValidationResult == false,
        errorMessage = if (manualLoginAttempted) errorMessage else null,  // Chỉ hiển thị lỗi khi đã thử đăng nhập thủ công
        openIntro = openIntro
    )

    // Xử lý kết quả đăng nhập
    LaunchedEffect(signInResult) {
        signInResult?.let { result ->
            when (result) {
                is Result.Success -> {
                    Log.d("SignInScreen", "Sign-in successful")
                    onLoginSuccess()
                }
                is Result.Error -> {
                    Log.e("SignInScreen", "Sign-in failed: ${result.message ?: "Unknown error"}")
                    if (manualLoginAttempted) {
                        errorMessage = result.message ?: "Incorrect username or password"  // Hiển thị thông báo lỗi cụ thể
                    }
                }
            }
        }
    }

    // Theo dõi kết quả Google Sign In
    LaunchedEffect(googleSignInResult) {
        Log.d("SignInScreen", "Google Sign In state changed: $googleSignInResult")

        googleSignInResult?.let { result ->
            when (result) {
                is Result.Success -> {
                    Log.d("SignInScreen", "Google Sign In Success")
                    result.data?.metadata?.let { metadata ->
                        if (metadata.user != null && metadata.signInToken != null) {
                            Log.d("SignInScreen", "Valid user data received, navigating...")
                            isLoading = false
                            scope.launch {
                                viewModel.resetGoogleSignInState()
                                onLoginSuccess()
                            }
                        }
                    }
                }
                is Result.Error -> {
                    Log.e("SignInScreen", "Google Sign In Error: ${result.message}")
                    isLoading = false
                    errorMessage = result.message
                }
            }
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
    onGoogleSignInClick: () -> Unit,
    emailError: Boolean,
    passwordError: Boolean,
    errorMessage: String?,
    openIntro: () -> Unit
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
                Spacer(modifier = Modifier.height(20.dp))
                SignInLogo()
                Spacer(modifier = Modifier.height(40.dp))
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
                SignInButton(onClick = onContinueClick)
                Spacer(modifier = Modifier.height(5.dp))
                GoogleSignInButton(onClick = onGoogleSignInClick)
                TextButton(onClick = {
                    openIntro()
                }) {
                    Text(
                        text = "Sign up"
                    )
                }
                SignInReport(text = errorMessage ?: "")
                SignInAgreementText()
            }
        }
    }
}

@Composable
fun SignInReport(text: String) {
    Text(
        text = text,
        style = AppTheme.appTypography.reportTitle
    )
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
fun SignInEmailField(email: String, onEmailChange: (String) -> Unit, isError: Boolean) {
    val containerColor = Color.Transparent

    TextField(
        value = email,
        onValueChange = onEmailChange,
        placeholder = {
            Text(
                "Enter your email",
                color = Color.Gray
            )
        },
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 0.dp),
        isError = isError,
        textStyle = TextStyle(color = Color.White),
        colors = TextFieldDefaults.colors(
            // Container colors
            focusedContainerColor = containerColor,
            unfocusedContainerColor = containerColor,
            disabledContainerColor = containerColor,
            errorContainerColor = containerColor,

            // Text colors
            focusedTextColor = Color.White,
            unfocusedTextColor = Color.White,

            // Cursor and indicator colors
            cursorColor = Color.White,
            focusedIndicatorColor = Color.White,
            unfocusedIndicatorColor = Color.Gray,

            // Background colors
            focusedPlaceholderColor = Color.Gray,
            unfocusedPlaceholderColor = Color.Gray,

            // Prevent white background when focused
            focusedLeadingIconColor = Color.Transparent,
            unfocusedLeadingIconColor = Color.Transparent,
            focusedTrailingIconColor = Color.White,
            unfocusedTrailingIconColor = Color.White,

            // Disable selection colors
            selectionColors = TextSelectionColors(
                handleColor = Color.White,
                backgroundColor = Color(0x40FFFFFF) // Semi-transparent white for selection
            )
        )
    )
}

@Composable
fun SignInPasswordField(password: String, onPasswordChange: (String) -> Unit, isError: Boolean) {
    var passwordVisible by remember { mutableStateOf(false) }
    val containerColor = Color.Transparent

    TextField(
        value = password,
        onValueChange = onPasswordChange,
        placeholder = {
            Text(
                "Enter your password",
                color = Color.Gray // Màu chữ placeholder
            )
        },
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 0.dp),
        visualTransformation = if (passwordVisible)
            VisualTransformation.None
        else
            PasswordVisualTransformation(),
        trailingIcon = {
            val image = if (passwordVisible)
                painterResource(id = R.drawable.visibility)
            else
                painterResource(id = R.drawable.visible)

            IconButton(onClick = { passwordVisible = !passwordVisible }) {
                Icon(
                    painter = image,
                    contentDescription = null,
                    tint = Color.White // Màu icon
                )
            }
        },
        isError = isError,
        textStyle = TextStyle(color = Color.White),
        colors = TextFieldDefaults.colors(
            // Container colors
            focusedContainerColor = containerColor,
            unfocusedContainerColor = containerColor,
            disabledContainerColor = containerColor,
            errorContainerColor = containerColor,

            // Text colors
            focusedTextColor = Color.White,
            unfocusedTextColor = Color.White,

            // Cursor and indicator colors
            cursorColor = Color.White,
            focusedIndicatorColor = Color.White,
            unfocusedIndicatorColor = Color.Gray,

            // Background colors
            focusedPlaceholderColor = Color.Gray,
            unfocusedPlaceholderColor = Color.Gray,

            // Prevent white background when focused
            focusedLeadingIconColor = Color.Transparent,
            unfocusedLeadingIconColor = Color.Transparent,
            focusedTrailingIconColor = Color.White,
            unfocusedTrailingIconColor = Color.White,

            // Disable selection colors
            selectionColors = TextSelectionColors(
                handleColor = Color.White,
                backgroundColor = Color(0x40FFFFFF) // Semi-transparent white for selection
            )
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

@Composable
fun GoogleSignInButton(onClick: () -> Unit) {
    Button(
        onClick = onClick,
        colors = ButtonDefaults.buttonColors(
            containerColor = Color.White,
            contentColor = Color.Black
        ),
        shape = RoundedCornerShape(AppTheme.appButtonStyle.cornerRadius.dp),
        modifier = Modifier
            .fillMaxWidth()
            .padding(AppTheme.appButtonStyle.padding.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            Image(
                painter = painterResource(id = R.drawable.google),
                contentDescription = "Google Icon",
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "Sign in with Google",
                style = AppTheme.appTypography.buttonText.copy(color = Color.Black)
            )
        }
    }
}

@Preview(showBackground = true)
@Composable
fun SignInScreenPreview() {
    SignInContent(
        email = "test@example.com",
        password = "password123",
        onEmailChange = {},
        onPasswordChange = {},
        onContinueClick = {},
        onGoogleSignInClick = {},
        emailError = false,
        passwordError = false,
        errorMessage = null,
        openIntro = {}
    )
}
