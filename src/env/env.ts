import { ENV as dev } from './env.dev';
import { ENV as prod } from './env.prod';

const productionMode = process.env.NODE_ENV == 'production';
const env = productionMode ? prod : dev;

console.debug(`Running on ${process.env.NODE_ENV} mode: `, env);

export const ENV = env;