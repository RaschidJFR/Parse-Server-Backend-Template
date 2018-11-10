// Don't forget to `npm install`
import * as Stripe from 'stripe';

// Don't forget to change also the puclic key on the client-side.
const STRIPE_PRIVATE_KEY = 'your_stripe_private_key';

// Transaction params
export const DEFAULT_PRICE = 99;
export const DEFAULT_CURRENCY = 'usd';
const DESCRIPTION = 'Premium Account';

export class Stripe {
	static chargeCard(token: string, email?: string) {
		console.log('charging card with token ', token);


		// Set your secret key: remember to change this to your live secret key in production
		// See your keys here: https://dashboard.stripe.com/account/apikeys
		const stripe = new Stripe(STRIPE_PRIVATE_KEY);

		// Token is created using Checkout or Elements!
		// Get the payment token ID submitted by the form:
		let chargeAmount = Math.floor(DEFAULT_PRICE * 100);
		return stripe.charges.create({
			amount: chargeAmount,
			currency: DEFAULT_CURRENCY,
			description: DESCRIPTION,
			source: token,
			// receipt_email: email
		}).then(response => {

			// Check response
			if (!response.paid) {
				throw 'Transaction failed, no charge has been made: ' + response.failure_message;
			}

			if (response.amount != chargeAmount || response.currency != DEFAULT_CURRENCY)
				throw `An incorrect amount or currency was charged: ${response.amount / 100} ${response.currency}`;

			return null;
		})
	}

	/**
	 * Defines cloud functions for stripe
	 */
	static initCloudFunctions() {

		/**
		 * Get default price
		 */
		Parse.Cloud.define('price', (request) => {
			return {
				price: DEFAULT_PRICE,
				currency: DEFAULT_CURRENCY
			};
		});
	}
}