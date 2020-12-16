import * as nodemailer from 'nodemailer';
import * as ejs from 'ejs';
import * as Styliner from 'styliner';
import * as NodeCache from 'node-cache';

const cache = new NodeCache();

interface ServerConfiguration {
  /** Sender's name and email in the format `'Sender Name<no-reply@my.domain.io>'` */
  from?: string;
  smtp: SMTPConfiguration;
}

export interface SMTPConfiguration {
  auth: {
    pass: string,
    user: string,
  };
  host: string;
  port: number;
}

export interface TemplateConfiguration {
  /** Path fo default `.css` file relative to `templatePath` */
  defaultCss?: string;
  /** Path to folder containing the `.ejs` template files */
  templatePath: string;
  /** Time to live (in seconds) for config in cache */
  ttl: number;
}

export interface MailModuleConfiguration extends ServerConfiguration, TemplateConfiguration { }

export interface SendEmailParams {
  /** HTML content of the message (only when not passing a template) */
  html?: string;
  subject: string;
  template?: {
    data: { [key: string]: any }, // tslint:disable-line
    /** Path to a .ejs file, relative to templates folder */
    file: string,
  };
  to: string | string[];
}

export abstract class MailModule {
  public static config = {} as MailModuleConfiguration;

  public static async getMockSMTPConfig(): Promise<SMTPConfiguration> {
    const account = await nodemailer.createTestAccount();
    const auth = {
      user: account.user,
      pass: account.pass
    };

    console.log('Created Ethereal virtual account for SMTP testing.\n' +
      'You can check the caught messages at https://ethereal.email/messages .\n' +
      'Account details: \n', account);

    return {
      ...account.smtp,
      auth
    };
  }

  public static async sendEmail(params: SendEmailParams) {
    try {
      let html = params.html;

      // Load ejs template
      if (params.template) {
        let file = params.template.file;
        file = file.includes('.ejs') ? file : file + '.ejs';
        html = await ejs.renderFile(`${MailModule.config.templatePath}/${file}`, params.template.data);
      }

      // Add theme
      if (MailModule.config.defaultCss) {
        try {
          const styliner = new Styliner(MailModule.config.templatePath);
          html = await styliner.processHTML(`<link rel="stylesheet" href="${MailModule.config.defaultCss}">` + html);
        } catch (e) {
          console.error('Could not parse stylesheet: ', e);
        }
      }

      return sendMailSMTP({
        to: params.to,
        subject: params.subject,
        html,
      });
    } catch (e) {
      console.error('Could not send email. ', params);
      throw e;
    }
  }

  public static async init(config: TemplateConfiguration) {
    MailModule.config = {
      ...config,
      ...await this.getServerConfig(),
    };
    console.log('Init Mail Module: ', this.config);

    console.log('Define cloud function `mail:test`');
    Parse.Cloud.define('mail:test', async (request) => {
      if (!request.master) throw new Error('requires master key');

      const response = await MailModule.sendEmail({
        to: request.params.email,
        subject: `Test`,
        template: request.params.template || {
          file: 'ejs/test.ejs',
          data: { config: MailModule.config }
        }
      });

      return { response, config };
    });
  }

  /**
   * Get SMTP configuration from Parse Dashboard's Config
   */
  public static async getServerConfig(): Promise<ServerConfiguration> {
    let config = cache.get<ServerConfiguration>('mailConfig');
    if (config) {
      return config;
    }

    console.log('No mail configuration found in cache. Fetching...');

    if (process.env.TESTING) {
      const mock = await this.getMockSMTPConfig();
      config = { smtp: mock };
    } else {
      const parseConfig = await Parse.Config.get({ useMasterKey: true });
      const user: string = parseConfig.get('mail_smtp_user');
      const pass: string = parseConfig.get('mail_smtp_password');
      const host: string = parseConfig.get('mail_smtp_host');
      const port: number = parseConfig.get('mail_smtp_port');
      const from: string = parseConfig.get('mail_from');

      // Create config if it does not exist
      if (!user || !pass || !pass || !port || !from) {
        await Parse.Config.save({
          mail_from: from || 'Sender Name<no-reply@my.domain.com>',
          mail_smtp_user: user || '',
          mail_smtp_password: pass || '',
          mail_smtp_host: host || '',
          mail_smtp_port: port || 587,
        }, {
          mail_from: true,
          mail_smtp_user: true,
          mail_smtp_password: true,
          mail_smtp_host: true,
          mail_smtp_port: true,
        });
        console.log('Created default SMTP config');
      }

      config = {
        from,
        smtp: {
          auth: { user, pass },
          host,
          port
        }
      };
    }

    cache.set('mailConfig', config, this.config.ttl);
    console.log('Mail configuration cached');
    return config;
  }
}

async function sendMailSMTP(params: { html: string, subject: string, to: string | string[] }) {
  console.log(`Send email "%o" to %o`, params.subject, params.to);

  const transporter = nodemailer.createTransport(MailModule.config.smtp);
  const mailOptions = {
    from: MailModule.config.from,
    to: params.to,
    subject: params.subject,
    html: params.html
  };

  // tslint:disable-next-line
  return new Promise<any>((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error)
        reject(error);
      else
        resolve(info.response);
    });
  });
}
