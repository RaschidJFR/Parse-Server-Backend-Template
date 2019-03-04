# Parse Server Development Template #

This repository contains the configuration file and the cloud code files for running on a [Parse Server](https://docs.parseplatform.org/parse-server/guide/) v3.0 backend.
The package is meant tu speed up testing and deployment for when you're working on Parse Server's cloud code. It uses [Mailgun](https://mailgun.com) as 
[adapter](https://www.npmjs.com/package/parse-server-mailgun-adapter-template) for handling automatic emails (password reset and verification).

## Setup and Prerequisits  ##

1. You'll need [Node.js](https://nodejs.org) installed on your system.
2. Run `$ npm install` on the root folder to install package's local dependencies.

### Install Gloabl Dependencies ###

1. Make sure you've installed globally [parse-server](https://www.npmjs.com/package/parse-server) (`$ npm i -g parse-server`) (it's not included in this package as you woulnd't like installing a new server each time of course).
2. You may install either [mongodb-runner](https://www.npmjs.com/package/mongodb-runner) (`$ npm i -g mongodb-runner`) to quickly start testing Parse Server, or [MongoDB Compass Community Edition](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/) to set up a local mongodb server instead. The latter enables your local PC to store real data instead of losing it everytime the Parse Server stops with mongodb-runner. 
3. Optionally you may want to install [parse-dashboard](https://www.npmjs.com/package/parse-dashboard) (`$ npm i -g parse-dashboard`) so you see and manage your database data.

### Server Configuration ###

You can set the server's configuration in in `parse-server-config.json` and `parse-dashboard-config.json`. 

1. Set the properties `appId`, `masterKey`, `javascriptKey` and/or `restApiKey` in `parse-server-config.json`. The repo has  some default values and you may run it with them, but you'll want to change them later on for the actual production values.
2. Set the same `appId` and `masterKey` in `parse-dashboard-config.json` (if you'll use the dashboard).
3. Enable a database enpoint on `mongodb://localhost/<yourAppNameOrWhatever>` and add the path into the property `databaseURI` in `parse-server-config.json`. See the [MongoDB Compass guide](https://docs.mongodb.com/compass/master/databases/#create-a-database) or [mongo-runner instructions](https://www.npmjs.com/package/mongodb-runner) to learn how to create the database endpoint.

For more configuration settings see the [Parse Server official guide](https://docs.parseplatform.org/parse-server/guide/#usage).


## Editing and Building ## 

Put your typescript source files for cloud code in the folder `src`. The file `main.ts` will be the entry point. To build the code run `$ npm run build`. See Parse Server's [Cloud Code Guide](https://docs.parseplatform.org/cloudcode/guide/) for more information.

## Running Locally ##

1. Start mongodb (`$ mongod.exe` or equivalent on MacOS) (this may be already running if you installed MongoDB Compass) or mongodb-runner (`$ mongodb-runner start`). 
2. Use `$ npm run server` to run the local Parse Server (project will build before launching the server). The server will be accessible on `http://localhost:1337/parse`.
3. Run `$ npm run dashboard` to start the Dashboard. You can access it at `http://localhost:4040`. 

## Deploying ##

### Deploy to [Back4App.com](https://back4app.com) ###

1. Make sure you've installed the [Back4App CLI](https://blog.back4app.com/2017/01/20/cli-parse-server/).
2. Follow the instructions to [link your local back4app project](https://www.back4app.com/docs/command-line-tool/connect-to-back4app)* inside the output folder `build`.
3. Run `$ npm run deploy -- --b4a` to deploy your cloud code to your server on a [Back4App](https://back4app.com) account. The project will be compiled and uploaded immediatly.

*If you've already created a project on Back4App you can run the series of commands from the project root folder:

```
$ b4a new
  > e                         # 'e' for existing project option
  > [your project number]     # The name of your project on back4App.com
  > build                     # Create the folder called 'build'
  > b                         # 'b' for blank project option
```

### Deploy to a VM via SSH ###

To deploy your cloud code to your server on a VM run `$ npm run deploy -- --ssh`.
