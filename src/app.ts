// This script runs independently from main.ts in Back4app. as this is the entry point for the
// Express app for serving subscription hooks. To test in development mode, require this module from main.ts.
// On Back4app it gets loaded automatically.

// Don't need to install express, just add its @types
// and link it to the global package to test: `$ npm link <package>`.
// as `app` is already defined in the global context in Back4app.
import { Express } from 'express';
declare var app: Express;

const debug = process.env.NODE_ENV == 'development';
console.log(`(${new Date().toISOString()}) loading express app in ${debug ? 'dev' : 'prod'} mode...`);


// Default route
app.get('/', async (_req, res) => {
  res.send('Hello world!');
});

// Start listening if on local server
if (debug) {
  const ENV = require('@app/env').ENV;
  const express = require('express');

  // Serve system page templates on `/action`
  app.use('/action', express.static(ENV.assetsPath+'/templates/system/pages'));

  // Start app
  app.listen(7007, () => console.log(`Development app listening on port ${7007}\n`));
}

console.log('express app loaded\n');
