import * as requestPromise from 'request-promise-native';
import { environment } from '@app/env';
import { serverURL, applicationId } from 'parse';
import { StatusCodeError } from 'request-promise-native/errors';

describe('File Proxy', () => {

  function requestFileThrowProxy(file: Parse.File) {
    const proxiedUrl = file.url().replace(environment.proxy.files, `${environment.serverUrl}/files`);
    console.log(file.url(), ' => ', proxiedUrl)
    return requestPromise.get(proxiedUrl, { resolveWithFullResponse: true });
  }

  it('Proxing to correct URL', async done => {
    const message = 'Hello!';
    const data = message.split('').map(c => c.charCodeAt(0));
    const file = await new Parse.File('hello.txt', data).save();
    const response = await requestFileThrowProxy(file);
    expect(response.body).toBe(message);
    done();
  });

  it('Sending CORS headers', async done => {
    const file = await new Parse.File('cors', [0]).save();
    const response = await requestFileThrowProxy(file);
    expect(response.headers['access-control-allow-origin']).toBe('*');
    done();
  });

  it('Respond with correct headers on 404', async done => {
    const url = `${serverURL}/files/${applicationId}/inexistent.jpg`;
    expectAsync(requestPromise.get(url))
      .toBeRejectedWith(new StatusCodeError(404, 'File not found.', null, null))
      .then(done);
  });
});
