// Don't forget to `npm install`
import * as xml2js from 'xml2js';
import * as request from 'request';

export class Currency {

	/**
	 * Returns XML file for euro rates from ecb.europa.eu
	 */
	private static getEuroXML(): Promise<string> {
		return new Promise((resolve, reject) => {

			const options = {
				method: 'GET',
				url: 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml',
			};

			request(options, function (error, response, body) {
				if (error) {
					reject(error);
					return;
				} else {
					resolve(body);
				}
			});
		});
	}

	static getCurrencyList(): Promise<any> {
		return this.getEuroXML()
			.then(data => {

				return new Promise((resolve, reject) => {
					xml2js.parseString(data, (err, result) => {

						// Error
						if (err) {
							reject(err);
							return;
						}

						// Extract all availble Euro rates in XML
						let rates = {};
						try {
							// According to thie specific XML's structure
							const dataArr = result['gesmes:Envelope']['Cube'][0]['Cube'][0]['Cube'];

							dataArr.forEach(element => {
								const curr = element['$'].currency;
								const val = parseFloat(element['$'].rate);
								rates[curr] = val;
							});

							rates['EUR'] = 1;

						} catch (e) {
							console.error('Format error in XML!');
							reject(e);
							return;
						}

						resolve(rates);
					});
				})

			})
	}

	/**
	 * Defines cloud functions for Currency module
	 */
	static initCloudFunctions() {
		/**
		 * Get today's currency exchange rate for EURO.
		 * @param request.user User must be logged in to call this function.
		 * @returns any[] Associative array for daily currency rates
		 */
		Parse.Cloud.define('currencies', (request) => {

			return Currency.getCurrencyList()
				.then(rates => {
					return (rates);
				})
				.catch(error => {
					console.error(error);
					let rates = {};
					rates['EUR'] = 1;
					return (rates);
				});
		});
	}
}