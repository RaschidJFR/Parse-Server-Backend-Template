require('module-alias/register');
import { environment } from '@app/env';
import { initHooks } from './hooks';
import { MailModule } from '@modules/mail';
import schemas from './schemas';

declare const global: { app: Express.Application; };

async function initModules() {
  await Promise.all([
    schemas(),
    MailModule.init({
      defaultCss: 'css/mailing.css',
      templatePath: `${environment.assetsPath}/templates`,
      ttl: 3600,
    }),
  ]);
  initHooks();
}

// Ready the server and modules
const ready = initModules();
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
  global.app = require('express')();
  require('./app');
}
