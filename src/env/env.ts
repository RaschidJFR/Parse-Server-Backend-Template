import { ENV as dev } from './env.dev';
import { ENV as prod } from './env.prod';

const productionMode = process.env.NODE_ENV != 'development';
const env = productionMode ? prod : dev;

console.debug(`Running on ${process.env.NODE_ENV} mode.\nENV = %o\n`, env);

export const ENV = env;