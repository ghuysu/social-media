package thanhnhan.myproject.socialmedia.ui.view.user_profile

import android.app.DatePickerDialog
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
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
import thanhnhan.myproject.socialmedia.data.model.SignInUserResponse
import thanhnhan.myproject.socialmedia.data.model.UserSession
import thanhnhan.myproject.socialmedia.data.repository.UserProfileRepository
import thanhnhan.myproject.socialmedia.ui.theme.SocialMediaTheme
import thanhnhan.myproject.socialmedia.ui.view.sign_up.AppName
import thanhnhan.myproject.socialmedia.ui.view.sign_up.BackIconButton
import thanhnhan.myproject.socialmedia.ui.view.sign_up.ContinueButton
import thanhnhan.myproject.socialmedia.ui.view.sign_up.LogoImage
import thanhnhan.myproject.socialmedia.ui.view.sign_up.TermsAndPolicyText
import thanhnhan.myproject.socialmedia.viewmodel.UserProfileViewModel
import thanhnhan.myproject.socialmedia.viewmodel.UserProfileViewModelFactory
import java.util.Calendar

@Composable
fun ChangeBirthday(
    openUserProfile: () -> Unit,
    backAction: () -> Unit = {}
) {
    var birthday by remember { mutableStateOf(UserSession.user!!.birthday) }
    var showDatePicker by remember { mutableStateOf(false) }
    val context = LocalContext.current
    val calendar = Calendar.getInstance()
    val year = calendar.get(Calendar.YEAR)
    val month = calendar.get(Calendar.MONTH)
    val day = calendar.get(Calendar.DAY_OF_MONTH)

    val api = RetrofitInstance.api
    val repository = UserProfileRepository(api)
    val viewModel: UserProfileViewModel = viewModel(factory = UserProfileViewModelFactory(repository))
    val changeBirthdayResult = viewModel.changeBirthdayResult.collectAsState().value

    LaunchedEffect(key1 = changeBirthdayResult) {
        changeBirthdayResult?.let { result ->
            when (result) {
                is Result.Success -> {
                    Toast.makeText(
                        context,
                        "Change birthday successfully: ${result.data?.metadata?.birthday}",
                        Toast.LENGTH_LONG
                    ).show()
                    delay(1000)
                    UserSession.user?.birthday = birthday
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

    val datePickerDialog = DatePickerDialog(
        context,
        { _, selectedYear, selectedMonth, selectedDayOfMonth ->
            birthday = String.format("%02d/%02d/%04d", selectedDayOfMonth, selectedMonth + 1, selectedYear)
            showDatePicker = false
        }, year, month, day
    )

    calendar.set(1991, Calendar.JANUARY, 1)
    datePickerDialog.datePicker.minDate = calendar.timeInMillis

    val currentYear = Calendar.getInstance().get(Calendar.YEAR)
    calendar.set(currentYear-1, Calendar.DECEMBER, 31)
    datePickerDialog.datePicker.maxDate = calendar.timeInMillis - 1

    if (showDatePicker) {
        datePickerDialog.show()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(color = Color(0xFF22272E))
    ) {
        BackIconButton(backAction)
        LogoImage()
        AppName()
        Spacer(modifier = Modifier.height(80.dp))
        ContinueButton(
            text = birthday.ifEmpty { "Choose your birthday" },
            onClick = {
                showDatePicker = true
            },
            buttonColor = Color(0xFF3C434A)
        )
        Spacer(modifier = Modifier.height(140.dp))
        TermsAndPolicyText()
        Spacer(modifier = Modifier.height(20.dp))
        ContinueButton(
            text = "Continue",
            icon = Icons.Default.ArrowForward,
            onClick = {
                if (birthday.isNotEmpty()) {
                    viewModel.changeBirthday(UserSession.signInToken!!, birthday)
                } else {
                    Toast.makeText(context, "Please choose your birthday", Toast.LENGTH_SHORT).show()
                }
            }
        )
    }
}

@Composable
@Preview(showBackground = true, showSystemUi = true)
fun ChangeBirthdayPreview() {
    SocialMediaTheme {
        UserSession.setUserData(
            SignInUserResponse.Metadata.User(
                _id = "12345",
                email = "user@gmail.com",
                fullname = "John Doe",
                birthday = "15/07/2003",
                profileImageUrl = "https://via.placeholder.com/150",  // URL ảnh đại diện giả lập
                friendList = listOf(),
                friendInvites = listOf(),
                country = "VN"
            ),
            token = "mockToken"
        )

        ChangeBirthday(
            openUserProfile = { }
        )
    }
}