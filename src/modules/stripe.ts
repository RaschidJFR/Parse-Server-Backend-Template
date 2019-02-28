// Don't forget to `npm install`
import * as Stripe from 'stripe';


//============= SET PARAMETERS IN THIS SECTIONS ====================

// Don't forget to change also the puclic key on the client-side.
const STRIPE_PRIVATE_KEY = 'your_stripe_private_key';

// Created on Stripe's [account dashboard](https://stripe.com/docs/billing/subscriptions/products-and-plans)
const DEFAULT_SUBSCRIPTION_PLAN_ID = 'plan_something';

// Set your secret key: remember to change this to your live secret key in production
// See your keys here: https://dashboard.stripe.com/account/apikeys
const stripe = new Stripe(STRIPE_PRIVATE_KEY);

// Transaction params
export let DEFAULT_PRICE = 99;
export let DEFAULT_CURRENCY = 'usd'; //lowercase
export let DEFAULT_BILLING_INTERVAL =  'month';
const DEFAULT_CHARGE_DESCRIPTION = 'Stripe Test';

//===================================================================



// Get default subscription values on server start
stripe.plans.retrieve(DEFAULT_SUBSCRIPTION_PLAN_ID).then(plan => {
	DEFAULT_PRICE = plan.amount;
	DEFAULT_CURRENCY = plan.currency;
	DEFAULT_BILLING_INTERVAL = plan.interval;
});

export class Payment {

	/**
	 * Charges a client's credit card and starts a paid subscription.
	 * @param tokenId Token received from web client
	 * @param email customer's email
	 * @param company customer's company
	 */
	static startSubscription(tokenId: string, email?: string, company?: string) {

		return stripe.customers.create({
			source: tokenId,
			email: email,
			description: company,
			plan: DEFAULT_SUBSCRIPTION_PLAN_ID
		});
	}

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
			description: DEFAULT_CHARGE_DESCRIPTION,
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