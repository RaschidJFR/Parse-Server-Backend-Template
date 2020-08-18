require('module-alias/register');
import { Auth } from '@modules/auth';
import { initHooks } from './hooks';
import { environment } from '@app/env';
import schemas from './schemas';
import { Mail } from '@modules/mail';

async function initModules() {
  await Promise.all([
    getSMTPConfig().then(config => {
      Mail.init({
        templatePath: `${environment.assetsPath}/templates`,
        from: `MyApp<${config.auth.user}>`,
        defaultCss: 'css/mailing.css',
        nodemailerConfig: config
      })
    }),
    // Auth.createSuperUser(),
    // initHooks(),
    // schemas(),
  ]);
}

// Ready the server and modules
const ready: Promise<any> = initModules();
Parse.Cloud.define('ready', async () => {
  try {
    await ready;
  } catch (e) {
    console.error(e);
    return false;
  }
  return true;
});

// Start web hosting app manually if in local debug server
if (environment.debug) {
  global['app'] = require('express')();
  require('./app');
}

async function getSMTPConfig() {
  if (process.env.TESTING)
    return Mail.getMockSMPTConfig();

  return Mail.getSMTPConfig();
}
