/* global module */
/* global require */

/**
 * ## [i18n-iso-countries](https://www.npmjs.com/package/i18n-iso-countries) ##
 * i18n for ISO 3166-1 country codes. We support Alpha-2, Alpha-3 and Numeric codes from http://en.wikipedia.org/wiki/ISO_3166-1#Officially_assigned_code_elements.
 */
const i18nCountries = require("i18n-iso-countries");
i18nCountries.registerLocale(require("i18n-iso-countries/langs/en.json"));

const allCountries = [
	"Afghanistan",
	"Albania",
	"Algeria",
	"Andorra",
	"Angola",
	"Antigua and Barbuda",
	"Argentina",
	"Armenia",
	"Australia",
	"Austria",
	"Azerbaijan",
	"Bahamas",
	"Bahrain",
	"Bangladesh",
	"Barbados",
	"Belarus",
	"Belgium",
	"Belize",
	"Benin",
	"Bhutan",
	"Bolivia",
	"Bosnia and Herzegovina",
	"Botswana",
	"Brazil",
	"Brunei Darussalam",
	"Bulgaria",
	"Burkina Faso",
	"Burma",
	"Burundi",
	"Cambodia",
	"Cameroon",
	"Canada",
	"Cape Verde",
	"Central African Republic",
	"Chad",
	"Chile",
	"China",
	"Colombia",
	"Comoros",
	"Congo (Brazzaville)",
	"Congo, (Kinshasa)",
	"Costa Rica",
	"Croatia",
	"Cuba",
	"Cyprus",
	"Czech Republic",
	"Danzig",
	"Denmark",
	"Djibouti",
	"Dominica",
	"Dominican Republic",
	"Timor-Leste",
	"Ecuador",
	"Egypt",
	"El Salvador",
	"Equatorial Guinea",
	"Eritrea",
	"Estonia",
	"Ethiopia",
	"Fiji",
	"Finland",
	"France",
	"Gabon",
	"Gaza Strip",
	"Gambia",
	"Georgia",
	"Germany",
	"Ghana",
	"Greece",
	"Grenada",
	"Guatemala",
	"Guinea",
	"Guinea-Bissau",
	"Guyana",
	"Haiti",
	"Honduras",
	"Hong Kong",
	"Hungary",
	"Iceland",
	"India",
	"Indonesia",
	"Islamic Republic of Iran",
	"Iraq",
	"Ireland",
	"Israel",
	"Italy",
	"Ivory Coast",
	"Jamaica",
	"Japan",
	"Jonathanland",
	"Jordan",
	"Kazakhstan",
	"Kenya",
	"Kiribati",
	"North Korea",
	"South Korea",
	"Kosovo",
	"Kuwait",
	"Kyrgyzstan",
	"Laos",
	"Latvia",
	"Lebanon",
	"Lesotho",
	"Liberia",
	"Libya",
	"Liechtenstein",
	"Lithuania",
	"Luxembourg",
	"Republic of Macedonia",
	"Madagascar",
	"Malawi",
	"Malaysia",
	"Maldives",
	"Mali",
	"Malta",
	"Marshall Islands",
	"Mauritania",
	"Namibia",
	"Netherlands",
	"New Zealand",
	"Nicaragua",
	"Niger",
	"Nigeria",
	"Norway",
	"Oman",
	"Pakistan",
	"Palau",
	"Panama",
	"Papua New Guinea",
	"Paraguay",
	"Peru",
	"Philippines",
	"Poland",
	"Portugal",
	"Qatar",
	"Romania",
	"Russian Federation",
	"Rwanda",
	"Samoa",
	"San Marino",
	"Saudi Arabia",
	"Senegal",
	"Serbia",
	"Seychelles",
	"Sierra Leone",
	"Singapore",
	"Slovakia",
	"Slovenia",
	"Solomon Islands",
	"Somalia",
	"South Africa",
	"Spain",
	"Sri Lanka",
	"Sudan",
	"Swaziland",
	"Sweden",
	"Switzerland",
	"Syrian Arab Republic,",
	"Tajikistan",
	"United Republic of Tanzania",
	"Thailand",
	"Togo",
	"Tonga",
	"Trinidad and Tobago",
	"Tunisia",
	"Turkey",
	"Turkmenistan",
	"Tuvalu",
	"Uganda",
	"Ukraine",
	"United Arab Emirates",
	"United Kingdom",
	"United States of America",
	"Uruguay",
	"Uzbekistan",
	"Vanuatu",
	"Vatican",
	"Venezuela",
	"Viet Nam",
	"Yemen",
	"Zambia",
	"Zimbabwe"
];

const countriesRegion2 = [
	"Chile",
	"United Arab Emirates",
	"New Zealand",
	"Philippines",
	"South Africa",
	"Singapore",
	"Sweden",
	"Switzerland",
	"Australia",
	"Czech Republic",
	"Brazil",
	"Norway",
	"South Korea",
	"Hong Kong",
	"Denmark",
	"Greece",
	"Croatia"
];

const countriesRegion3 = [
	"Andorra",
	"Austria",
	"Belgium",
	"Finland",
	"France",
	"Germany",
	"Greece",
	"Republic of Ireland",
	"Italy",
	"Kosovo",
	"Latvia",
	"Luxembourg",
	"Netherlands",
	"Portugal",
	"Slovakia",
	"Slovenia",
	"Spain",
	"United Kingdom",
	"Canada",
	"Israel",
	"India",
	"Republic of China"
];

const countriesRegion4 = ['United States of America'];

// Export an array of countries with their alpha 2 codes and region capitalization.
let countryList = [];
allCountries.forEach(countryName => {
	let code = i18nCountries.getAlpha2Code(countryName, "en");
	countryList.push({
		name: countryName,
		code: code || countryName
	});

	if (!code) console.warn('No iso alpha-2 code found for %o', countryName);
});
countryList.sort((a, b) => {
	if (a.name > b.name)
		return 1;
	else if (a.name < b.name)
		return -1;
	else
		return 0;
});

/**
 * Return grading levels in USD for 6 core values of the business according to its hosting country.
 * @param {string} countryNameOrCode Country name or alpha2 iso code.
 */
function getGradingLevels(countryNameOrCode) {
	const countryName = i18nCountries.getName(countryNameOrCode, "en");
	console.log(`Get grading levels for ${countryNameOrCode} -> ${countryName}`);

	let foundInRegionTwo = countriesRegion2.find(element => {
		return element.toLowerCase() == countryNameOrCode.toLowerCase() || countryName == element.toLowerCase();
	});

	// The country has been found in Region 2 list
	if (foundInRegionTwo) {
		return {
			ideaPotential: 62661,
			team: 68294,
			marketValidation: 64130,
			progress: 70065,
			salesTraction: 67996,
			salesPipeline: 101502,
		}
	}

	let foundInRegionThree = countriesRegion3.find(element => {
		return element.toLowerCase() == countryNameOrCode.toLowerCase() || countryName.toLowerCase() == element.toLowerCase();
	});

	// The country has been found in region 3 list
	if (foundInRegionThree) {
		return {
			ideaPotential: 97904,
			team: 91522,
			marketValidation: 90670,
			progress: 92471,
			salesTraction: 95316,
			salesPipeline: 133824,
		}
	}

	let foundInRegionFour = countriesRegion4.find(element => {
		return element.toLowerCase() == countryNameOrCode.toLowerCase() || countryName.toLowerCase() == element.toLowerCase();
	});

	// The country has been found in region 3 list
	if (foundInRegionFour) {
		return {
			ideaPotential: 129415,
			team: 132785,
			marketValidation: 134799,
			progress: 136955,
			salesTraction: 133596,
			salesPipeline: 201410,
		}
	}

	let foundInGeneralRegion = allCountries.find(element => {
		return element.toLowerCase() == countryNameOrCode.toLowerCase() || countryName.toLowerCase() == element.toLowerCase();
	});

	// The country has been found in general list
	if (foundInGeneralRegion) {
		return {
			ideaPotential: 44395,
			team: 45604,
			marketValidation: 48744,
			progress: 49243,
			salesTraction: 47034,
			salesPipeline: 65723,
		}
	}

	// The country wasn't found in any list.
	console.warn(`The country ${countryNameOrCode} was not found in any list. Returning default values for general region.`);
	return {
		ideaPotential: 44395,
		team: 45604,
		marketValidation: 48744,
		progress: 49243,
		salesTraction: 47034,
		salesPipeline: 65723,
	}
}

module.exports = {
	countryList: countryList,
	getGradingLevels: getGradingLevels
}