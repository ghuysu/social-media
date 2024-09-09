package thanhnhan.myproject.socialmedia.ui.view.sign_up

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
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import thanhnhan.myproject.socialmedia.ui.theme.SocialMediaTheme
import java.util.Calendar

@Composable
fun ChooseBirthdaySignUp(
    email: String,
    password: String,
    name: String,
    openChooseCountry: (String, String, String, String) -> Unit,
    backAction: () -> Unit = {}
) {
    var birthday by remember { mutableStateOf("") }
    var showDatePicker by remember { mutableStateOf(false) }
    val context = LocalContext.current
    val calendar = Calendar.getInstance()
    val year = calendar.get(Calendar.YEAR)
    val month = calendar.get(Calendar.MONTH)
    val day = calendar.get(Calendar.DAY_OF_MONTH)

    if (showDatePicker) {
        DatePickerDialog(
            context,
            { _, selectedYear, selectedMonth, selectedDayOfMonth ->
                birthday = String.format("%02d-%02d-%04d", selectedDayOfMonth, selectedMonth + 1, selectedYear)
                showDatePicker = false
            }, year, month, day
        ).show()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(color = Color(0xFF22272E))
    ) {
        BackIconButton({})
        LogoImage()
        AppName()
        Spacer(modifier = Modifier.height(80.dp))
        ContinueButton(
            text = birthday.ifEmpty { "Choose your birthday" },
            onClick = {
                showDatePicker = true
            }
        )
        Spacer(modifier = Modifier.height(140.dp))
        TermsAndPolicyText()
        Spacer(modifier = Modifier.height(20.dp))
        ContinueButton(
            text = "Continue",
            icon = Icons.Default.ArrowForward,
            onClick = {
                if (birthday.isNotEmpty()) {
                    openChooseCountry(email, password, name, birthday)
                } else {
                    Toast.makeText(context, "Please choose your birthday", Toast.LENGTH_SHORT).show()
                }
            }
        )
    }
}

@Composable
@Preview(showBackground = true, showSystemUi = true)
fun ChooseBirthdaySignUpPreview() {
    SocialMediaTheme {
        ChooseBirthdaySignUp(
            email = "example@example.com",
            password = "password123",
            name = "John Doe",
            openChooseCountry = { _, _, _, _ -> }
        )
    }
}