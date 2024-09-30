package thanhnhan.myproject.socialmedia.ui.view.user_profile.change_email

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Create
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.delay
import thanhnhan.myproject.socialmedia.data.network.RetrofitInstance
import thanhnhan.myproject.socialmedia.data.Result
import thanhnhan.myproject.socialmedia.data.database.UserDatabaseHelper
import thanhnhan.myproject.socialmedia.data.model.UserSession
import thanhnhan.myproject.socialmedia.data.repository.SignupRepository
import thanhnhan.myproject.socialmedia.data.repository.UserProfileRepository
import thanhnhan.myproject.socialmedia.ui.theme.SocialMediaTheme
import thanhnhan.myproject.socialmedia.ui.view.sign_up.AppName
import thanhnhan.myproject.socialmedia.ui.view.sign_up.BackIconButton
import thanhnhan.myproject.socialmedia.ui.view.sign_up.ContinueButton
import thanhnhan.myproject.socialmedia.ui.view.sign_up.InputField
import thanhnhan.myproject.socialmedia.ui.view.sign_up.LogoImage
import thanhnhan.myproject.socialmedia.ui.view.sign_up.SignUpTitle
import thanhnhan.myproject.socialmedia.viewmodel.SignupViewModel
import thanhnhan.myproject.socialmedia.viewmodel.SignupViewModelFactory
import thanhnhan.myproject.socialmedia.viewmodel.UserProfileViewModel
import thanhnhan.myproject.socialmedia.viewmodel.UserProfileViewModelFactory

@Composable
fun VerifyEmailCodeChangeEmail(
    email: String,
    openUserProfile: () -> Unit,
    backAction: () -> Unit = {},
) {
    val api = RetrofitInstance.api
    val repository = SignupRepository(api)
    val viewModel: SignupViewModel = viewModel(factory = SignupViewModelFactory(repository))

    val userRepository = UserProfileRepository(api)
    val userViewModel: UserProfileViewModel =
        viewModel(factory = UserProfileViewModelFactory(userRepository))
    val checkEmailCodeResult by userViewModel.checkEmailCodeResult.collectAsState()

    val context = LocalContext.current

    LaunchedEffect(checkEmailCodeResult) {
        checkEmailCodeResult?.let { result ->
            when (result) {
                is Result.Success -> {
                    Toast.makeText(
                        context,
                        result.data?.message,
                        Toast.LENGTH_LONG
                    ).show()
                    delay(1000)
                    UserSession.user?.email = email
                    val dbHelper = UserDatabaseHelper(context)
                    dbHelper.updateEmail(email)
                    openUserProfile()
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

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(color = Color(0xFF22272E))
    ) {
        val codeValidationResult by viewModel.stringValidationResult.collectAsState()
        var verifyCode by remember { mutableStateOf("") }

        BackIconButton(backAction)
        LogoImage()
        AppName()
        Spacer(modifier = Modifier.height(80.dp))
        SignUpTitle(text = "Code sent to your email?")
        Spacer(modifier = Modifier.height(5.dp))
        InputField(
            placeHolder = "Verification code",
            leadingIcon = Icons.Default.Create,
            trailingIconVector = Icons.Default.Clear,
            value = verifyCode,
            onValueChange = {
                verifyCode = it
                viewModel.checkString(it)
            },
            onTrailingIconClick = {
                verifyCode = ""
                viewModel.checkString(verifyCode)
            },
        )
        Spacer(modifier = Modifier.height(155.dp))
        ContinueButton(
            text = "Continue",
            icon = Icons.Default.ArrowForward,
            onClick = {
                if (verifyCode.isNotEmpty()) {
                    userViewModel.checkEmailCode(UserSession.signInToken!!, email, verifyCode.toInt())
                } else {
                    Toast.makeText(
                        context,
                        "Please fill your code",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            },
            isEnable = codeValidationResult == true
        )
    }
}

@Composable
@Preview(showBackground = true, showSystemUi = true)
fun VerifyEmailCodeChangeEmailPreview() {
    SocialMediaTheme {
        VerifyEmailCodeChangeEmail(
            email = "example@email.com",
            openUserProfile = {},
            backAction = {}
        )
    }
}