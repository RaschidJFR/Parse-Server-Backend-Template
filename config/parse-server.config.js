
// Add here your app's core config variables

const APP_ID = 'app-id';
const MASTER_KEY = 'master-key';
const MOUNT_PATH = '/parse';
const PUBLIC_URL = `http://localhost:1337${MOUNT_PATH}`;
const PAGE_TEMPLATE_PUBLIC_URL = '//localhost:7007/action';

// Configure mailgun credentials in `credentials/mailgun.json`
// For testing locally system emails

let MAILGUN_CONFIG = {
  apiKey: 'yourmailgunapikey',
  domain: 'noreply@mg.yourdomain.com',
  from: 'MyApp Bot'
};

try {
  MAILGUN_CONFIG = require('./credentials/mailgun.json');
} catch (e) {
  console.error('\x1b[33mCould not read file \'config/credentials/mailgun.json\'. ' +
    'Expected file content:\n\x1b[0m\n%o\n\nSystem emails will not be available\n', MAILGUN_CONFIG);
}

// Export configuration

module.exports = {
  appName: 'MyApp',
  appId: APP_ID,
  masterKey: MASTER_KEY,
  cloud: './build/cloud/main.js',
  mountPath: MOUNT_PATH,
  databaseURI: `mongodb://localhost:27017${MOUNT_PATH}`,
  serverURL: PUBLIC_URL,
  publicServerURL: PUBLIC_URL,
  mountGraphQL: true,
  mountPlayground: true,

  // Custom Pages
  customPages: {
    choosePassword: `${PAGE_TEMPLATE_PUBLIC_URL}/password_reset.html`,
    invalidLink: `${PAGE_TEMPLATE_PUBLIC_URL}/invalid_link.html`,
    invalidVerificationLink: `${PAGE_TEMPLATE_PUBLIC_URL}/invalid_verification_link.html`,
    linkSendFail: `${PAGE_TEMPLATE_PUBLIC_URL}/link_send_fail.html`,
    linkSendSuccess: `${PAGE_TEMPLATE_PUBLIC_URL}/link_send_success.html`,
    passwordResetSuccess: `${PAGE_TEMPLATE_PUBLIC_URL}/password_reset_success.html`,
    verifyEmailSuccess: `${PAGE_TEMPLATE_PUBLIC_URL}/verify_email_success.html`
  },

  // Custom Email Templates
  emailAdapter: {
    module: 'parse-server-mailgun',
    options: {
      fromAddress: MAILGUN_CONFIG.from,
      domain: MAILGUN_CONFIG.domain,
      host: 'api.mailgun.net',
      apiKey: MAILGUN_CONFIG.apiKey,
      templates: {
        passwordResetEmail: {
          subject: 'Password reset',
          pathHtml: 'config/templates/password_reset_email.html',
          pathPlainText: 'config/templates/password_reset_email.txt'
        },
        verificationEmail: {
          subject: 'Verify your email',
          pathHtml: 'config/templates/verification_email.html',
          pathPlainText: 'config/templates/verification_email.txt'
        }
      }
    }
  },

  // Use custom file adapter
  filesAdapter: process.env.USE_CUSTOM_FILEADAPTER ? require('./file-adapter.config')(APP_ID) : undefined,

  verbose: process.env.NODE_ENV === 'development' && process.env.VERBOSE === '1' && !process.env.TESTING,
  verifyUserEmails: true,
  preventLoginWithUnverifiedEmail: false
};
