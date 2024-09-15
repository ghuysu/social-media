package thanhnhan.myproject.socialmedia.ui.view.user_profile

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
import thanhnhan.myproject.socialmedia.ui.theme.SocialMediaTheme
import thanhnhan.myproject.socialmedia.ui.view.sign_up.AppName
import thanhnhan.myproject.socialmedia.ui.view.sign_up.BackIconButton
import thanhnhan.myproject.socialmedia.ui.view.sign_up.ContinueButton
import thanhnhan.myproject.socialmedia.ui.view.sign_up.LogoImage
import thanhnhan.myproject.socialmedia.viewmodel.SignupViewModel
import thanhnhan.myproject.socialmedia.viewmodel.SignupViewModelFactory

@Composable
fun ChangeCountry(
    oldCountry: String,
    openUserProfile: (String) -> Unit,
    backAction: () -> Unit = {},
) {
    val context = LocalContext.current

    val api = RetrofitInstance.api
    val repository = SignupRepository(api)
    val viewModel: SignupViewModel = viewModel(factory = SignupViewModelFactory(repository))

    val countries by viewModel.countries.collectAsState()
    // Biến trạng thái để lưu country được chọn
    val selectedCountry by viewModel.selectedCountry.collectAsState()
    // Biến trạng thái để kiểm soát hiển thị của menu
    var expanded by remember { mutableStateOf(false) }

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
            text = oldCountry.ifEmpty { selectedCountry?.first ?: "Select your country" },
            onClick = {
                expanded = true
            },
            buttonColor = Color(0xFF3C434A)
        )
        Spacer(modifier = Modifier.height(5.dp))
        DropdownMenu(
            expanded = expanded,
            onDismissRequest = { expanded = false },
            modifier = Modifier.fillMaxWidth()
        ) {
            countries.forEach { (name, code) ->
                DropdownMenuItem(
                    text = { Text(text = name) },
                    onClick = {
                        viewModel.selectCountry(name, code)
                        expanded = false
                    }
                )
            }
        }
        Spacer(modifier = Modifier.height(145.dp))
        ContinueButton(
            text = "Continue",
            icon = Icons.Default.ArrowForward,
            isEnable = selectedCountry != null,
            onClick = {
                if (selectedCountry != null) {
                    // TODO: Change country
                } else {
                    Toast.makeText(context, "Please select a country", Toast.LENGTH_SHORT).show()
                }
            }
        )
    }
}

@Composable
@Preview(showBackground = true, showSystemUi = true)
fun ChangeCountryPreview() {
    SocialMediaTheme {
        ChangeCountry(
            oldCountry = "Vietnam",
            openUserProfile = { _ -> }
        )
    }
}