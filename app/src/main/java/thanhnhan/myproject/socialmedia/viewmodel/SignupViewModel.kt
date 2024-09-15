package thanhnhan.myproject.socialmedia.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import thanhnhan.myproject.socialmedia.data.repository.SignupRepository
import thanhnhan.myproject.socialmedia.data.Result
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

    private val _countries = MutableStateFlow<Map<String, String>>(emptyMap())
    val countries: StateFlow<Map<String, String>> get() = _countries

    private val _selectedCountry = MutableStateFlow<Pair<String, String>?>(null)
    val selectedCountry: StateFlow<Pair<String, String>?> get() = _selectedCountry

    private fun setCountries(countryMap: Map<String, String>) {
        _countries.value = countryMap
    }

    fun selectCountry(name: String, code: String) {
        _selectedCountry.value = name to code
    }

    init {
        loadCountries()
    }

    private fun loadCountries() {
        viewModelScope.launch {
            val countryMap = mapOf(
                "Afghanistan" to "AFG",
                "Åland Islands" to "ALA",
                "Albania" to "ALB",
                "Algeria" to "DZA",
                "American Samoa" to "ASM",
                "Andorra" to "AND",
                "Angola" to "AGO",
                "Anguilla" to "AIA",
                "Antarctica" to "ATA",
                "Antigua and Barbuda" to "ATG",
                "Argentina" to "ARG",
                "Armenia" to "ARM",
                "Aruba" to "ABW",
                "Australia" to "AUS",
                "Austria" to "AUT",
                "Azerbaijan" to "AZE",
                "Bahamas" to "BHS",
                "Bahrain" to "BHR",
                "Bangladesh" to "BGD",
                "Barbados" to "BRB",
                "Belarus" to "BLR",
                "Belgium" to "BEL",
                "Belize" to "BLZ",
                "Benin" to "BEN",
                "Bermuda" to "BMU",
                "Bhutan" to "BTN",
                "Bolivia, Plurinational State of" to "BOL",
                "Bonaire, Sint Eustatius and Saba" to "BES",
                "Bosnia and Herzegovina" to "BIH",
                "Botswana" to "BWA",
                "Bouvet Island" to "BVT",
                "Brazil" to "BRA",
                "British Indian Ocean Territory" to "IOT",
                "Brunei Darussalam" to "BRN",
                "Bulgaria" to "BGR",
                "Burkina Faso" to "BFA",
                "Burundi" to "BDI",
                "Cabo Verde" to "CPV",
                "Cambodia" to "KHM",
                "Cameroon" to "CMR",
                "Canada" to "CAN",
                "Cayman Islands" to "CYM",
                "Central African Republic" to "CAF",
                "Chad" to "TCD",
                "Chile" to "CHL",
                "China" to "CHN",
                "Christmas Island" to "CXR",
                "Cocos (Keeling) Islands" to "CCK",
                "Colombia" to "COL",
                "Comoros" to "COM",
                "Congo" to "COG",
                "Congo, Democratic Republic of the" to "COD",
                "Cook Islands" to "COK",
                "Costa Rica" to "CRI",
                "Côte d'Ivoire" to "CIV",
                "Croatia" to "HRV",
                "Cuba" to "CUB",
                "Curaçao" to "CUW",
                "Cyprus" to "CYP",
                "Czechia" to "CZE",
                "Denmark" to "DNK",
                "Djibouti" to "DJI",
                "Dominica" to "DMA",
                "Dominican Republic" to "DOM",
                "Ecuador" to "ECU",
                "Egypt" to "EGY",
                "El Salvador" to "SLV",
                "Equatorial Guinea" to "GNQ",
                "Eritrea" to "ERI",
                "Estonia" to "EST",
                "Eswatini" to "SWZ",
                "Ethiopia" to "ETH",
                "Falkland Islands (Malvinas)" to "FLK",
                "Faroe Islands" to "FRO",
                "Fiji" to "FJI",
                "Finland" to "FIN",
                "France" to "FRA",
                "French Guiana" to "GUF",
                "French Polynesia" to "PYF",
                "French Southern Territories" to "ATF",
                "Gabon" to "GAB",
                "Gambia" to "GMB",
                "Georgia" to "GEO",
                "Germany" to "DEU",
                "Ghana" to "GHA",
                "Gibraltar" to "GIB",
                "Greece" to "GRC",
                "Greenland" to "GRL",
                "Grenada" to "GRD",
                "Guadeloupe" to "GLP",
                "Guam" to "GUM",
                "Guatemala" to "GTM",
                "Guernsey" to "GGY",
                "Guinea" to "GIN",
                "Guinea-Bissau" to "GNB",
                "Guyana" to "GUY",
                "Haiti" to "HTI",
                "Heard Island and McDonald Islands" to "HMD",
                "Holy See" to "VAT",
                "Honduras" to "HND",
                "Hong Kong" to "HKG",
                "Hungary" to "HUN",
                "Iceland" to "ISL",
                "India" to "IND",
                "Indonesia" to "IDN",
                "Iran, Islamic Republic of" to "IRN",
                "Iraq" to "IRQ",
                "Ireland" to "IRL",
                "Isle of Man" to "IMN",
                "Israel" to "ISR",
                "Italy" to "ITA",
                "Jamaica" to "JAM",
                "Japan" to "JPN",
                "Jersey" to "JEY",
                "Jordan" to "JOR",
                "Kazakhstan" to "KAZ",
                "Kenya" to "KEN",
                "Kiribati" to "KIR",
                "Korea, Democratic People's Republic of" to "PRK",
                "Korea, Republic of" to "KOR",
                "Kuwait" to "KWT",
                "Kyrgyzstan" to "KGZ",
                "Lao People's Democratic Republic" to "LAO",
                "Latvia" to "LVA",
                "Lebanon" to "LBN",
                "Lesotho" to "LSO",
                "Liberia" to "LBR",
                "Libya" to "LBY",
                "Liechtenstein" to "LIE",
                "Lithuania" to "LTU",
                "Luxembourg" to "LUX",
                "Macao" to "MAC",
                "Madagascar" to "MDG",
                "Malawi" to "MWI",
                "Malaysia" to "MYS",
                "Maldives" to "MDV",
                "Mali" to "MLI",
                "Malta" to "MLT",
                "Marshall Islands" to "MHL",
                "Martinique" to "MTQ",
                "Mauritania" to "MRT",
                "Mauritius" to "MUS",
                "Mayotte" to "MYT",
                "Mexico" to "MEX",
                "Micronesia, Federated States of" to "FSM",
                "Moldova, Republic of" to "MDA",
                "Monaco" to "MCO",
                "Mongolia" to "MNG",
                "Montenegro" to "MNE",
                "Montserrat" to "MSR",
                "Morocco" to "MAR",
                "Mozambique" to "MOZ",
                "Myanmar" to "MMR",
                "Namibia" to "NAM",
                "Nauru" to "NRU",
                "Nepal" to "NPL",
                "Netherlands, Kingdom of the" to "NLD",
                "New Caledonia" to "NCL",
                "New Zealand" to "NZL",
                "Nicaragua" to "NIC",
                "Niger" to "NER",
                "Nigeria" to "NGA",
                "Niue" to "NIU",
                "Norfolk Island" to "NFK",
                "North Macedonia" to "MKD",
                "Northern Mariana Islands" to "MNP",
                "Norway" to "NOR",
                "Oman" to "OMN",
                "Pakistan" to "PAK",
                "Palau" to "PLW",
                "Palestine, State of" to "PSE",
                "Panama" to "PAN",
                "Papua New Guinea" to "PNG",
                "Paraguay" to "PRY",
                "Peru" to "PER",
                "Philippines" to "PHL",
                "Pitcairn" to "PCN",
                "Poland" to "POL",
                "Portugal" to "PRT",
                "Puerto Rico" to "PRI",
                "Qatar" to "QAT",
                "Réunion" to "REU",
                "Romania" to "ROU",
                "Russian Federation" to "RUS",
                "Rwanda" to "RWA",
                "Saint Barthélemy" to "BLM",
                "Saint Helena, Ascension and Tristan da Cunha" to "SHN",
                "Saint Kitts and Nevis" to "KNA",
                "Saint Lucia" to "LCA",
                "Saint Martin (French part)" to "MAF",
                "Saint Pierre and Miquelon" to "SPM",
                "Saint Vincent and the Grenadines" to "VCT",
                "Samoa" to "WSM",
                "San Marino" to "SMR",
                "Sao Tome and Principe" to "STP",
                "Saudi Arabia" to "SAU",
                "Senegal" to "SEN",
                "Serbia" to "SRB",
                "Seychelles" to "SYC",
                "Sierra Leone" to "SLE",
                "Singapore" to "SGP",
                "Sint Maarten (Dutch part)" to "SXM",
                "Slovakia" to "SVK",
                "Slovenia" to "SVN",
                "Solomon Islands" to "SLB",
                "Somalia" to "SOM",
                "South Africa" to "ZAF",
                "South Georgia and the South Sandwich Islands" to "SGS",
                "South Sudan" to "SSD",
                "Spain" to "ESP",
                "Sri Lanka" to "LKA",
                "Sudan" to "SDN",
                "Suriname" to "SUR",
                "Svalbard and Jan Mayen" to "SJM",
                "Sweden" to "SWE",
                "Switzerland" to "CHE",
                "Syrian Arab Republic" to "SYR",
                "Taiwan, Province of China" to "TWN",
                "Tajikistan" to "TJK",
                "Tanzania, United Republic of" to "TZA",
                "Thailand" to "THA",
                "Timor-Leste" to "TLS",
                "Togo" to "TGO",
                "Tokelau" to "TKL",
                "Tonga" to "TON",
                "Trinidad and Tobago" to "TTO",
                "Tunisia" to "TUN",
                "Türkiye" to "TUR",
                "Turkmenistan" to "TKM",
                "Turks and Caicos Islands" to "TCA",
                "Tuvalu" to "TUV",
                "Uganda" to "UGA",
                "Ukraine" to "UKR",
                "United Arab Emirates" to "ARE",
                "United Kingdom of Great Britain and Northern Ireland" to "GBR",
                "United States of America" to "USA",
                "United States Minor Outlying Islands" to "UMI",
                "Uruguay" to "URY",
                "Uzbekistan" to "UZB",
                "Vanuatu" to "VUT",
                "Venezuela, Bolivarian Republic of" to "VEN",
                "Viet Nam" to "VNM",
                "Virgin Islands (British)" to "VGB",
                "Virgin Islands (U.S.)" to "VIR",
                "Wallis and Futuna" to "WLF",
                "Western Sahara" to "ESH",
                "Yemen" to "YEM",
                "Zambia" to "ZMB",
                "Zimbabwe" to "ZWE"
            )

            setCountries(countryMap)
        }
    }

}
