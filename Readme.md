# Parse Server Development Template #

This repository contains the configuration file and the cloud code files for running on a [Parse Server](https://docs.parseplatform.org/parse-server/guide/) v3.6 backend.
The package is meant tu speed up testing and deployment for when you're working on Parse Server's cloud code.

This package contains 2 apps: The Backend's cloud code and an [Express](https://expressjs.com/) app to handle web requests. Their entry points are the files `main.ts` and `app.ts` respectively. Those names are requested in order to work on **Back4App**.  More info:

* [Deploy and call your first Cloud Code functions](https://www.back4app.com/docs/platform/get-started/cloud-functions)
* [Hosting your Node.JS web application on Back4App servers](https://www.back4app.com/docs/node-js-web-server)

#### Content ####
* [Setup and Prerequisits](#Setup-and-Prerequisits)
* [Editing and Building](#Editing-and-Building)
* [Running Locally](#Running-Locally)
* [Deploying](#Deploying)
* [Code Examples](#Code-Examples)

## Setup and Prerequisits  ##

* You'll need [Node.js](https://nodejs.org) installed on your system.
* Run `$ npm install` on the root folder to install package's local dependencies.

### Install Gloabl Dependencies ###

1. Make sure you've installed globally [parse-server](https://www.npmjs.com/package/parse-server) and [express](https://www.npmjs.com/package/express) (`$ npm i -g parse-server express`). Then link them to the project: `$ npm link parse-server express`.
2. You may install either [mongodb-runner](https://www.npmjs.com/package/mongodb-runner) (`$ npm i -g mongodb-runner`) to quickly start testing Parse Server, or [MongoDB Compass Community Edition](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/) to set up a local mongodb server instead. The latter enables your local PC to store real data instead of clearing it everytime the Parse Server stops with mongodb-runner.
3. Optionals:
   * You may want to install [parse-dashboard](https://www.npmjs.com/package/parse-dashboard) (`$ npm i -g parse-dashboard`) so you see and manage your server's data.
   * If you'll need to clone data from/to your dev and prod databases you'll need [mongodb](https://www.npmjs.com/package/mongodb) and [mongo-clone](https://www.npmjs.com/package/mongo-clone) (`$ npm i -g mongodb mongo-clone`)

### Server Configuration ###

You can set the server's configuration in `parse-server.config.js` and `parse-dashboard.config.json`, inside the `/config` folder.

1. Set the properties `appId`, `masterKey`, `javascriptKey` and/or `restApiKey` in `parse-server.config.js`. The repo has  some default values and you may run it with them, but you'll want to change them later on for the actual production values. See the [Parse Server official guide](https://docs.parseplatform.org/parse-server/guide/#usage)
2. Set the same `appId` and `masterKey` in `parse-dashboard.config.json` (if you'll use the dashboard).
3. Enable a mongo database endpoint on `mongodb://localhost/<yourAppNameOrWhatever>` and add the path's value in the property `dev` in `databases.json`. See the [MongoDB Compass guide](https://docs.mongodb.com/compass/master/databases/#create-a-database) or [mongo-runner instructions](https://www.npmjs.com/package/mongodb-runner) to learn how to create the database endpoint.



## Editing and Building ##

Put your `.ts` source files for cloud code in the folder `src/`. The file `main.ts` will be the entry point. To build the code run `$ npm run build`. See Parse Server's [Cloud Code Guide](https://docs.parseplatform.org/cloudcode/guide/) for more information.

## Running Locally ##

1. Start mongodb with `$ mongod.exe` or equivalent on MacOS (this may be already running if you installed MongoDB Compass) or mongodb-runner (`$ mongodb-runner start`).
2. Use `$ npm start` to run the local Parse Server (project will build before launching the server). The server will be accessible on [http://localhost:1337/parse](http://localhost:1337/parse).
3. Run `$ npm run dashboard` to start the Dashboard. You can access it at [http://localhost:4040](http://localhost:4040).
4. (Optional) To test the Express app you may need a service like [ngrok.io](http://ngrok.io) to expose your local server to the internet.

## Deploying ##

### A) Deploy to Back4App.com ###
[Back4App](https://back4app.com) privides free BaaS to host your Parse Server applications. You'll need an account to follow these steps.

1. Make sure you've installed the [Back4App CLI](https://blog.back4app.com/2017/01/20/cli-parse-server/) in your system.
2. Follow the instructions to [link your local back4app project](https://www.back4app.com/docs/command-line-tool/connect-to-back4app).
3. Run `$ b4a new` inside the folder `/build`*.
4. Run `$ npm run deploy -- --b4a` to deploy your cloud code to your server on a [Back4App](https://back4app.com) account. The project will be compiled and uploaded immediatly.

*If you've already created a project on [Back4App](https://back4app.com) you can run this series of commands from the project root folder:

```console
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

```javascript
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

Add this somewhere in the client app ([browser](https://docs.parseplatform.org/js/guide/)/[iOS](https://docs.parseplatform.org/ios/guide/)/[Android](https://docs.parseplatform.org/android/guide/)) run this to init the SDK:

```javascript
// Imports
import * as Parse from 'parse';				// Don't forget to `$ npm i parse` and `$ npm i -D @types/parse`

// Credentials:
// Use the values from the server's `parse-server.config.js`
const PARSE_APP_ID = 'yourAppId';
const PARSE_JS_API_KEY = 'yourMasterKey';
const PARSE_SERVER_URL = 'localhost:1337/parse';

// Init SDK
Parse.initialize(PARSE_APP_ID, PARSE_JS_API_KEY);
const parse = require('parse');				// For some reason this line is required
parse.serverURL = PARSE_SERVER_URL;

```

...Then use this code in the client to call the function and get the result from the server:

```javascript
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
//    receivedParams:  {
//			title: 'Test',
//			message: 'Hi... is this working?'
//		}
//  }
```

For more information see the Parse Server's [Cloud Code Guide](https://docs.parseplatform.org/cloudcode/guide/).
