// For bypassing gmail security for testing porpuses (in case using gmail SMTP):
// https://myaccount.google.com/u/0/lesssecureapps?pli=1&pageId=none
// and follow this guide to enable a proper auth for using gmail smpt:
// https://medium.com/@nickroach_50526/sending-emails-with-node-js-using-smtp-gmail-and-oauth2-316fe9c790a1

import * as nodemailer from 'nodemailer';
import * as ejs from 'ejs';

export interface OAuth2 {
	user: string,
	type: string,
	clientId: string,
	clientSecret: string,
	refreshToken: string,
	accessToken: string,
}

export namespace Mail {
	/**
	 * Current configuration
	 */
	export let config: MailModuleConfig;

	export interface MailModuleConfig {
		defaultService?: 'mailgun' | 'smtp'
		/**
		 * Sender's email: Name<no-reply@domain.com>
		 */
		from: string,
		mailgunConfig?: {
			/**
			 * Your mailgun key
			 */
			apiKey: string,
			/**
			 * Your domain registered on mailgun
			 */
			domain: string,	//
		},
		nodemailerConfig?: {
			/**
			 * You can use this parameter to omit params `host`/`port`/`secure`.
			 *
			 * `'Gmail' | 'Godaddy' | 'Hotmail' | 'Mailgun' | 'Mandrill' | 'Outlook365' | 'Yahoo',`
			 */
			service?: string,
			host?: string,
			port?: number,
			secure?: boolean,
			/**
			 * If not provided, provide property `oauth2TokenFunction`
			 */
			auth?: {
				user: string,
				pass: string,
			} | OAuth2,
		},
		/**
		 * Function to get the required OAuth2 tokens every time
		 * an email is sent.
		 * */
		oauth2TokenFunction?: () => Promise<OAuth2>,
		/**
		 * Folder with .ejs template files
		 */
		templatePath: string
	}

	export interface SendEmailParams {
		html?: string,
		subject: string,
		template?: {
			file: string,
			data: any
		},
		to: string,
	}

	export async function sendEmail(params: SendEmailParams): Promise<any> {
		let html = params.html;
		if (params.template) {
			html = await ejs.renderFile(`${Mail.config.templatePath}/${params.template.file}`, params.template.data);
		}

		try {
			return sendMailSMTP({
				to: params.to,
				subject: params.subject,
				html,
			});
		} catch (e) {
			throw new Error(e.toString() + '\nConfig:' + Mail.config);
		}
	};

	export function init(config: MailModuleConfig) {
		Mail.config = config;

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
							<pre>${JSON.stringify(config, null, 2)}</pre>
						</p>`,
				template: request.params.template && {
					file: 'test.ejs',
					data: { config: Mail.config }
				}
			});

			return { response, config };
		});

		console.log('Inited Mail module\n', Mail.config);
	}
}

async function sendMailSMTP(params: { to: string, subject: string, html: string }): Promise<any> {
	console.log(`Sending email to %o`, params.to);

	// Refresh access token (if using Auth2)
	if (Mail.config.oauth2TokenFunction)
		Mail.config.nodemailerConfig.auth = await Mail.config.oauth2TokenFunction();

	const transporter = nodemailer.createTransport(Mail.config.nodemailerConfig as any);
	const mailOptions = {
		from: Mail.config.from,
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