console.log('Load envars from file .env');
require('dotenv').config();
process.env.TESTING = '1';
process.env.NODE_ENV = 'development';
const parseConfig = require('../../config/parse-server.config');

// Load Test Server
// ----------------
// WARNING: do not import ModuleAlias before loading the test Parse Server

let server;
if (!process.env.SKIP_SERVER_LAUNCH) {
  server = require('./server');
  server.start(parseConfig);
}

// Path Aliases
// ------------
require('module-alias/register');

// Add path: '@spec'
import * as moduleAlias from 'module-alias';
moduleAlias.addAlias('@spec', __dirname + '/..');
moduleAlias.addAlias('parse', 'parse-server/node_modules/parse/node');

import * as Parse from 'parse'; // tslint:disable-line
global.Parse = Parse;
require('module-alias/register');

// Config Jasmine
// --------------

jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.NO_TIMEOUT ? 1000e3 : 10000;

if (process.env.CI) {
  const JUnitReporter = require('jasmine-reporters').JUnitXmlReporter;
  jasmine.getEnv().addReporter(new JUnitReporter({
    savePath: 'test-results',
  }));
}

// Init Parse SDK
// --------------
import { registerSubclasses } from '@lib/models';
Parse.initialize(parseConfig.appId, '', parseConfig.masterKey);
(Parse as any).serverURL = parseConfig.publicServerURL; // tslint:disable-line
registerSubclasses();

beforeAll(async () => {
  const config: MongoDBConfig = {
    mongodb_collection: 'sensorData',
    mongodb_connection_string: 'mongodb://0.0.0.0:27017/bneuralTest',
    mongodb_database: 'bneuralTest',
  };

  const permissions = {} as { [key: string]: true };
  Object.keys(config).forEach((k) => permissions[k] = true);
  await Parse.Config.save({ ...config }, permissions);
});

beforeAll(async () => {
  console.log('Waiting for the server to be ready...');
  const serverReady = await Parse.Cloud.run('ready');

  if (serverReady)
    console.log('Server ready');
  else
    throw new Error('There seems to be a problem with the server starting up');

  console.log('\n=================== START OF TESTS =====================\n')
});

// Handy Functions
// ---------

export function getRandomInt(digits = 5) {
  return Math.round(Math.random() * Math.pow(10, digits));
}

export function sleep(ms = 100) {
  return new Promise<any>((resolve) => { // tslint:disable-line
    setTimeout(resolve, ms);
  });
}

// Model Functions
// ---------------
import { User } from '@lib/models/user';
import { Tenant } from '@lib/models/tenant';
import { Client } from '@lib/models/client';
import { Factory } from '@lib/models/factory';
import { Area } from '@lib/models/area';
import { Asset } from '@lib/models/asset';
import { Sensor } from '@lib/models/sensor';
import { MongoDBConfig } from '@modules/mongo';

export function createUser(options: Parse.ScopeOptions = { useMasterKey: true }) {
  return new User({ email: `${getRandomInt(10)}@loclhost`, password: 'pass' }).save(null, options);
}

/** Create a tenant and a new member user */
export async function createTenant() {
  // Create New Tenant and member
  const tenant = await new Tenant().save(null, { useMasterKey: true });
  await tenant.fetch({ useMasterKey: true });  // wait for afterSave hook
  const tenantMember = await createUser();
  tenant.member.getUsers().add(tenantMember);
  await tenant.member.save(null, { useMasterKey: true });
  return { tenant, tenantMember };
}

/** Create a Client with a new member user */
export async function createClient(tenant: Tenant) {
  const client = await new Client().save({ tenant }, { useMasterKey: true });
  await client.fetch({ useMasterKey: true }); // wait for afterSave hook
  const clientMember = await createUser();
  client.member.getUsers().add(clientMember);
  await client.save(null, { useMasterKey: true });
  return { client, clientMember };
}

/** Create a Factory with a whole new tree of ancestors (factory, clients, tenants) */
export async function createFactory() {
  const tenant = await createTenant();
  const client = await createClient(tenant.tenant);
  const factory = await new Factory().save({ client: client.client }, { useMasterKey: true });
  return { client, tenant, factory };
}

/** Create an Area with a whole new tree of ancestors (factory, clients, tenants) */
export async function createArea() {
  const tenant = await createTenant();
  const client = await createClient(tenant.tenant);
  const factory = await new Factory().save({ client: client.client }, { useMasterKey: true });
  const area = await new Area().save({ parent: factory }, { useMasterKey: true });
  return { client, tenant, factory, area };
}

export async function createAsset() {
  const tenant = await createTenant();
  const client = await createClient(tenant.tenant);
  const factory = await new Factory().save({ client: client.client }, { useMasterKey: true });
  const area = await new Area().save({ parent: factory }, { useMasterKey: true });
  const asset = await new Asset().save({ parent: area }, { useMasterKey: true });
  return { client, tenant, factory, area, asset };
}

/** Create a new set of Sensor-Client-Tenant */
export async function createAssignedSensor() {
  const tenant = await new Tenant().save({ name: 'Test Tenant', active: true }, { useMasterKey: true });
  await tenant.fetch({ useMasterKey: true });  // wait for afterSave hook

  const client = await new Client().save({ name: 'Test Client', tenant, active: true }, { useMasterKey: true });
  await Client.fetchAllWithInclude([client], ['settings'], { useMasterKey: true });

  const factory = await new Factory().save({ name: 'client factory', client }, { useMasterKey: true });
  await factory.fetch({ useMasterKey: true });

  const area = await new Area().save({ name: 'client area', parent: factory }, { useMasterKey: true });
  await area.fetch({ useMasterKey: true });

  const asset = await new Asset().save({ name: 'client asset', parent: area }, { useMasterKey: true });
  await asset.fetch({ useMasterKey: true });

  const sensor = await new Sensor().save({
    description: 'Test Sensor',
    tenant: tenant.member,
    client: client.member,
    asset
  }, { useMasterKey: true });

  await sensor.fetchWithInclude([
    'tenant',
    'client',
    'asset.parent.parent.client.tenant' as any,  // tslint:disable-line
    'asset.parent.parent.client.settings' as any,  // tslint:disable-line
  ], { useMasterKey: true });

  return { client, tenant, sensor };
}
