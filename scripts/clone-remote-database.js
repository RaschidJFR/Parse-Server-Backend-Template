// Use this script from command line to clone databases:
// * Clone prod database to dev (remote) database: `$ node clone-remote-database --backup`
// * Clone dev (remote) database to local database: `$ node clone-remote-database`
//
// Check for the latest version on https://github.com/RaschidJFR/Parse-Server-Backend-Template/blob/master/scripts/clone-remote-database.js

const flags = require('node-flags');
const Path = require('path');
const DB_CONFIG_PATH = Path.resolve(__dirname + '/../config/databases.json');
const prodUri = require(DB_CONFIG_PATH).prod;
const localUri = require(DB_CONFIG_PATH).local;
const devRemoteUri = require(DB_CONFIG_PATH).devRemote;
const suffix = `${process.platform == 'win32' && '.cmd' || ''}`;


const DATABASE_FILE_STRUCT = {
  devRemote: 'mongodb://admin:***@mongodb.back4app.com:27017/***?ssl=true',
  local: 'mongodb://localhost:27017/parse',
  prod: 'mongodb://admin:***@mongodb.back4app.com:27017/***?ssl=true'
}

if (!prodUri) {
  throw new Error(`No production database URI defined in ${DB_CONFIG_PATH}:\n${JSON.stringify(DATABASE_FILE_STRUCT, null, 2)}`);
}
if (!localUri) {
  throw new Error(`No development database URI defined in ${DB_CONFIG_PATH}:\n${JSON.stringify(DATABASE_FILE_STRUCT, null, 2)}`);
}

if (flags.get('backup')) {
  if (!devRemoteUri) {
    throw new Error(`No remote development database URI defined in  ${DB_CONFIG_PATH}:\n${JSON.stringify(DATABASE_FILE_STRUCT, null, 2)}`);
  }
  cloneDatabase(prodUri, devRemoteUri);
} else {
  cloneDatabase(prodUri, localUri);
}


function cloneDatabase(source, target) {
  // Execute mongo-clone
  const { spawn } = require('child_process');
  const command = `mongo-clone${suffix}`;
  const noForce = flags.get('no-force');
  const args = `-s ${source} -t ${target}${noForce ? '' : ' -f'}`.split(' ');

  console.log('%s %s', command, args);
  let child = spawn(command, args);

  child.stdout.on('data', (data) => {
    console.log(`${data}`);
  });

  child.stderr.on('data', (data) => {
    console.log(`\x1b[31m${data}\x1b[0m`);
  });

  child.on('close', (code) => {
    console.log(`\x1b[32mDone: ${code}\x1b[0m\n`);
  });
}
