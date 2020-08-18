import * as requestPromise from 'request-promise-native';
import { environment } from '@app/env';

it('Serve Apple App Site Association file', async done => {
  const response = await requestPromise(`${environment.serverUrl}/.well-known/apple-app-site-association`,
    { json: true, });

  expect(Array.isArray(response.applinks.apps)).toBe(true);
  expect(response.applinks.apps.length).toBe(0);
  expect(typeof response.applinks.details[0].appID).toBe('string');
  expect(Array.isArray(response.applinks.details[0].paths)).toBe(true);
  expect(response.applinks.details[0].paths.length).toBeGreaterThan(0);
  done();
});
