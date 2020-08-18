// This script runs independently from main.ts in Back4app. as this is the entry point for the
// Express app for web hosting and hooks. To test in development mode, require this module from main.ts.
// On Back4app it gets loaded automatically.

// Do not to install package express (unless you want to override that from Back4app or other BAS),
// just add its @types. For testing, install it globally and link it: `$npm i g express` then `$ npm link express`.
import { Express } from 'express';
import * as express from 'express';
import { environment } from '@app/env';
import { router as routerWellKnown } from './routes/well-known';
import { router as routerPublic } from './routes/public';
import { router as routerFileProxy } from './routes/files';
declare var app: Express; // On Back4app, `app` is already defined in the global context.

const debug = process.env.NODE_ENV == 'development';
console.log(`(${new Date().toISOString()}) loading express app in ${debug ? 'dev' : 'prod'} mode...`);

// Load routes
app
  .use('/.well-known', routerWellKnown)
  .use('/files', routerFileProxy)
  .use('/', routerPublic);

// (Only for local server debug)
if (debug) {
  // Serve system page templates on `/action`
  app.use('/action', express.static(environment.assetsPath + '/templates/system/pages'));
  app.use('/', express.static(environment.assetsPath)); // On b4a all files in `public` folder are served

  // Start app
  app.listen(7007, () => console.log(`Development app listening on port ${7007}\n`));
}

console.log('express app loaded\n');

