import { Router } from 'express';
import * as express from 'express';
import { environment } from '@app/env';

const routerWellKnown = Router();
routerWellKnown
  .use('/apple-app-site-association', (_req, res, next) => {
    res.type('application/json');
    next();
  })
  .use('/', express.static(environment.assetsPath + '/well-known'));

export const router = routerWellKnown;
