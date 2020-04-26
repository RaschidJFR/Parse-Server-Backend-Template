console.log('Load envars from file .env');
require('dotenv').config();
process.env.TESTING = '1';
process.env.NODE_ENV='development';

// Path Aliases
// ------------

// WARNING: do not change the order of these lines in the block
// as path aliasing will change the way modules load and some requires
// may fail after aliasing.

import * as Parse from 'parse-server/node_modules/parse/node';
const parseConfig = require('../../config/parse-server.config');
let server;
if (!process.env.SKIP_SERVER_LAUNCH) {
  server = require('./server');
  server.start(parseConfig);
}

global['Parse'] = Parse;
require('module-alias/register');

// Add path: '@spec'
import * as moduleAlias from 'module-alias';
moduleAlias.addAlias('@spec', __dirname + '/..');


// Init Parse SDK
// --------------
Parse.initialize(parseConfig.appId, '', parseConfig.masterKey);
(Parse as any).serverURL = parseConfig.publicServerURL;

beforeAll(async done => {
  console.log('Waiting for the server to be ready...');
  const serverReady = await Parse.Cloud.run('ready');

  if (serverReady)
    console.log('Server ready');
  else
    throw new Error('There seems to be a problem with the server starting up');

  // Get Parse Server config and do something with it
  // const config = await Parse.Config.get();
  done();
});

afterAll(async done => {
  if (!process.env.DB) {
    console.log('Destroy all server data');
    await server.destroyAllDataPermanently();
  } else {
    console.log('Skip destroy data from remote database');
  }
  done();
});


// Config Jasmine
// --------------

jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.NO_TIMEOUT ? 1000e3 : 10000;

if (process.env.CI) {
  const JUnitReporter = require('jasmine-reporters').JUnitXmlReporter;
  jasmine.getEnv().addReporter(new JUnitReporter({
    savePath: 'test-results'
  }));
}


// Handy Functions
// ---------

export function getRandomInt(digits = 4) {
  return Math.round(Math.random() * Math.pow(10, digits));
}

export function sleep(ms = 100) {
  return new Promise<any>((resolve) => {
    setTimeout(resolve, ms);
  });
}
