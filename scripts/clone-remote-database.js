const Path = require('path');
const CONFIG_PATH = Path.resolve(__dirname + '/../config/databases.json');
const prodUri = require(CONFIG_PATH).prod;
const devUri = require(CONFIG_PATH).dev;
const suffix = `${process.platform == 'win32' && '.cmd' || ''}`;


const DATABASE_FILE_STRUCT = {
  dev: 'mongodb://localhost:27017/parse',
  prod: 'mongodb://admin:***@mongodb.back4app.com:27017/***?ssl=true',
}

if (!prodUri) {
  throw new Error('No production database URI defined in %s:\n%o', CONFIG_PATH, DATABASE_FILE_STRUCT);
}
if (!devUri) {
  throw new Error('No development database URI defined in %s:\n%o', CONFIG_PATH, DATABASE_FILE_STRUCT);
}

try {
  dropDatabase(devUri, () => {
    cloneDatabase(prodUri, devUri);
  });
} catch (e) {
  console.error(e);
  cloneDatabase(prodUri, devUri);
}

function cloneDatabase(source, target) {
  // Execute mongo-clone
  const { spawn } = require('child_process');
  const command = `mongo-clone${suffix}`;
  const args = `-s ${source} -t ${target}`.split(' ');

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

function dropDatabase(uri, callback) {
  // create a client to mongodb
  const MongoClient = require('mongodb').MongoClient;

  // make client connect to mongo service
  MongoClient.connect(uri, function(err, client) {
    if (err) throw err;
    const db = client.db();
    // print database name
    console.log('Drop database: ', db.databaseName);
    // delete the database
    db.dropDatabase(function(err, result) {
      if (err) throw err;
      console.log('Dropped: ' + result);
      // after all the operations with db, close it.
      client.close();
      callback();
    });
  });
}