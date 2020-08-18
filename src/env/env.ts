import { environment as dev } from './env.dev';
import { environment as prod } from './env.prod';

const productionMode = process.env.NODE_ENV != 'development';
const env = productionMode ? prod : dev;

export const environment = env
console.debug(`Running in ${process.env.NODE_ENV} mode.\nENV = %o\n`, environment);
