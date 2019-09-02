
// Add here your app's core config var

const APP_ID = 'app-id';
const MASTER_KEY = 'master-key';
const MOUNT_PATH = '/parse';

// Configure your prod and dev databases in the file `databases.json`

let DEV_DATABASE = `mongodb://localhost:27017${MOUNT_PATH}`;

try {
  DEV_DATABASE = require('./databases.json').dev;
} catch (e) {
  console.warn('Could not read file config/databases.json. Using default database uri: %s\n', DEV_DATABASE);
}


// Configure mailgun credentials in `credentials/mailgun.json`

let MAILGUN_CONFIG = {
  apiKey: 'yourmailgunapikey',
  domain: 'noreply@mg.yourdomain.com',
  from:'MyApp Bot'
}

try {
  MAILGUN_CONFIG = require('./credentials/mailgun.json');
} catch (e) {
  console.error('\x1b[33mCould not read file \'config/credentials/mailgun.json\'. Example:\n\x1b[0m\n%o\n', MAILGUN_CONFIG);
}

// Export configuration

module.exports = {
  appName: 'MyApp',
  appId: APP_ID,
  masterKey: MASTER_KEY,
  cloud: './build/cloud/main.js',
  mountPath: MOUNT_PATH,
  databaseURI: DEV_DATABASE,
  serverURL: `http://localhost:1337${MOUNT_PATH}`,
  publicServerURL: `http://localhost:1337${MOUNT_PATH}`,
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
          pathHtml: 'templates/password_reset_email.html',
          pathPlainText: 'templates/password_reset_email.txt'
        },
        verificationEmail: {
          subject: 'Verify your email',
          pathHtml: 'templates/verification_email.html',
          pathPlainText: 'templates/verification_email.txt'
        }
      }
    }
  },
  verbose: process.env.NODE_ENV === 'development',
  verifyUserEmails: true,
  preventLoginWithUnverifiedEmail: false
};
