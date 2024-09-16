package thanhnhan.myproject.socialmedia.ui.view.sign_up

import android.widget.Toast
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.KeyboardArrowLeft
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.ParagraphStyle
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewmodel.compose.viewModel
import thanhnhan.myproject.socialmedia.R
import thanhnhan.myproject.socialmedia.data.network.RetrofitInstance
import thanhnhan.myproject.socialmedia.data.repository.SignupRepository
import thanhnhan.myproject.socialmedia.data.Result
import thanhnhan.myproject.socialmedia.ui.theme.AppTheme
import thanhnhan.myproject.socialmedia.ui.theme.SocialMediaTheme
import thanhnhan.myproject.socialmedia.viewmodel.SignupViewModel
import thanhnhan.myproject.socialmedia.viewmodel.SignupViewModelFactory

@Composable
fun ChooseEmailSignUp(
    openChoosePassword: (String) -> Unit
) {
    val api = RetrofitInstance.api
    val repository = SignupRepository(api)
    val viewModel: SignupViewModel = viewModel(factory = SignupViewModelFactory(repository))
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(color = Color(0xFF22272E))
    ) {
        var email by remember { mutableStateOf("") }
        var savedEmail by remember { mutableStateOf<String>("") }
        var textButton by remember { mutableStateOf("Continue") }
        var textTitle by remember { mutableStateOf("What's your email?") }
        var textPlaceHolder by remember { mutableStateOf("Email") }
        val emailValidationResult by viewModel.emailValidationResult.collectAsState()
        val codeValidationResult by viewModel.stringLengthValidationResult.collectAsState()

        val emailCheckResult = viewModel.emailCheckResult.collectAsState().value
        val context = LocalContext.current
        var verificationCode by remember { mutableStateOf("") }
        LaunchedEffect(key1 = emailCheckResult) {
            emailCheckResult?.let { result ->
                when (result) {
                    is Result.Success -> {
                        verificationCode = result.data?.metadata?.code?.toString() ?: ""
                        savedEmail = email
                        textButton = "Verify code"
                        textTitle = "Enter your code"
                        textPlaceHolder = "Verification code"
                        email = ""
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

        BackIconButton {}
        LogoImage()
        AppName()
        Spacer(modifier = Modifier.height(80.dp))
        SignUpTitle(text = textTitle)
        InputField(
            placeHolder = textPlaceHolder,
            leadingIcon = Icons.Default.Email,
            trailingIconVector = Icons.Default.Clear,
            value = email,
            onValueChange = {
                email = it
                if (textButton == "Continue") {
                    viewModel.checkEmailFormat(it)
                } else {
                    viewModel.checkStringLength(it)
                }
            },
            onTrailingIconClick = { email = "" }
        )
        Spacer(modifier = Modifier.height(105.dp))
        TermsAndPolicyText()
        Spacer(modifier = Modifier.height(20.dp))
        ContinueButton(
            text = textButton,
            icon = Icons.Default.ArrowForward,
            onClick = {
                if (email.isNotEmpty()) {
                    if (textButton == "Continue") {
                        viewModel.checkEmail(email)
                    } else {
                        if (email == verificationCode) {
                            openChoosePassword(savedEmail)
                        } else {
                            Toast.makeText(
                                context,
                                "Verification code is incorrect",
                                Toast.LENGTH_LONG
                            ).show()
                        }
                    }
                } else {
                    Toast.makeText(context, "Please enter your email", Toast.LENGTH_LONG).show()
                }
            },
            isEnable = (emailValidationResult == true || codeValidationResult == true)
        )
    }
}

@Composable
fun AppName() {
    Box(modifier = Modifier.fillMaxWidth()) {
        Text(
            modifier = Modifier
                .align(Alignment.Center),
            text = "Sky Line",
            color = Color(0xFF19ADC8),
            fontSize = 30.sp,
            fontWeight = FontWeight.ExtraBold
        )
    }
}

@Composable
fun LogoImage() {
    Box(modifier = Modifier.fillMaxWidth()) {
        Image(
            painter = painterResource(id = R.drawable.logo),
            contentDescription = "Logo",
            modifier = Modifier
                .align(Alignment.Center)
                .size(180.dp)
                .clip(CircleShape)
        )
    }
}

@Composable
fun ContinueButton(
    isEnable: Boolean = true,
    text: String,
    icon: ImageVector? = null,
    onClick: () -> Unit,
) {
    Button(
        modifier = Modifier
            .height(60.dp)
            .width(400.dp)
            .padding(horizontal = 24.dp)
            .clip(RoundedCornerShape(AppTheme.appButtonStyle.cornerRadius)),
        onClick = {
            onClick.invoke()
        },
        colors = ButtonDefaults.buttonColors(
            containerColor = AppTheme.appButtonStyle.backgroundColor,
            disabledContainerColor = Color.Gray,
            disabledContentColor = Color.White
        ),
        enabled = isEnable,
        elevation = ButtonDefaults.buttonElevation(
            defaultElevation = 10.dp,
            pressedElevation = 15.dp,
            disabledElevation = 0.dp
        )
    ) {
        Text(text = text, fontSize = 25.sp)
        if (icon != null) {
            Icon(
                imageVector = icon,
                contentDescription = "Continue",
                modifier = Modifier
                    .size(35.dp)
                    .padding(top = 5.dp, start = 10.dp)
            )
        }
    }
}

@Composable
fun TermsAndPolicyText() {
    Text(
        text = buildAnnotatedString {
            withStyle(style = ParagraphStyle(textAlign = TextAlign.End)) {
                withStyle(style = SpanStyle(color = Color.Gray)) {
                    append("By tapping Continue, you are agreeing to\nour")
                }
                withStyle(style = SpanStyle(color = Color(0xFF19ADC8))) {
                    append(" Terms of Service")
                }
                withStyle(style = SpanStyle(color = Color.Gray)) {
                    append(" and")
                }
                withStyle(style = SpanStyle(color = Color(0xFF19ADC8))) {
                    append(" Privacy Policy")
                }
            }
        },
        modifier = Modifier.padding(start = 40.dp)
    )
}

@Composable
fun BackIconButton(
    onClick: () -> Unit,
) {
    IconButton(
        onClick = { onClick.invoke() },
        modifier = Modifier
            .padding(16.dp)
            .size(40.dp)
            .clip(CircleShape)
            .background(color = Color(0xFF19ADC8))
    ) {
        Icon(
            modifier = Modifier
                .size(40.dp),
            imageVector = Icons.Filled.KeyboardArrowLeft,
            contentDescription = null
        )
    }
}

@Composable
fun SignUpTitle(text: String) {
    Text(
        text = text,
        fontWeight = FontWeight.Bold,
        fontSize = 30.sp,
        color = Color(0xFF19ADC8),
        modifier = Modifier.padding(start = 20.dp)
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun InputField(
    placeHolder: String,
    leadingIcon: ImageVector? = null,
    trailingIconVector: ImageVector? = null,
    trailingIconResource: Int? = null,
    value: String,
    onValueChange: (String) -> Unit,
    onTrailingIconClick: (() -> Unit)? = null,
    isPassword: Boolean = false,
) {
    val keyboardController = LocalSoftwareKeyboardController.current
    val visualTransformation =
        if (isPassword) PasswordVisualTransformation()
        else VisualTransformation.None

    val containerColor = Color(0xFF3C434A)
    TextField(
        modifier = Modifier
            .padding(start = 25.dp)
            .width(350.dp),
        shape = RoundedCornerShape(15.dp),
        value = value,
        onValueChange = { onValueChange(it) },
        textStyle = TextStyle(
            color = Color.White,
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold
        ),
        placeholder = { Text(text = placeHolder) },
        leadingIcon = {
            if (leadingIcon != null) {
                Icon(imageVector = leadingIcon, contentDescription = null)
            }
        },
        trailingIcon = {
            if (trailingIconVector != null) {
                IconButton(onClick = { onTrailingIconClick?.invoke() }) {
                    Icon(
                        imageVector = trailingIconVector,
                        contentDescription = null,
                        modifier = Modifier.size(24.dp)
                    )
                }
            } else if (trailingIconResource != null) {
                IconButton(onClick = { onTrailingIconClick?.invoke() }) {
                    Icon(
                        painter = painterResource(id = trailingIconResource),
                        contentDescription = null,
                        modifier = Modifier.size(24.dp)
                    )
                }
            }
        },
        colors = TextFieldDefaults.colors(
            focusedContainerColor = containerColor,
            unfocusedContainerColor = containerColor,
            disabledContainerColor = containerColor,
            cursorColor = Color(0xFFE3A400),
            focusedIndicatorColor = Color.Transparent,
            unfocusedIndicatorColor = Color.Transparent,
            disabledIndicatorColor = Color.Transparent,
            focusedLeadingIconColor = AppTheme.appButtonStyle.backgroundColor,
            unfocusedLeadingIconColor = AppTheme.appButtonStyle.backgroundColor,
            focusedTrailingIconColor = AppTheme.appButtonStyle.backgroundColor,
            unfocusedTrailingIconColor = AppTheme.appButtonStyle.backgroundColor,
            focusedPlaceholderColor = Color.Gray,
            unfocusedPlaceholderColor = Color.Gray,
        ),
        visualTransformation = visualTransformation,
        keyboardOptions = KeyboardOptions(
            imeAction = ImeAction.Done,
            keyboardType = KeyboardType.Email
        ),
        keyboardActions = KeyboardActions(
            onDone = {
                keyboardController?.hide()
            }
        )
    )
}

@Composable
@Preview(showBackground = true, showSystemUi = true)
fun ChooseEmailSignUpPreview() {
    SocialMediaTheme {
        ChooseEmailSignUp({})
    }
}
