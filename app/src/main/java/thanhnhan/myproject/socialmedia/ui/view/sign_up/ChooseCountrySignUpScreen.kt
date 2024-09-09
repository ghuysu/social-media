package thanhnhan.myproject.socialmedia.ui.view.sign_up

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Text
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
import thanhnhan.myproject.socialmedia.data.network.RetrofitInstance
import thanhnhan.myproject.socialmedia.data.repository.SignupRepository
import thanhnhan.myproject.socialmedia.data.Result
import thanhnhan.myproject.socialmedia.data.model.UserRequest
import thanhnhan.myproject.socialmedia.ui.theme.SocialMediaTheme
import thanhnhan.myproject.socialmedia.viewmodel.SignupViewModel
import thanhnhan.myproject.socialmedia.viewmodel.SignupViewModelFactory

@Composable
fun ChooseCountrySignUp(
    email: String,
    password: String,
    name: String,
    birthday: String,
    backAction: () -> Unit = {}
) {
    // Danh sách các tùy chọn country
    val countryOptions = listOf(
        "Vietnam",
        "United States",
        "Canada",
        "United Kingdom",
        "Australia",
        "Germany",
        "France",
        "Japan",
        "South Korea",
        "India",
        "Brazil"
    )
    // Biến trạng thái để lưu country được chọn
    var selectedCountry by remember { mutableStateOf("") }
    // Biến trạng thái để kiểm soát hiển thị của menu
    var expanded by remember { mutableStateOf(false) }
    val formattedBirthday = birthday.replace("-", "/")
    val context = LocalContext.current

    val api = RetrofitInstance.api
    val repository = SignupRepository(api)
    val viewModel: SignupViewModel = viewModel(factory = SignupViewModelFactory(repository))
    val userCreationResult = viewModel.userCreationResult.collectAsState().value

    LaunchedEffect(key1 = userCreationResult) {
        userCreationResult?.let { result ->
            when (result) {
                is Result.Success -> {
                    Toast.makeText(
                        context,
                        "User created successfully: ${result.data?.metadata?.user?.email}",
                        Toast.LENGTH_LONG
                    ).show()
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
        BackIconButton(backAction)
        LogoImage()
        AppName()
        Spacer(modifier = Modifier.height(80.dp))
        ContinueButton(
            text = selectedCountry.ifEmpty { "Select your country" },
            onClick = {
                expanded = true
            }
        )
        Spacer(modifier = Modifier.height(5.dp))
        DropdownMenu(
            expanded = expanded,
            onDismissRequest = { expanded = false },
            modifier = Modifier.fillMaxWidth()
        ) {
            countryOptions.forEach { country ->
               DropdownMenuItem(
                   text = { Text(text = country) },
                   onClick = {
                       selectedCountry = country
                       expanded = false
                   }
               )
            }
        }
        Spacer(modifier = Modifier.height(145.dp))
        ContinueButton(
            text = "Continue",
            icon = Icons.Default.ArrowForward,
            isEnable = selectedCountry.isNotEmpty(),
            onClick = {
                if (selectedCountry.isNotEmpty()) {
                    viewModel.createUser(UserRequest(email, name, password, selectedCountry, formattedBirthday))
                } else {
                    Toast.makeText(context, "Please select a country", Toast.LENGTH_SHORT).show()
                }
            }
        )
    }
}

@Composable
@Preview(showBackground = true, showSystemUi = true)
fun ChooseCountrySignUpPreview() {
    SocialMediaTheme {
        ChooseCountrySignUp(
            email = "jd@gmail.com",
            password = "123",
            name = "John Doe",
            birthday = "01/01/2000"
        )
    }
}