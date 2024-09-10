package thanhnhan.myproject.socialmedia.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import thanhnhan.myproject.socialmedia.data.repository.SignupRepository
import thanhnhan.myproject.socialmedia.data.Result
import thanhnhan.myproject.socialmedia.data.model.Country
import thanhnhan.myproject.socialmedia.data.model.SignUpRequest
import java.util.regex.Pattern


class SignupViewModel(
    private val signUpRepository: SignupRepository
) : ViewModel() {

    // Check email format
    private val _emailValidationResult = MutableStateFlow<Boolean?>(null)
    val emailValidationResult: StateFlow<Boolean?> get() = _emailValidationResult

    fun checkEmailFormat(email: String) {
        viewModelScope.launch {
            val isValid = isValidEmail(email)
            _emailValidationResult.value = isValid
        }
    }

    private fun isValidEmail(email: String): Boolean {
        val emailPattern = "[a-zA-Z0-9._-]+@[a-z]+\\.+[a-z]+"
        return Pattern.compile(emailPattern).matcher(email).matches()
    }

    // Check if a string has exactly 6 characters
    private val _stringValidationResult = MutableStateFlow<Boolean?>(null)
    val stringValidationResult: StateFlow<Boolean?> get() = this._stringValidationResult

    fun checkString(input: String) {
        viewModelScope.launch {
            val isStringValid = isStringValid(input)
            this@SignupViewModel._stringValidationResult.value = isStringValid
        }
    }

    private fun isStringValid(input: String): Boolean {
        // Kiểm tra chuỗi có đúng 6 số hay không
        val regex = Regex("^\\d{6}$")
        return regex.matches(input)
    }

    // Check password format
    private val _passwordValidationResult = MutableStateFlow<Boolean?>(null)
    val passwordValidationResult: StateFlow<Boolean?> get() = _passwordValidationResult

    fun checkPassword(password: String) {
        viewModelScope.launch {
            val isValid = isPasswordValid(password)
            _passwordValidationResult.value = isValid
        }
    }

    private fun isPasswordValid(password: String): Boolean {
        // Kiểm tra độ dài ít nhất 8 ký tự
        if (password.length < 8) return false

        // Kiểm tra có ký tự in hoa
        val hasUpperCase = password.any { it.isUpperCase() }
        // Kiểm tra có ký tự thường
        val hasLowerCase = password.any { it.isLowerCase() }
        // Kiểm tra có số
        val hasDigit = password.any { it.isDigit() }
        // Kiểm tra có ký tự đặc biệt
        val specialCharacters = "!@#$%^&*()-_=+[{]}|;:'\",<.>/?`~"
        val hasSpecialCharacter = password.any { it in specialCharacters }

        return hasUpperCase && hasLowerCase && hasDigit && hasSpecialCharacter
    }

    //Check email
    private val _emailCheckResult = MutableStateFlow<Result<String>?>(null)
    val emailCheckResult: StateFlow<Result<String>?> = _emailCheckResult

    fun checkEmail(email: String) {
        viewModelScope.launch {
            signUpRepository.checkEmail(email).collect {
                _emailCheckResult.value = it
            }
        }
    }

    // Create account
    private val _signUpResult = MutableStateFlow<Result<String>?>(null)
    val signUpResult: StateFlow<Result<String>?> = _signUpResult

    fun signUp(code: Int, email: String, fullname: String, password: String, country: String, birthday: String) {
        viewModelScope.launch {
            val signUpRequest = SignUpRequest(code, email, fullname, password, country, birthday)
            signUpRepository.signUp(signUpRequest).collect {
                _signUpResult.value = it
            }
        }
    }

    // Choose country
    private val _countries = MutableStateFlow<List<Country>>(emptyList())
    val countries: StateFlow<List<Country>> get() = _countries

    private val _selectedCountry = MutableStateFlow<Country?>(null)
    val selectedCountry: StateFlow<Country?> get() = _selectedCountry

    init {
        loadCountries()
    }

    private fun loadCountries() {
        viewModelScope.launch {
            val countryList = listOf(
                Country("Afghanistan", "AFG"),
                Country("Åland Islands", "ALA"),
                Country("Albania", "ALB"),
                Country("Algeria", "DZA"),
                Country("American Samoa", "ASM"),
                Country("Andorra", "AND"),
                Country("Angola", "AGO"),
                Country("Anguilla", "AIA"),
                Country("Antarctica", "ATA"),
                Country("Antigua and Barbuda", "ATG"),
                Country("Argentina", "ARG"),
                Country("Armenia", "ARM"),
                Country("Aruba", "ABW"),
                Country("Australia", "AUS"),
                Country("Austria", "AUT"),
                Country("Azerbaijan", "AZE"),
                Country("Bahamas", "BHS"),
                Country("Bahrain", "BHR"),
                Country("Bangladesh", "BGD"),
                Country("Barbados", "BRB"),
                Country("Belarus", "BLR"),
                Country("Belgium", "BEL"),
                Country("Belize", "BLZ"),
                Country("Benin", "BEN"),
                Country("Bermuda", "BMU"),
                Country("Bhutan", "BTN"),
                Country("Bolivia, Plurinational State of", "BOL"),
                Country("Bonaire, Sint Eustatius and Saba", "BES"),
                Country("Bosnia and Herzegovina", "BIH"),
                Country("Botswana", "BWA"),
                Country("Bouvet Island", "BVT"),
                Country("Brazil", "BRA"),
                Country("British Indian Ocean Territory", "IOT"),
                Country("Brunei Darussalam", "BRN"),
                Country("Bulgaria", "BGR"),
                Country("Burkina Faso", "BFA"),
                Country("Burundi", "BDI"),
                Country("Cabo Verde", "CPV"),
                Country("Cambodia", "KHM"),
                Country("Cameroon", "CMR"),
                Country("Canada", "CAN"),
                Country("Cayman Islands", "CYM"),
                Country("Central African Republic", "CAF"),
                Country("Chad", "TCD"),
                Country("Chile", "CHL"),
                Country("China", "CHN"),
                Country("Christmas Island", "CXR"),
                Country("Cocos (Keeling) Islands", "CCK"),
                Country("Colombia", "COL"),
                Country("Comoros", "COM"),
                Country("Congo", "COG"),
                Country("Congo, Democratic Republic of the", "COD"),
                Country("Cook Islands", "COK"),
                Country("Costa Rica", "CRI"),
                Country("Côte d'Ivoire", "CIV"),
                Country("Croatia", "HRV"),
                Country("Cuba", "CUB"),
                Country("Curaçao", "CUW"),
                Country("Cyprus", "CYP"),
                Country("Czechia", "CZE"),
                Country("Denmark", "DNK"),
                Country("Djibouti", "DJI"),
                Country("Dominica", "DMA"),
                Country("Dominican Republic", "DOM"),
                Country("Ecuador", "ECU"),
                Country("Egypt", "EGY"),
                Country("El Salvador", "SLV"),
                Country("Equatorial Guinea", "GNQ"),
                Country("Eritrea", "ERI"),
                Country("Estonia", "EST"),
                Country("Eswatini", "SWZ"),
                Country("Ethiopia", "ETH"),
                Country("Falkland Islands (Malvinas)", "FLK"),
                Country("Faroe Islands", "FRO"),
                Country("Fiji", "FJI"),
                Country("Finland", "FIN"),
                Country("France", "FRA"),
                Country("French Guiana", "GUF"),
                Country("French Polynesia", "PYF"),
                Country("French Southern Territories", "ATF"),
                Country("Gabon", "GAB"),
                Country("Gambia", "GMB"),
                Country("Georgia", "GEO"),
                Country("Germany", "DEU"),
                Country("Ghana", "GHA"),
                Country("Gibraltar", "GIB"),
                Country("Greece", "GRC"),
                Country("Greenland", "GRL"),
                Country("Grenada", "GRD"),
                Country("Guadeloupe", "GLP"),
                Country("Guam", "GUM"),
                Country("Guatemala", "GTM"),
                Country("Guernsey", "GGY"),
                Country("Guinea", "GIN"),
                Country("Guinea-Bissau", "GNB"),
                Country("Guyana", "GUY"),
                Country("Haiti", "HTI"),
                Country("Heard Island and McDonald Islands", "HMD"),
                Country("Holy See", "VAT"),
                Country("Honduras", "HND"),
                Country("Hong Kong", "HKG"),
                Country("Hungary", "HUN"),
                Country("Iceland", "ISL"),
                Country("India", "IND"),
                Country("Indonesia", "IDN"),
                Country("Iran, Islamic Republic of", "IRN"),
                Country("Iraq", "IRQ"),
                Country("Ireland", "IRL"),
                Country("Isle of Man", "IMN"),
                Country("Israel", "ISR"),
                Country("Italy", "ITA"),
                Country("Jamaica", "JAM"),
                Country("Japan", "JPN"),
                Country("Jersey", "JEY"),
                Country("Jordan", "JOR"),
                Country("Kazakhstan", "KAZ"),
                Country("Kenya", "KEN"),
                Country("Kiribati", "KIR"),
                Country("Korea, Democratic People's Republic of", "PRK"),
                Country("Korea, Republic of", "KOR"),
                Country("Kuwait", "KWT"),
                Country("Kyrgyzstan", "KGZ"),
                Country("Lao People's Democratic Republic", "LAO"),
                Country("Latvia", "LVA"),
                Country("Lebanon", "LBN"),
                Country("Lesotho", "LSO"),
                Country("Liberia", "LBR"),
                Country("Libya", "LBY"),
                Country("Liechtenstein", "LIE"),
                Country("Lithuania", "LTU"),
                Country("Luxembourg", "LUX"),
                Country("Macao", "MAC"),
                Country("Madagascar", "MDG"),
                Country("Malawi", "MWI"),
                Country("Malaysia", "MYS"),
                Country("Maldives", "MDV"),
                Country("Mali", "MLI"),
                Country("Malta", "MLT"),
                Country("Marshall Islands", "MHL"),
                Country("Martinique", "MTQ"),
                Country("Mauritania", "MRT"),
                Country("Mauritius", "MUS"),
                Country("Mayotte", "MYT"),
                Country("Mexico", "MEX"),
                Country("Micronesia, Federated States of", "FSM"),
                Country("Moldova, Republic of", "MDA"),
                Country("Monaco", "MCO"),
                Country("Mongolia", "MNG"),
                Country("Montenegro", "MNE"),
                Country("Montserrat", "MSR"),
                Country("Morocco", "MAR"),
                Country("Mozambique", "MOZ"),
                Country("Myanmar", "MMR"),
                Country("Namibia", "NAM"),
                Country("Nauru", "NRU"),
                Country("Nepal", "NPL"),
                Country("Netherlands, Kingdom of the", "NLD"),
                Country("New Caledonia", "NCL"),
                Country("New Zealand", "NZL"),
                Country("Nicaragua", "NIC"),
                Country("Niger", "NER"),
                Country("Nigeria", "NGA"),
                Country("Niue", "NIU"),
                Country("Norfolk Island", "NFK"),
                Country("North Macedonia", "MKD"),
                Country("Northern Mariana Islands", "MNP"),
                Country("Norway", "NOR"),
                Country("Oman", "OMN"),
                Country("Pakistan", "PAK"),
                Country("Palau", "PLW"),
                Country("Palestine, State of", "PSE"),
                Country("Panama", "PAN"),
                Country("Papua New Guinea", "PNG"),
                Country("Paraguay", "PRY"),
                Country("Peru", "PER"),
                Country("Philippines", "PHL"),
                Country("Pitcairn", "PCN"),
                Country("Poland", "POL"),
                Country("Portugal", "PRT"),
                Country("Puerto Rico", "PRI"),
                Country("Qatar", "QAT"),
                Country("Réunion", "REU"),
                Country("Romania", "ROU"),
                Country("Russian Federation", "RUS"),
                Country("Rwanda", "RWA"),
                Country("Saint Barthélemy", "BLM"),
                Country("Saint Helena, Ascension and Tristan da Cunha", "SHN"),
                Country("Saint Kitts and Nevis", "KNA"),
                Country("Saint Lucia", "LCA"),
                Country("Saint Martin (French part)", "MAF"),
                Country("Saint Pierre and Miquelon", "SPM"),
                Country("Saint Vincent and the Grenadines", "VCT"),
                Country("Samoa", "WSM"),
                Country("San Marino", "SMR"),
                Country("Sao Tome and Principe", "STP"),
                Country("Saudi Arabia", "SAU"),
                Country("Senegal", "SEN"),
                Country("Serbia", "SRB"),
                Country("Seychelles", "SYC"),
                Country("Sierra Leone", "SLE"),
                Country("Singapore", "SGP"),
                Country("Sint Maarten (Dutch part)", "SXM"),
                Country("Slovakia", "SVK"),
                Country("Slovenia", "SVN"),
                Country("Solomon Islands", "SLB"),
                Country("Somalia", "SOM"),
                Country("South Africa", "ZAF"),
                Country("South Georgia and the South Sandwich Islands", "SGS"),
                Country("South Sudan", "SSD"),
                Country("Spain", "ESP"),
                Country("Sri Lanka", "LKA"),
                Country("Sudan", "SDN"),
                Country("Suriname", "SUR"),
                Country("Svalbard and Jan Mayen", "SJM"),
                Country("Sweden", "SWE"),
                Country("Switzerland", "CHE"),
                Country("Syrian Arab Republic", "SYR"),
                Country("Taiwan, Province of China", "TWN"),
                Country("Tajikistan", "TJK"),
                Country("Tanzania, United Republic of", "TZA"),
                Country("Thailand", "THA"),
                Country("Timor-Leste", "TLS"),
                Country("Togo", "TGO"),
                Country("Tokelau", "TKL"),
                Country("Tonga", "TON"),
                Country("Trinidad and Tobago", "TTO"),
                Country("Tunisia", "TUN"),
                Country("Türkiye", "TUR"),
                Country("Turkmenistan", "TKM"),
                Country("Turks and Caicos Islands", "TCA"),
                Country("Tuvalu", "TUV"),
                Country("Uganda", "UGA"),
                Country("Ukraine", "UKR"),
                Country("United Arab Emirates", "ARE"),
                Country("United Kingdom of Great Britain and Northern Ireland", "GBR"),
                Country("United States of America", "USA"),
                Country("United States Minor Outlying Islands", "UMI"),
                Country("Uruguay", "URY"),
                Country("Uzbekistan", "UZB"),
                Country("Vanuatu", "VUT"),
                Country("Venezuela, Bolivarian Republic of", "VEN"),
                Country("Viet Nam", "VNM"),
                Country("Virgin Islands (British)", "VGB"),
                Country("Virgin Islands (U.S.)", "VIR"),
                Country("Wallis and Futuna", "WLF"),
                Country("Western Sahara", "ESH"),
                Country("Yemen", "YEM"),
                Country("Zambia", "ZMB"),
                Country("Zimbabwe", "ZWE")
            )

            _countries.value = countryList
        }
    }

    fun selectCountry(country: Country) {
        _selectedCountry.value = country
    }
}
