# Parse Server Backend Template

This repository contains the configuration file and the cloud code files for running on a [Parse Server](https://docs.parseplatform.org/parse-server/guide/) v3.x backend.
The package is meant to speed up testing and deployment for when you're working on Parse Server's cloud code.

This package contains 2 apps: The Backend's cloud code and an independent Express app for web hosting and hooks. Their entry points are the files `main.ts` and `app.ts` respectively (those names are requested in order to work on an app hosted on [Back4App](https://back4app.com)).

More info:

* [Deploy and call your first Cloud Code functions](https://www.back4app.com/docs/platform/get-started/cloud-functions)
* [Hosting your Node.JS web application on Back4App servers](https://www.back4app.com/docs/node-js-web-server)

**Content:**
- [Parse Server Backend Template](#parse-server-backend-template)
  - [Template Content](#template-content)
    - [Suggested Folder Structure](#suggested-folder-structure)
    - [Modules](#modules)
  - [Setup and Prerequisites](#setup-and-prerequisites)
    - [Install Global Dependencies](#install-global-dependencies)
    - [Server Configuration](#server-configuration)
  - [Editing and Building](#editing-and-building)
    - [Customizing System Emails and Pages](#customizing-system-emails-and-pages)
      - [Building Styles](#building-styles)
  - [Running Locally](#running-locally)
    - [Cloning a Remote Database](#cloning-a-remote-database)
  - [Deploying](#deploying)
    - [A) Deploy to Back4App.com](#a-deploy-to-back4appcom)
    - [B) Deploy to remote server via SSH](#b-deploy-to-remote-server-via-ssh)
  - [Code Examples](#code-examples)
    - [Setup a and call a cloud function](#setup-a-and-call-a-cloud-function)
  - [Credits](#credits)

## Template Content

### Suggested Folder Structure
These folders have been pre-populated and configured for the described functions:

```
|-- assets            // Rresource folder for accessing in runtime
  |-- templates       // EJS email tempaltes
|
|-- config            // Database and server configuration files
  |-- credentials     // Credential files for server and database configuration
  |-- templates       // Templates for system emails
|
|-- scripts           // Chore scripts (CI, deployment, etc)
|-- src               // Main cloud code source
  |-- main.ts         // Entry point for the ParseServer
  |-- app.ts          // Entrey point for a secondary Express app
  |-- env             // Environmental vars
    |-- credentials   // Credentials to be accessed in runtime
  |
  |-- hooks           // Files for managing cloud functions and jobs
  |-- modules         // Helper modules
  |-- types           // Definition files. Useful for extending @types
  |-- lib             // Shared library between frontend and backend (git-ignored)
```

### Modules
A series of modules have been created for accomplishing common backend tasks. To use, just import and call the static classes' functions.

| Module      | Exported class | Description                                                               |
| ----------- | -------------- | ------------------------------------------------------------------------- |
| auth.ts     | Auth           | Helper class for managing a super user and Roles.                         |
| currency.ts | Currency       | Helper class with methods for retrieving and converting currencies.       |
| files.ts    | Files          | Helper class for removing unlinked files from database objects.           |
| jobs.ts     | Jobs           | Helper class for checking job status.                                     |
| mail.ts     | Mail           | Helper class for sending emails.                                          |
| setup.ts    | Config         | Helper class with functions for blanking and resetting the database data. |
| stripe.ts   | Payment        | Helper class and functions for managing payments with Stripe.             |

## Setup and Prerequisites

* You'll need [Node.js](https://nodejs.org) installed on your system.
* Run `$ npm install` on the root folder to install package's local dependencies.

### Install Global Dependencies

1. Make sure you've installed globally [parse-server](https://www.npmjs.com/package/parse-server) and [express](https://www.npmjs.com/package/express) (`$ npm i -g parse-server express`). Then link them to the project: `$ npm link parse-server express`.
2. Install -globally- the adapters required by parse-server. You'll find them in `config/parse-server.js`. For example: `$ npm i -g parse-server-mailgun`:

    ```js
    // parse-server.js
    emailAdapter: {
      module: "parse-server-mailgun",
      ...
    }
    ```

3. You may install either [mongodb-runner](https://www.npmjs.com/package/mongodb-runner) (`$ npm i -g mongodb-runner`) to quickly start testing Parse Server, or [MongoDB Compass Community Edition](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/) to set up a local mongodb server instead. The latter enables your local PC to store real data instead of clearing it every time the Parse Server stops with mongodb-runner.
4. Optional:
   * You may want to install [parse-dashboard](https://www.npmjs.com/package/parse-dashboard) (`$ npm i -g parse-dashboard`) so you see and manage your server's data.
   * If you'll need to clone data from/to your dev and prod databases you'll need [mongodb](https://www.npmjs.com/package/mongodb) and [mongo-clone](https://www.npmjs.com/package/mongo-clone) (`$ npm i -g mongodb mongo-clone`)

### Server Configuration

You can set the server's configuration in `parse-server.config.js` and `parse-dashboard.config.json`, inside the `/config` folder.

1. Set the properties `appId`, `masterKey`, `javascriptKey` and/or `restApiKey` in `parse-server.config.js`. The repo has  some default values and you may run it with them, but you'll want to change them later on for the actual production values. See the [Parse Server official guide](https://docs.parseplatform.org/parse-server/guide/#usage)
2. Set the same `appId` and `masterKey` in `parse-dashboard.config.json` (if you'll use the dashboard).
3. Enable a mongo database endpoint on `mongodb://localhost/<yourAppNameOrWhatever>` and add the path's value in the property `dev` in `databases.json`. See the [MongoDB Compass guide](https://docs.mongodb.com/compass/master/databases/#create-a-database) or [mongo-runner instructions](https://www.npmjs.com/package/mongodb-runner) to learn how to create the database endpoint.



## Editing and Building

Put your `.ts` source files for cloud code in the folder `src/`. The file `main.ts` will be the entry point. To build the code run `$ npm run build`. See Parse Server's [Cloud Code Guide](https://docs.parseplatform.org/cloudcode/guide/) for more information.

### Customizing System Emails and Pages
Emails and page templates for resetting password and verifying emails are handled internally by Parse Server. By using an [email adapter](https://docs.parseplatform.org/parse-server/guide/#welcome-emails-and-email-verification) you may modify how emails look; and by setting the property `customPages` in the server's config you can assign the desired html templates for the user-face pages. This package uses [parse-server-mailgun](https://www.npmjs.com/package/parse-server-mailgun) as email adapter. You can change this configuration in `config/parse-server.config.js`.

You'll find these templates inside `/assets/templates/system`.

>**Important**: If you're deploying to [Back4App](https://help.back4app.com/hc/en-us/articles/360028152251-How-can-I-use-my-own-verification-email-tool-MAILGUN-) or other Parse hosting service, you may need to ask the support team to implement this configuration on their side.


#### Building Styles
Email templates are implementing a simplified [Bootstrap](https://getbootstrap.com/) theme in runtime. Make sure the css files are built and updated by running `$ npm run build:scss`. They should be compiled into `/assets/templates/css`.

## Running Locally

1. Start mongodb with `$ mongod.exe` or equivalent on MacOS (this may be already running if you installed MongoDB Compass) or mongodb-runner (`$ mongodb-runner start`).
2. Use `$ npm start` to run the local Parse Server (project will build before launching the server). The server will be accessible on [http://localhost:1337/parse](http://localhost:1337/parse).
3. Run `$ npm run dashboard` to start the Dashboard. You can access it at [http://localhost:4040](http://localhost:4040).
4. (Optional) To test the Express app you may need a service like [ngrok.io](http://ngrok.io) to expose your local server to the internet.

### Cloning a Remote Database
A local script has been included to make a local backup of your production database:

1. Configure your database URIs in `config/databases.json`
2. Run `$ npm run cloneRemoteDatabase`

## Deploying

### A) Deploy to Back4App.com
[Back4App](https://back4app.com) provides free BaaS to host your Parse Server applications. You'll need an account to follow these steps.

1. Make sure you've installed the [Back4App CLI](https://blog.back4app.com/2017/01/20/cli-parse-server/) in your system.
2. Follow the instructions to [link your local back4app project](https://www.back4app.com/docs/command-line-tool/connect-to-back4app).
3. Run `$ b4a new` inside the folder `/build`*.
4. Run `$ npm run deploy -- --b4a` to deploy your cloud code to your server on a [Back4App](https://back4app.com) account. The project will be compiled and uploaded immediately.

*If you've already created a project on [Back4App](https://back4app.com) you can run this series of commands from the project root folder:

```console
$ b4a new
  > e                         # 'e' for existing project option
  > [your project number]     # The name of your project on back4App.com
  > build                     # Create the folder called 'build'
  > b                         # 'b' for blank project option
```

### B) Deploy to remote server via SSH

To deploy your cloud code to a server with SSH (on Google Cloud for example), run `$ npm run deploy -- --ssh`.


## Code Examples

### Setup a and call a cloud function

Once you've got the local server configured, add this code in `main.ts`:

```js
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

Add this somewhere in the client app ([browser](https://docs.parseplatform.org/js/guide/)/[iOS](https://docs.parseplatform.org/ios/guide/)/[Android](https://docs.parseplatform.org/android/guide/)) run this to initialize the SDK:

```js
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

```js
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


## Credits

Raschid J.F. Rafaelly
<br>
http://raschidjfr.dev
<br>
<hello@raschidjfr.dev>

For the latest template version visit https://github.com/RaschidJFR/Parse-Server-CloudCode-Development-Unit.
