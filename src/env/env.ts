import { environment as dev } from './env.dev';
import { environment as prod } from './env.prod';

const productionMode = process.env.NODE_ENV != 'development';
const env = productionMode ? prod : dev;


const webhooks = {
  baseUrl: env.webhooks.baseUrl,
  twilio: {
    voice: '/webhooks/twilio/voice',
    status: '/webhooks/twilio/voice/status',
    test: '/webhooks/twilio/voice/test'
  }
};

export const environment = Object.assign(env, { webhooks });
console.debug(`Running in ${process.env.NODE_ENV} mode.\nENV = %o\n`, environment);
