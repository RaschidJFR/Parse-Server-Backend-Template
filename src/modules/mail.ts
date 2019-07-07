// For bypassing gmail security for testing porpuses (in case using gmail SMTP):
// https://myaccount.google.com/u/0/lesssecureapps?pli=1&pageId=none
// and follow this guide to enable a proper auth for using gmail smpt:
// https://medium.com/@nickroach_50526/sending-emails-with-node-js-using-smtp-gmail-and-oauth2-316fe9c790a1

import * as Mailgun from 'mailgun-js';
import * as nodemailer from 'nodemailer';
import { ENV } from '@app/env';

const MAILGUN_API_KEY = 'ENV.mailgun.apiKey';							// Your mailgun key
const DOMAIN = 'ENV.mailgun.domain';											// Your domain registered on mailgun
const FROM = `Test<no-reply@${'ENV.mailgun.domain'}>`;		// Your company 'from' email
const SMTP_CONFIG = {};

export namespace Mail {

	export function sendEmail(
		params: { to: string, subject: string, html: string },
		service: 'mailgun' | 'smpt' = 'mailgun'
	): Promise<any> {

		if (service == 'mailgun')
			return sendEmailWithMailgun(params);
		else
			return sendMailSMTP(params);
	};

	export function initCloudFunctions() {
		Parse.Cloud.define('mail:test', async (request) => {
			if (!request.master) throw 'requires master key';

			const response = await Mail.sendEmail({
				to: request.params.email,
				subject: `Test`,
				html: ` <h1>Test Worked!</h1>
						<p>Regards from the cloud server!</p>
						<br>
						<p>
							Config:<br>
							<pre>${JSON.stringify(ENV, null, 2)}</pre>
						</p>`
			}, request.params.service);

			response.config = ENV;
			return response;
		});
	}
}

function sendEmailWithMailgun(params: { to: string, subject: string, html: string }): Promise<any> {
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


function sendMailSMTP(params: { to: string, subject: string, html: string }): Promise<any> {
	console.log(`Sending email to ${params.to}`);

	const transporter = nodemailer.createTransport(SMTP_CONFIG);
	const mailOptions = {
		from: FROM,
		to: params.to,
		subject: params.subject,
		html: params.html
	};

	return new Promise((resolve, reject) => {
		transporter.sendMail(mailOptions, (error, info) => {
			if (error)
				reject(error);
			else
				resolve(info.response);
		});
	}).then((response) => {
		console.log(`Email sent to ${params.to}`);
		return response;
	});
}