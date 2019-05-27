// Don't forget to `npm install`
import * as xml2js from 'xml2js';
import * as request from 'request';

interface IRates {
	[currency: string]: number
}

export class Currency {

	static rates: IRates;

	/**
	 * Gets exchange rates from the European Central Bank.
	 * This method should be temporary as the request to the site are limited.
	 */
	static getCurrencyRates(): Promise<IRates> {
		return this.getXML()
			.then(data => {

				return new Promise<IRates>((resolve, reject) => {
					xml2js.parseString(data, (err, result) => {

						// Error
						if (err) {
							reject(err);
							return;
						}

						// Extract all availble Euro rates in XML
						this.rates = { EUR: 1 };
						try {
							// According to thie specific XML's structure
							const dataArr = result['gesmes:Envelope']['Cube'][0]['Cube'][0]['Cube'];

							dataArr.forEach(element => {
								const curr = element['$'].currency;
								this.rates[curr] = parseFloat(element['$'].rate);
							});

						} catch (e) {
							console.error('Format error in XML!');
							reject(e);
							return;
						}

						resolve(this.rates);
					});
				})

			})
	}

	/**
	 * Returns XML file for euro rates from ecb.europa.eu
	 */
	private static getXML(): Promise<string> {
		return new Promise((resolve, reject) => {

			const options = {
				method: 'GET',
				url: 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml'
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

	/**
   * Converts USD to target currency.
   * @param amountInUSD Amount in USD
   * @param to Currency to convert to. Current will be used as default.
   */
	static convertCurrency(amountInUSD: number, to: string) {
		const rate = this.getRate('USD', to);
		const converted = amountInUSD * rate;
		return converted;
	}

	/**
	* Converts USD to target currency.
	* @param amountInLocalCurrency Amount in USD
	* @param from Currency to convert to. Current will be used as default.
	*/
	static convertToUSD(amountInLocalCurrency: number, from: string) {
		const rate = this.getRate(from, 'USD');
		const converted = amountInLocalCurrency * rate;
		return converted;
	}

	static getRate(from: string, to: string) {
		const FROMEUR = this.rates[from];
		const TOEUR = this.rates[to];
		return TOEUR / FROMEUR;
	}
}