/* global require */
/* global Parse */
const Countries = require('./countries.js');

/**
 * Returns the available country list as an array of objects with name/code pair.
 */
Parse.Cloud.define('countries', function (request, response) {
	response.success(Countries.countryList);
});

/**
 * Returns valuation of a deal in USD according to the country and core values provided.
 */
Parse.Cloud.define('valuator', function (request, response) {
	const country = request.params.country;
	if (!country) {
		response.error(`Missing parameter 'country'`);
		return;
	}
	const levels = Countries.getGradingLevels(country);
	
	const deal = request.params.deal;
	let sum = 0;
	for (let coreValue in levels) {
		const gradingLevel = levels[coreValue];
		const value = deal[coreValue];

		if (!value) {
			response.error(`Missing parameter '${coreValue}'`);
			return;
		}

		sum += value * gradingLevel;
	}
	response.success(sum);
});