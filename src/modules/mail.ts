import * as Mailgun from 'mailgun-js';

const MAILGUN_API_KEY = '***REMOVED***';				// Your mailgun key
const DOMAIN = 'sandbox0f96fca143fa4e1b9de6d3ac78d75527.mailgun.org';						// Your domain registered on mailgun
const FROM = 'D-RiskIt <postmaster@sandbox0f96fca143fa4e1b9de6d3ac78d75527.mailgun.org>';	// Your company 'from' email

export function sendEmail(params: { to: string, subject: string, html: string }): Promise<any> {
	console.log('Sending email to ', params.to);

	const mailgun: Mailgun.Mailgun = Mailgun({ apiKey: MAILGUN_API_KEY, domain: DOMAIN });
	const data: Mailgun.messages.SendData = {
		from: FROM,
		to: params.to,
		subject: params.subject,
		html: params.html
	};

	return mailgun.messages().send(data);
}
