require('module-alias/register');
import { Auth } from '@modules/auth';
import { Setup } from '@modules/setup';
import { ENV } from '@app/env';

Auth.initCloudFunctions();
Setup.initCloudJobs();

// Start express app manually if in local server
if (ENV.debug) {
  global['app'] = require('express')();
  require('./app');
}
