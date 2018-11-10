import * as Mailgun from 'mailgun-js';

const MAILGUN_API_KEY = '***REMOVED***';				// Your mailgun key
const DOMAIN = '***REMOVED***.mailgun.org';						// Your domain registered on mailgun
const FROM = 'D-RiskIt <postmaster@***REMOVED***.mailgun.org>';	// Your company 'from' email

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
