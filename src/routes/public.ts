import { Router } from 'express';
import * as express from 'express';
import { environment } from '@app/env';

const routerPublic = Router();
routerPublic.use('/css', express.static(`${environment.assetsPath}/templates/css`));
routerPublic.use('/fonts', express.static(`${environment.assetsPath}/templates/fonts`));
routerPublic.use('/img', express.static(`${environment.assetsPath}/templates/img`));

routerPublic.use('^\/$', (_req, res) => {
  res.sendFile(`pages/home.html`, { root: environment.assetsPath });
});

// Causes issue on B4A
// routerPublic.use('*', (_req, res) => {
//   res.sendStatus(404);
// });

export const router = routerPublic;
