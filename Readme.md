# Parse Server Develop and Deployment#

This repository contains the configuration file and the cloud code files for running on a [Parse Server](https://docs.parseplatform.org/parse-server/guide/).
The package is mean tu speed up testing and deployment for when you're working on Parse Server's cloud code.

## Setup and Prerequisits (global npm packages) ##

1. Run `npm install` to install package's local dependencies.
2. Make sure you've installed globally [parse-server](https://www.npmjs.com/package/parse-server) and [parse-dashboard](https://www.npmjs.com/package/parse-dashboard) (it's not included in this package as you woulnd't like installing a new server each time of course).
3. You may install either [mongodb-runner](https://www.npmjs.com/package/mongodb-runner) to quickly start testing Parse Server, or [MongoDB Community Edition](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/) to set up a local mongodb server instead of using. The latter enables your local PC to store real data instead of losing it everytime the Parse Server stops with mongodb-runner.

## Run Locally ##

1. Start mongodb (`mongod.exe`) or mongodb-runner (`mongodb-runner start`). 
2. Use `npm run parse` to run the local Parse Server. 
3. Run `npm run dashboard` to start the Dashboard.  

Configuration can be set in `parse-server-config.json` and `parse-dashboard-config.json`. 

Put your cloud code inside `/cloude_code`. The default needed file is `/cloud_code/cloud/main.js`.

## Deploy on [Back4App](https://back4app.com) ##

To deploy your cloud code to your server on a [Back4App](https://back4app.com) account run `npm run deploy`. [ESLint](https://eslint.org) Will be runned and if passed, code will be uploaded to the server.

>*Note:* If the Parse Server is hosted somewhere else you may have to follow a series of different steps to get an equivalent configuration actually running
on your Parse Server host, check you're host's documentation.
