// This script runs independently from main.ts in Back4app. as this is the entry point for the
// Express app for serving subscription hooks. To test in development mode, require this module from main.ts.
// On Back4app it gets loaded automatically.

// Don't need to install express, just add its @types
// and link it to the global package to test: `$ npm link <package>`.
// as `app` is already defined in the global context in Back4app.
import { Express } from 'express';
import * as bodyParser from 'body-parser';
import * as Stripe from 'stripe';
declare var app: Express;

const debug = process.env.NODE_ENV == 'development';
console.debug(`(${new Date().toISOString()}) loading express app in ${debug ? 'dev' : 'prod'} mode...`);


// Default route
app.get('/', async (_req, res) => {
	res.send('Hellow World!');
});

// Start listening if on local server
if (debug) {
	app.listen(7007, () => console.log(`Development app listening on port ${7007}\n`));
}

console.debug('express app loaded\n');
