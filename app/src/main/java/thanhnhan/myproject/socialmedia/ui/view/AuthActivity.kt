package thanhnhan.myproject.socialmedia.ui.view

import android.content.ContentValues.TAG
import android.content.Intent
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.common.api.ApiException
import com.google.firebase.Firebase
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import com.google.firebase.auth.auth
import thanhnhan.myproject.socialmedia.data.Result
import kotlinx.coroutines.launch
import thanhnhan.myproject.socialmedia.data.database.UserDatabaseHelper
import thanhnhan.myproject.socialmedia.data.network.RetrofitInstance
import thanhnhan.myproject.socialmedia.data.repository.SignInUserRepository
import thanhnhan.myproject.socialmedia.ui.view.Login.LocketIntroScreen
import thanhnhan.myproject.socialmedia.ui.view.Login.SignIn
import thanhnhan.myproject.socialmedia.ui.view.Login.SignInScreen
import thanhnhan.myproject.socialmedia.ui.view.sign_up.ChooseBirthdaySignUp
import thanhnhan.myproject.socialmedia.ui.view.sign_up.ChooseCountrySignUp
import thanhnhan.myproject.socialmedia.ui.view.sign_up.ChooseEmailSignUp
import thanhnhan.myproject.socialmedia.ui.view.sign_up.ChooseNameSignUp
import thanhnhan.myproject.socialmedia.ui.view.sign_up.ChoosePasswordSignUp
import thanhnhan.myproject.socialmedia.ui.view.sign_up.VerifyEmailCodeSignUp
import thanhnhan.myproject.socialmedia.viewmodel.SignInUserViewModel
import thanhnhan.myproject.socialmedia.viewmodel.SignInUserViewModelFactory

class AuthActivity : ComponentActivity() {
    private lateinit var auth: FirebaseAuth

    // Thêm log để debug ViewModel
    private val viewModel: SignInUserViewModel by viewModels {
        Log.d("AuthActivity", "Creating ViewModel with Factory")
        SignInUserViewModelFactory(SignInUserRepository(RetrofitInstance.api), this)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        auth = Firebase.auth

        Log.d("AuthActivity", "ViewModel instance: $viewModel")

        Log.d("AuthActivity", "onCreate: Initializing")

        // Kiểm tra user đã đăng nhập
        val dbHelper = UserDatabaseHelper(this)
        val savedUser = dbHelper.getUserData()

        Log.d("AuthActivity", "Checking saved user: $savedUser")

        if (savedUser != null) {
            Log.d("AuthActivity", "Found saved user, navigating to Main")
            navigateToMain()
            return
        }

        // Thêm observer
        observeGoogleSignIn()

        // Chỉ setContent một lần
        setContent {
            val navController = rememberNavController()

            NavHost(navController = navController, startDestination = "intro") {
                composable(route = "intro") {
                    LocketIntroScreen(
                        openSignIn = { navController.navigate("signInScreen") },
                        openSignUp = { navController.navigate("chooseEmailSignUp") }
                    )
                }

                composable(route = "signInScreen") {
                    SignInScreen(
                        context = this@AuthActivity,
                        onLoginSuccess = { navigateToMain() },
                        openIntro = {
                            navController.navigate("intro") {
                                popUpTo("intro") { inclusive = true }
                            }
                        }
                    )
                }

                composable(route = "chooseEmailSignUp") {
                    ChooseEmailSignUp(
                        openChoosePassword = { email ->
                            navController.navigate("choosePasswordSignUp/$email")
                        }
                    )
                }
                composable(
                    route = "choosePasswordSignUp/{email}",
                    arguments = listOf(
                        navArgument("email") {
                            type = NavType.StringType
                        }
                    )
                ) { backStackEntry ->
                    val email = backStackEntry.arguments?.getString("email")
                    requireNotNull(email)
                    ChoosePasswordSignUp(
                        email = email,
                        openChooseName = { email, password ->
                            navController.navigate("chooseNameSignUp/$email/$password")
                        },
                        backAction = {
                            navController.popBackStack()
                        }
                    )
                }

                composable(
                    route = "chooseNameSignUp/{email}/{password}",
                    arguments = listOf(
                        navArgument(name = "email") {
                            type = NavType.StringType
                        },
                        navArgument(name = "password") {
                            type = NavType.StringType
                        }
                    )
                ) { navBackStackEntry ->
                    navBackStackEntry.arguments?.let { argument ->
                        val email = argument.getString("email")!!
                        val password = argument.getString("password")!!
                        ChooseNameSignUp(
                            email = email,
                            password = password,
                            openChooseBirthday = { email, password, name ->
                                navController.navigate("chooseBirthdaySignUp/$email/$password/$name")
                            },
                            backAction = {
                                navController.popBackStack()
                            }
                        )
                    }
                }

                composable(
                    route = "chooseBirthdaySignUp/{email}/{password}/{name}",
                    arguments = listOf(
                        navArgument(name = "email") {
                            type = NavType.StringType
                        },
                        navArgument(name = "password") {
                            type = NavType.StringType
                        },
                        navArgument(name = "name") {
                            type = NavType.StringType
                        }
                    )
                ) { navBackStackEntry ->
                    navBackStackEntry.arguments?.let { argument ->
                        val email = argument.getString("email")!!
                        val password = argument.getString("password")!!
                        val name = argument.getString("name")!!
                        ChooseBirthdaySignUp(
                            email = email,
                            password = password,
                            name = name,
                            openChooseCountry = { email, password, name, birthday ->
                                navController.navigate("chooseCountrySignUp/$email/$password/$name/$birthday")
                            },
                            backAction = {
                                navController.popBackStack()
                            }
                        )
                    }
                }

                composable(
                    route = "chooseCountrySignUp/{email}/{password}/{name}/{birthday}",
                    arguments = listOf(
                        navArgument(name = "email") {
                            type = NavType.StringType
                        },
                        navArgument(name = "password") {
                            type = NavType.StringType
                        },
                        navArgument(name = "name") {
                            type = NavType.StringType
                        },
                        navArgument(name = "birthday") {
                            type = NavType.StringType
                        }
                    )
                ) { navBackStackEntry ->
                    navBackStackEntry.arguments?.let { argument ->
                        val email = argument.getString("email")!!
                        val password = argument.getString("password")!!
                        val name = argument.getString("name")!!
                        val birthday = argument.getString("birthday")!!
                        ChooseCountrySignUp(
                            email = email,
                            password = password,
                            name = name,
                            birthday = birthday,
                            openVerifyCode = { email, password, name, birthday, country ->
                                navController.navigate("verifyEmailCodeSignUp/$email/$password/$name/$birthday/$country")
                            },
                            openChooseEmail = {
                                navController.navigate("chooseEmailSignUp")
                            },
                            backAction = {
                                navController.popBackStack()
                            }
                        )
                    }
                }

                composable(
                    route = "verifyEmailCodeSignUp/{email}/{password}/{name}/{birthday}/{country}",
                    arguments = listOf(
                        navArgument(name = "email") {
                            type = NavType.StringType
                        },
                        navArgument(name = "password") {
                            type = NavType.StringType
                        },
                        navArgument(name = "name") {
                            type = NavType.StringType
                        },
                        navArgument(name = "birthday") {
                            type = NavType.StringType
                        },
                        navArgument(name = "country") {
                            type = NavType.StringType
                        }
                    )
                ) { navBackStackEntry ->
                    navBackStackEntry.arguments?.let { argument ->
                        val email = argument.getString("email")!!
                        val password = argument.getString("password")!!
                        val name = argument.getString("name")!!
                        val birthday = argument.getString("birthday")!!
                        val country = argument.getString("country")!!
                        VerifyEmailCodeSignUp(
                            email = email,
                            password = password,
                            name = name,
                            birthday = birthday,
                            country = country,
                            openSignin = { email ->
                                navController.navigate("signInScreen")
                            },
                            backAction = {
                                navController.popBackStack()
                            }
                        )
                    }
                }

            }
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        Log.d("AuthActivity", "onActivityResult: requestCode=$requestCode")

        if (requestCode == SignIn.RC_SIGN_IN) {
            val task = GoogleSignIn.getSignedInAccountFromIntent(data)
            try {
                val account = task.getResult(ApiException::class.java)
                Log.d("AuthActivity", "Google Sign In successful, getting Firebase token")
                firebaseAuthWithGoogle(account.idToken!!)
            } catch (e: ApiException) {
                Log.e("AuthActivity", "Google sign in failed", e)
            }
        }
    }

    private fun firebaseAuthWithGoogle(idToken: String) {
        Log.d("AuthActivity", "Starting Firebase authentication")
        val credential = GoogleAuthProvider.getCredential(idToken, null)
        auth.signInWithCredential(credential)
            .addOnSuccessListener { authResult ->
                Log.d("AuthActivity", "Firebase Auth successful")
                auth.currentUser?.getIdToken(true)?.addOnSuccessListener { result ->
                    val firebaseToken = result.token
                    Log.d("AuthActivity", "Got Firebase token, calling ViewModel: $viewModel")

                    try {
                        Log.d("AuthActivity", "Before calling handleGoogleSignIn")
                        if (firebaseToken == null) {
                            Log.e("AuthActivity", "Firebase token is null!")
                            return@addOnSuccessListener
                        }

                        // Thêm scope để đảm bảo coroutine được chạy
                        lifecycleScope.launch {
                            try {
                                viewModel.handleGoogleSignIn(firebaseToken)
                                Log.d("AuthActivity", "After calling handleGoogleSignIn")
                            } catch (e: Exception) {
                                Log.e("AuthActivity", "Error in handleGoogleSignIn", e)
                                e.printStackTrace()
                            }
                        }
                    } catch (e: Exception) {
                        Log.e("AuthActivity", "Error in firebaseAuthWithGoogle", e)
                        e.printStackTrace()
                    }
                }?.addOnFailureListener { e ->
                    Log.e("AuthActivity", "Failed to get ID token", e)
                }
            }
            .addOnFailureListener { e ->
                Log.e("AuthActivity", "Firebase Auth failed", e)
            }
    }

    private fun navigateToMain() {
        val intent = Intent(this, MainActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }

    // Thêm observer cho googleSignInResult
    private fun observeGoogleSignIn() {
        lifecycleScope.launch {
            lifecycle.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.googleSignInResult.collect { result ->
                    Log.d("AuthActivity", "Received Google Sign In result: $result")
                    when (result) {
                        is Result.Success -> {
                            Log.d("AuthActivity", "Google Sign In Success")
                            navigateToMain()
                        }
                        is Result.Error -> {
                            Log.e("AuthActivity", "Google Sign In Error: ${result.message}")
                        }
                        null -> {
                            Log.d("AuthActivity", "Waiting for Google Sign In result")
                        }

                        is thanhnhan.myproject.socialmedia.data.Result.Error -> TODO()
                        is thanhnhan.myproject.socialmedia.data.Result.Success -> TODO()
                    }
                }
            }
        }
    }

    // Thêm lifecycle logging
    override fun onResume() {
        super.onResume()
        Log.d("AuthActivity", "onResume called")
    }

    override fun onPause() {
        super.onPause()
        Log.d("AuthActivity", "onPause called")
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.d("AuthActivity", "onDestroy called")
    }
}