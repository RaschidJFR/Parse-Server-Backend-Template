import * as gcm from 'node-gcm';
import { environment } from '@app/env';

export interface FCMConfig {
  fcmServerKey: string;
}

export interface FCMSendParams {
  collapseKey?: string;
  data?: { [key: string]: string };
  deviceTokens?: string[];
  notification: {
    body: string,
    title: string,
  };
  topic?: string;
}

export class FCMModule {

  public static async getConfig() {
    const config = await Parse.Config.get({ useMasterKey: true });
    const attr: FCMConfig = {
      fcmServerKey: config.get('fcmServerKey') || '',
    };
    await Parse.Config.save(attr, { fcmServerKey: true });
    return attr;
  }

  public static init() {
    process.env.DEBUG = environment.debug ? 'node-gcm' : '';
    this.getConfig();

    Parse.Cloud.define('fcm:send', async (request) => {
      if (!request.master) throw new Error('Mastery Key required');
      return FCMModule.send(request.params as any); // tslint:disable-line
    });

    Parse.Cloud.define('fcm:send:raw', async (request) => {
      if (!request.master) throw new Error('Mastery Key required');
      const params = request.params;

      const message = new gcm.Message(params.message);

      return new Promise<gcm.IResponseBody>(async (resolve, reject) => {
        const config = await FCMModule.getConfig();
        const sender = new gcm.Sender(config.fcmServerKey);
        sender.send(message, params.recipients, (err, response) => {
          if (err) {
            console.error(err);
            reject(err);
          } else if (response.failure) {
            reject(response.results.map(e => e.error));
          } else {
            resolve(response);
          }
        });
      });
    });
  }

  public static send(params: FCMSendParams, platform: 'ios' | 'android' = 'ios') {

    if ((!params.deviceTokens || !params.deviceTokens.length) && !params.topic) {
      throw new Error('Missing recipient tokens');
    }

    if (!params.notification || !params.notification.title || !params.notification.body) {
      throw new Error('Wrong param: notification');
    }

    const data = {
      title: params.notification.title,
      // icon: 'ic_launcher',
      body: params.notification.body,
      // click_action: 'FCM_PLUGIN_ACTIVITY'
    };

    Object.assign(data, params.data || {});

    const message = new gcm.Message({
      collapseKey: params.collapseKey,
      contentAvailable: true,
      dryRun: !!process.env.TESTING && !process.env.FCM_NO_DRY_RUN,
      data,
      timeToLive: 8 * 3600,
      notification: platform === 'ios' ? {
        title: params.notification.title,
        icon: 'ic_launcher',
        body: params.notification.body,
        sound: 'default',
        badge: '1',
        // click_action: 'FCM_PLUGIN_ACTIVITY',
        // tag: ???
      } : undefined
    });

    return new Promise<gcm.IResponseBody>(async (resolve, reject) => {
      const config = await FCMModule.getConfig();
      const sender = new gcm.Sender(config.fcmServerKey);
      const recipients = params.deviceTokens && params.deviceTokens.length ? { registrationTokens: params.deviceTokens } : { topic: '/topics/' + params.topic };
      sender.send(message, recipients, (err, response) => {
        if (err) {
          console.error(err);
          reject(err);
        } else if (response.failure) {
          reject(response.results.map(e => e.error));
        } else {
          resolve(response);
        }
      });
    });
  }

}
