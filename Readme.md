# Parse Server Development Template #

This repository contains the configuration file and the cloud code files for running on a [Parse Server](https://docs.parseplatform.org/parse-server/guide/) v3.0 backend.
The package is meant tu speed up testing and deployment for when you're working on Parse Server's cloud code. It uses [Mailgun](https://mailgun.com) as
[adapter](https://www.npmjs.com/package/parse-server-mailgun-adapter-template) for handling automatic emails (password reset and verification).

## Setup and Prerequisits  ##

* You'll need [Node.js](https://nodejs.org) installed on your system.
* Run `$ npm install` on the root folder to install package's local dependencies.

### Install Gloabl Dependencies ###

1. Make sure you've installed globally [parse-server](https://www.npmjs.com/package/parse-server) (`$ npm i -g parse-server`). Then link it with `$ npm link parse-server`.
2. You may install either [mongodb-runner](https://www.npmjs.com/package/mongodb-runner) (`$ npm i -g mongodb-runner`) to quickly start testing Parse Server, or [MongoDB Compass Community Edition](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/) to set up a local mongodb server instead. The latter enables your local PC to store real data instead of clearing it everytime the Parse Server stops with mongodb-runner.
3. Optionally you may install [parse-dashboard](https://www.npmjs.com/package/parse-dashboard) (`$ npm i -g parse-dashboard`) so you see and manage your server's data.

### Server Configuration ###

You can set the server's configuration in in `parse-server.config.json` and `parse-dashboard.config.json`.

1. Set the properties `appId`, `masterKey`, `javascriptKey` and/or `restApiKey` in `parse-server.config.json`. The repo has  some default values and you may run it with them, but you'll want to change them later on for the actual production values.
2. Set the same `appId` and `masterKey` in `parse-dashboard.config.json` (if you'll use the dashboard).
3. Enable a mongo database endpoint on `mongodb://localhost/<yourAppNameOrWhatever>` and add the path's value in the property `databaseURI` in `parse-server.config.json`.

> * For more server configuration settings see the [Parse Server official guide](https://docs.parseplatform.org/parse-server/guide/#usage).
> * See the [MongoDB Compass guide](https://docs.mongodb.com/compass/master/databases/#create-a-database) or [mongo-runner instructions](https://www.npmjs.com/package/mongodb-runner) to learn how to create the database endpoint.


## Editing and Building ##

Put your `.ts` source files for cloud code in the folder `src/`. The file `main.ts` will be the entry point. To build the code run `$ npm run build`. See Parse Server's [Cloud Code Guide](https://docs.parseplatform.org/cloudcode/guide/) for more information.

## Running Locally ##

1. Start mongodb with `$ mongod.exe` or equivalent on MacOS (this may be already running if you installed MongoDB Compass) or mongodb-runner (`$ mongodb-runner start`).
2. Use `$ npm start` to run the local Parse Server (project will build before launching the server). The server will be accessible on [http://localhost:1337/parse](http://localhost:1337/parse).
3. Run `$ npm run dashboard` to start the Dashboard. You can access it at [http://localhost:4040](http://localhost:4040).

## Deploying ##

### A) Deploy to Back4App.com ###
[Back4App](https://back4app.com) privides free BaaS to host your Parse Server applications. You'll need an account to follow these steps.

1. Make sure you've installed the [Back4App CLI](https://blog.back4app.com/2017/01/20/cli-parse-server/) in your system.
2. Follow the instructions to [link your local back4app project](https://www.back4app.com/docs/command-line-tool/connect-to-back4app).
3. Run `$ b4a new` inside the folder `/build`*.
4. Run `$ npm run deploy -- --b4a` to deploy your cloud code to your server on a [Back4App](https://back4app.com) account. The project will be compiled and uploaded immediatly.

*If you've already created a project on [Back4App](https://back4app.com) you can run the series of commands from the project root folder:

```
$ b4a new
  > e                         # 'e' for existing project option
  > [your project number]     # The name of your project on back4App.com
  > build                     # Create the folder called 'build'
  > b                         # 'b' for blank project option
```

### B) Deploy to remote server via SSH ###

To deploy your cloud code to a server with SSH (on Google Cloud for example), run `$ npm run deploy -- --ssh`.


## Code Examples ##

### Setup a and call a cloud function ###

Once you've got the local server configured, add this code in `main.ts`:

```
Parse.Cloud.define('test', request => {
	const params = request.params;

	const result = {
		status: 'success',
		message: 'Hi, the test was successful!',
		receivedParams: params
	}

	return result;
});
```

Add this somewhere in the client app ([browser](https://docs.parseplatform.org/js/guide/)/[iOS](https://docs.parseplatform.org/ios/guide/)/[Android](https://docs.parseplatform.org/android/guide/)) to init the SDK:

```
// Imports
import * as Parse from 'parse';                   	// Don't forget to `$ npm i parse` and `$ npm i -D @types/parse`

// Credentials
const PARSE_APP_ID = 'yourAppId';					// <- Use this value from the server's `parse-server.config.json`
const PARSE_JS_API_KEY = 'yourMasterKey';			// <- Use this value from the server's `parse-server.config.json`
const PARSE_SERVER_URL = 'localhost:1337/parse';	// <- Use this value from the server's `parse-server.config.json`

// Init SDK
Parse.initialize(PARSE_APP_ID, PARSE_JS_API_KEY);
const parse = require('parse');						// For some reason this line is required
parse.serverURL = PARSE_SERVER_URL;

```

...Then use this code in the client to call the function and get the result from the server:

```
const params = {
	title: 'Test',
	message: 'Hi... is this working?'
}

Parse.Cloude.run('test', params).then(response => {
	console.log(response);
});

//  Console outputs:
//  {
//    status: 'success',
//    message: 'Hi, the test was successful!',
//    receivedParams: params
//  }
```

For more information see the Parse Server's [Cloud Code Guide](https://docs.parseplatform.org/cloudcode/guide/).