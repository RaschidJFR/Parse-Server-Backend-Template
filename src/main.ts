require('module-alias/register');
import { Auth } from '@modules/auth';
import { Setup } from '@modules/setup';
import { AppTwilio } from '@modules/twilio';
import { initHooks } from './hooks';
import { environment } from '@app/env';
import { FCMModule } from '@modules/fcm';
import schemas from './schemas';

async function initModules() {
  return Promise.all([
    Auth.initCloudFunctions(),
    Setup.initCloudJobs(null, null),
    AppTwilio.init(),
    FCMModule.init(),
    initHooks(),
    schemas()
  ]);
}

// Ready the server and modules
const ready = initModules();
Parse.Cloud.define('ready', async () => {
  try {
    await ready;
  } catch (e) {
    return false;
  }
  return true;
});

// Setup test cloud function
Parse.Cloud.define('test', request => {
  return {
    message: 'Test worked!',
    params: request.params,
    originalRequest: request
  };
});

// Start web hosting app manually if in local debug server
if (environment.debug) {
  global['app'] = require('express')();
  require('./app');
}
