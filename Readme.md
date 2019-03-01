# Parse Server Development Template #

This repository contains the configuration file and the cloud code files for running on a [Parse Server](https://docs.parseplatform.org/parse-server/guide/) v3.0.
The package is meant tu speed up testing and deployment for when you're working on Parse Server's cloud code. It uses [Mailgun](https://mailgun.com) as 
[adapter](https://www.npmjs.com/package/parse-server-mailgun-adapter-template) for handling automatic emails (password reset and verification).

## Building ## 

1. Run `npm install` to install package's local dependencies.
2. To build the code run `npm run build`.
3. Point your Parse Server instance for cloud code to `build/cloud/main.js`

## Local Development ##

### Setup and Prerequisits (global npm packages) ###

1. Make sure you've installed globally [parse-server](https://www.npmjs.com/package/parse-server) and [parse-dashboard](https://www.npmjs.com/package/parse-dashboard) (it's not included in this package as you woulnd't like installing a new server each time of course).
2. You may install either [mongodb-runner](https://www.npmjs.com/package/mongodb-runner) to quickly start testing Parse Server, or [MongoDB Community Edition](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/) to set up a local mongodb server instead. The latter enables your local PC to store real data instead of losing it everytime the Parse Server stops with mongodb-runner. 

### Running Locally (Windows) ###

1. Make sure to enable a database for this project on `mongodb://localhost/<yourAppName>` and add the path into the parameters of your config file `parse-server-config.json`.
2. Start mongodb (`mongod.exe`) or mongodb-runner (`mongodb-runner start`). 
3. Use `npm run server` to run the local Parse Server (project will build before launching the server). 
4. Run `npm run dashboard` to start the Dashboard.  

Configuration can be set in `parse-server-config.json` and `parse-dashboard-config.json`. 

Put your **cloud code** inside `/build`. The default needed file is `/build/cloud/main.js`.

## Deployment ##

### Deploy to [Back4App](https://back4app.com) ###

1. Make sure you've installed the [Back4App CLI](https://blog.back4app.com/2017/01/20/cli-parse-server/).
2. Follow the instructions to [link your local back4app project](https://www.back4app.com/docs/command-line-tool/connect-to-back4app)* inside the output folder `build`.
3. Run `npm run deploy -- --b4a` to deploy your cloud code to your server on a [Back4App](https://back4app.com) account. The project will be compiled and uploaded immediatly.

*If you've already created a project on Back4App you can run the series of commands from the project root folder:

```
$ b4a new
  > e
  > [your project number]
  > build
```

### Deploy to a VM via SSH ###

To deploy your cloud code to your server on a VM run `npm run deploy -- --ssh`.