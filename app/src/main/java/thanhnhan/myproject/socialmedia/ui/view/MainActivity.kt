package thanhnhan.myproject.socialmedia.ui.view

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.tooling.preview.Preview
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import thanhnhan.myproject.socialmedia.data.database.UserDatabaseHelper
import thanhnhan.myproject.socialmedia.data.network.RetrofitInstance
import thanhnhan.myproject.socialmedia.data.repository.UserProfileRepository
import androidx.navigation.navDeepLink
import thanhnhan.myproject.socialmedia.ui.theme.SocialMediaTheme
import thanhnhan.myproject.socialmedia.ui.view.HomeScreen.LocketScreen
import thanhnhan.myproject.socialmedia.ui.view.Login.LocketIntroScreen
import thanhnhan.myproject.socialmedia.ui.view.Login.SignInScreen
import thanhnhan.myproject.socialmedia.ui.view.add_friend.AddFriendScreen
import thanhnhan.myproject.socialmedia.ui.view.sign_up.ChooseBirthdaySignUp
import thanhnhan.myproject.socialmedia.ui.view.sign_up.ChooseCountrySignUp
import thanhnhan.myproject.socialmedia.ui.view.sign_up.ChooseEmailSignUp
import thanhnhan.myproject.socialmedia.ui.view.sign_up.ChooseNameSignUp
import thanhnhan.myproject.socialmedia.ui.view.sign_up.ChoosePasswordSignUp
import thanhnhan.myproject.socialmedia.ui.view.sign_up.VerifyEmailCodeSignUp
import thanhnhan.myproject.socialmedia.ui.view.user_profile.ChangeBirthday
import thanhnhan.myproject.socialmedia.ui.view.user_profile.ChangeCountry
import thanhnhan.myproject.socialmedia.ui.view.user_profile.ChangeFullname
import thanhnhan.myproject.socialmedia.ui.view.user_profile.ProfileScreen
import thanhnhan.myproject.socialmedia.ui.view.user_profile.change_email.ChangeEmail
import thanhnhan.myproject.socialmedia.ui.view.user_profile.change_email.VerifyEmailCodeChangeEmail

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            SocialMediaTheme {
                // A surface container using the 'background' color from the theme
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    MainApp()
                }
            }
        }
    }
}

@Composable
fun MainApp() {
    val navController = rememberNavController()
    val context = LocalContext.current
    val dbHelper = UserDatabaseHelper(context)
    val savedUser = dbHelper.getUserData()

    var authToken: String = savedUser?.token ?: "defaultToken"

    if (savedUser != null) {
        authToken = savedUser.token // Gán giá trị cho authToken
    }
        SocialMediaTheme {
            NavHost(navController = navController, startDestination = "signInScreen") {
                composable(route = "intro") {
                    LocketIntroScreen(
                        openSignIn = {
                            navController.navigate("signInScreen")
                        },
                        openSignUp = {
                            navController.navigate("chooseEmailSignUp")
                        }
                    )
                }

                // Thêm SignInScreen vào NavHost
                composable(route = "signInScreen") {
                    SignInScreen(
                        context = context,
                        onLoginSuccess = {
                            navController.navigate("UserProfile")  // Điều hướng đến màn hình chính sau khi đăng nhập thành công
                        }
                    )
                }
                // Thêm HomeScreen vào NavHost
                composable(route = "homeScreen") {
                    LocketScreen()
                }
                composable(route = "chooseEmailSignUp") {
                    ChooseEmailSignUp(openChoosePassword = { email ->
                        navController.navigate("choosePasswordSignUp/$email")
                    })
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
                                navController.navigate("signIn/$email")
                            },
                            backAction = {
                                navController.popBackStack()
                            }
                        )
                    }
                }
                composable(route = "UserProfile") {
                    val context = LocalContext.current  // Lấy context bằng LocalContext
                    val dbHelper = UserDatabaseHelper(context)
                    val savedUser = dbHelper.getUserData()

                    if (savedUser != null) {
                        val authToken = savedUser.token  // Lấy token từ SQLite
                        ProfileScreen(
                            openChangeEmail = {
                                navController.navigate("changeEmail")
                            },
                            openChangeBirthday = {
                                navController.navigate("changeBirthday")
                            },
                            openChangeCountry = {
                                navController.navigate("changeCountry")
                            },
                            openChangeFullname = {
                                navController.navigate("changeFullname")
                            },
                            openIntro = {
                                navController.navigate("intro")
                            },
                            repository = UserProfileRepository(RetrofitInstance.api),  // Sử dụng repository
                            authToken = authToken  // Truyền token đã lưu vào ProfileScreen
                        )
                    } else {
                        // Nếu không có token, có thể chuyển hướng người dùng về màn hình đăng nhập
                        navController.navigate("SignIn")
                    }
                    ProfileScreen(
                        openChangeEmail = {
                            navController.navigate("changeEmail")
                        },
                        openChangeBirthday = {
                            navController.navigate("changeBirthday")
                        },
                        openChangeCountry = {
                            navController.navigate("changeCountry")
                        },
                        openChangeFullname = {
                            navController.navigate("changeFullname")
                        },
                        openIntro = {
                            navController.navigate("intro")
                        },
                        repository = UserProfileRepository(RetrofitInstance.api),  // Sử dụng repository
                        authToken = authToken  // Truyền token đã lưu vào ProfileScreen
                    )
                }

                composable(route = "changeEmail") {
                    ChangeEmail(
                        openVerifyCode = { email ->
                            navController.navigate("verifyEmailCodeChangeEmail/$email")
                        }
                    )
                }

                composable(
                    route = "verifyEmailCodeChangeEmail/{email}",
                    arguments = listOf(
                        navArgument("email") {
                            type = NavType.StringType
                        }
                    )
                ) { backStackEntry ->
                    val email = backStackEntry.arguments?.getString("email")
                    requireNotNull(email)
                    VerifyEmailCodeChangeEmail(
                        email = email,
                        openUserProfile = {
                            navController.navigate("UserProfile")
                        }
                    )
                }

                composable(route = "changeBirthday") {
                    ChangeBirthday(
                        openUserProfile = {
                            navController.navigate("UserProfile")
                        },
                        backAction = {
                            navController.popBackStack()
                        }
                    )
                }

                composable(route = "changeCountry") {
                    ChangeCountry(
                        openUserProfile = {
                            navController.navigate("UserProfile")
                        },
                        backAction = {
                            navController.popBackStack()
                        }
                    )
                }

                composable(route = "changeFullname") {
                    ChangeFullname(
                        openUserProfile = {
                            navController.navigate("UserProfile")
                        },
                        backAction = {
                            navController.popBackStack()
                        }
                    )
                }

                composable(
                    route = "addFriend/{_id}/{fullname}/{profileImageUrl}",
                    deepLinks = listOf(
                        navDeepLink {
                            uriPattern =
                                "app://add.friend.skyline/{_id}/{fullname}/{profileImageUrl}"
                            action = Intent.ACTION_VIEW
                        }
                    ),
                    arguments = listOf(
                        navArgument("_id") {
                            type = NavType.StringType
                            defaultValue = "0"
                        },
                        navArgument("fullname") {
                            type = NavType.StringType
                            defaultValue = "Not Found"
                        },
                        navArgument("profileImageUrl") {
                            type = NavType.StringType
                            defaultValue = ""
                        }
                    )
                ) { navBackStackEntry ->
                    navBackStackEntry.arguments?.let { argument ->
                        val id = argument.getString("_id")!!
                        val name = argument.getString("fullname")!!
                        val image = argument.getString("profileImageUrl")!!
                        AddFriendScreen(
                            idOfFriend = id,
                            nameOfFriend = name,
                            urlOfFriend = image,
                            openUserProfile = {
                                navController.navigate("UserProfile")
                            },
                            openSignIn = {
                                navController.navigate("signInScreen")
                            }
                        )
                    }
                }
            }
        }
    }

    @Preview(showBackground = true)
    @Composable
    fun GreetingPreview() {
        SocialMediaTheme {

        }
    }

