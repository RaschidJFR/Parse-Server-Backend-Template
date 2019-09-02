// For bypassing gmail security for testing porpuses (in case using gmail SMTP):
// https://myaccount.google.com/u/0/lesssecureapps?pli=1&pageId=none
// and follow this guide to enable a proper auth for using gmail smpt:
// https://medium.com/@nickroach_50526/sending-emails-with-node-js-using-smtp-gmail-and-oauth2-316fe9c790a1

import * as nodemailer from 'nodemailer';
import * as ejs from 'ejs';
import * as Styliner from 'styliner';

export interface OAuth2 {
  accessToken: string,
  clientId: string,
  clientSecret: string,
  refreshToken: string,
  type: string,
  user: string,
}

export namespace Mail {
  /**
	 * Current configuration
	 */
  export let config: MailModuleConfig;

  export interface MailModuleConfig {
    /**
		 * Relative path of default .css file from `templatePath`
		 */
    defaultCss?: string,
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
			 * If not provided, provide property `oauth2TokenFunction`
			 */
      auth?: {
        pass: string,
        user: string,
      } | OAuth2,
      host?: string,
      port?: number,
      secure?: boolean,
      /**
			 * You can use this parameter to omit params `host`/`port`/`secure`.
			 *
			 * `'Gmail' | 'Godaddy' | 'Hotmail' | 'Mailgun' | 'Mandrill' | 'Outlook365' | 'Yahoo',`
			 */
      service?: string,
    },
    /**
		 * Function to get the required OAuth2 tokens every time
		 * an email is sent.
		 * */
    oauth2TokenFunction?: () => Promise<OAuth2>,
    /**
		 * Folder with .ejs template files
		 */
    templatePath: string,
  }

  export interface SendEmailParams {
    html?: string,
    subject: string,
    template?: {
      data: any,
      file: string,
    },
    to: string,
  }

  export async function sendEmail(params: SendEmailParams): Promise<any> {
    let html = params.html;

    // Load ejs template
    if (params.template) {
      let file = params.template.file;
      file = file.includes('.ejs') ? file : file + '.ejs';
      html = await ejs.renderFile(`${Mail.config.templatePath}/${file}`, params.template.data);
    }

    // Add theme
    if (Mail.config.defaultCss) {
      html = `<link rel="stylesheet" href="${Mail.config.defaultCss}">` + html;
      const styliner = new Styliner(Mail.config.templatePath);
      html = await styliner.processHTML(html);
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
        template: request.params.template || {
          file: 'test.ejs',
          data: { config: Mail.config }
        }
      });

      return { response, config };
    });

    console.log('Inited Mail module\n', Mail.config);
  }
}

async function sendMailSMTP(params: { html: string, subject: string, to: string, }): Promise<any> {
  console.log(`Send email "%o" to %o`, params.subject, params.to);

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
  });
}
