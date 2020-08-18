import { Router } from 'express';
import * as cors from 'cors';
import * as requestPromise from 'request-promise-native';
import { environment } from '@app/env';


/**
 * Proxy for avoiding CORS on file requests from back4app.com
 */
export const router = Router()
  .get('/**',
    cors(),
    async (req, res) => {
      const url = environment.proxy.files + req.path;
      requestPromise.get(url, { resolveWithFullResponse: true }).pipe(res);
    });
