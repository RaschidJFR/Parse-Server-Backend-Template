// Don't forget to `npm install`
import * as Stripe from 'stripe';
let stripe: Stripe;

// Transaction params
export let SECRET_KEY = 'test_something';
export let DEFAULT_CURRENCY = 'gbp'; //lowercase
export let DEFAULT_CHARGE_DESCRIPTION = 'Stripe Test';

export class Payment {

  /**
	 * Charge a card for a fixed amount
	 */
  static async chargeCard(params:
    {
      /** In mayor currency units (not cents) */
      amount: number,
      /** In lower case */
      currency?: string,
      /** Customer's ID in Stripe */
      customerId?: string,
      /** Customer's email */
      email?: string,
      /** Card's token generated from Stripe Checkout */
      token: string,
    }
  ): Promise<string> {
    this.checkInited();

    const chargeParams: Stripe.charges.IChargeCreationOptions = {
      amount: params.amount * 100,
      currency: params.currency || DEFAULT_CURRENCY,
      description: DEFAULT_CHARGE_DESCRIPTION,
      receipt_email: params.email,
    };

    // Associate card with customer
    if (params.customerId) {
      await stripe.customers.update(params.customerId, { source: params.token });
      chargeParams.customer = params.customerId;
    }

    const response = await stripe.charges.create(chargeParams);

    // Check response
    if (!response.paid) {
      throw new Error('Transaction failed, no charge has been made: ' + response.failure_message);
    }

    return response.receipt_url;
  }

  private static checkInited() {
    if (!stripe) throw `Payment module not inited. Call Payment.init().`;
  }

  /**
	 * Creates a customer on Stripe
	 * @returns The new customer's id
	 */
  static async createCustomer(params:
    {
      address?: Stripe.IAddress,
      email: string,
      name: string,
      /** Card's token generated from Stripe Checkout */
      source: string,
    }
  ): Promise<string> {
    this.checkInited();
    const customer = await stripe.customers.create({
      address: params.address,
      email: params.email,
      name: params.name,
      source: params.source
    });
    return customer.id;
  }

  /**
	 * @param limit Betweem 1 and 100
	 * @param startingAfterId ID of the last charge to skip
	 */
  static async getChargeHistory(customerId: string, limit?: number, startingAfterId?: string) {
    const options: Stripe.charges.IChargeListOptions = {
      customer: customerId,
      limit,
      starting_after: startingAfterId,
      expand: ['data.invoice']
    }
    return stripe.charges.list(options);
  }

  /**
	 * Retrieve a customer ID from Stripe
	 */
  static async getCustomerIdByEmail(email: string) {
    const customers = await stripe.customers.list({ email });
    return customers.data[0] && customers.data[0].id;
  }

  /**
	 * Retrieve selected plans from Stripe.
	 * Result order may differ from parameters'.
	 */
  static async getPlans(planIds?: string[]) {
    const result = await stripe.plans.list();
    const plans = result.data;
    if (planIds)
      return plans.filter(p => planIds.includes(p.id));
    else
      return plans;
  }

  /**
	 * Call this before any other function for this module
	 */
  static init(params: {
    defaultChargeDescription: string
    defaultCurrency: string,
    secretKey: string,
  }) {
    DEFAULT_CURRENCY = params && params.defaultCurrency && params.defaultCurrency.toLowerCase() || 'usd';
    DEFAULT_CHARGE_DESCRIPTION = params.defaultChargeDescription || 'Stripe Test';
    SECRET_KEY = params.secretKey;
    stripe = new Stripe(SECRET_KEY);
  }


  static async isCustomerSubscribed(customerId: string, planId?: string): Promise<boolean> {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      plan: planId
    });

    return !!subscriptions.data.length;
  }

  /**
	 * Charges a client's credit card and starts a paid subscription.
	 * @returns Invoice url
	 */
  static async startSubscription(
    params:
      {
        /** Customer's ID in Stripe */
        customerId: string,
        /** Plan's ID in Stripe */
        planId: string,
        quantity?: number,
      }) {
    this.checkInited();
    const item: Stripe.subscriptions.ISubscriptionCreationItem = { plan: params.planId, quantity: params.quantity };
    const subscription = await stripe.subscriptions.create({
      customer: params.customerId,
      items: [item]
    });
    const invoiceID = subscription.latest_invoice as unknown as string;
    const invoice = await stripe.invoices.retrieve(invoiceID);

    return {
      id: subscription.id,
      invoice: invoice.hosted_invoice_url
    }
  }

  /**
	 * Update a customer on Stripe (but not their credit card info is it updates on making a charge with `Payment.chargeCard()`
	 */
  static async updateCustomer(customerId: string, attributes: Stripe.customers.ICustomerUpdateOptions): Promise<void> {
    this.checkInited();
    const cpyAttr = Object.assign({}, attributes);
    if (cpyAttr.source) delete cpyAttr.source;
    await stripe.customers.update(customerId, cpyAttr);
  }
}
