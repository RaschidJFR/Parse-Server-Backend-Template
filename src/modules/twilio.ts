import { Twilio } from 'twilio';
import * as generateRandomPassword from 'password-generator';
export interface TwilioConfig {
  twilioAccountSid: string;
  twilioApplicationSid: string;
  twilioAuthToken: string;
  twilioTestPhone: string[];
  twilioVerifySid: string;
}

export class AppTwilio {

  public static async getAccountPhoneNumbers(): Promise<string[]> {
    const config = await AppTwilio.getConfig();
    const accountSid = config.twilioAccountSid;
    const authToken = config.twilioAuthToken;
    const client = new Twilio(accountSid, authToken);

    const searchResults = await client.incomingPhoneNumbers.list();
    return searchResults
      .filter(res => res.addressRequirements !== 'none')
      .map(res => res.phoneNumber);
  }

  public static async getConfig(): Promise<TwilioConfig> {
    const config = await Parse.Config.get({ useMasterKey: true });
    const twilioConf = {
      twilioAccountSid: config.get('twilioAccountSid') || '',
      twilioApplicationSid: config.get('twilioApplicationSid') || '',
      twilioAuthToken: config.get('twilioAuthToken') || '',
      twilioTestPhone: config.get('twilioTestPhone') || [],
      twilioVerifySid: config.get('twilioVerifySid') || '',
    };

    // Legacy compat
    twilioConf.twilioTestPhone = Array.isArray(twilioConf.twilioTestPhone) ? twilioConf.twilioTestPhone : [twilioConf.twilioTestPhone];

    await Parse.Config.save(twilioConf, {
      twilioAccountSid: true,
      twilioApplicationSid: true,
      twilioAuthToken: true,
      twilioTestPhone: true,
      twilioVerifySid: true,
    });
    return twilioConf;
  }

  public static async init() {
    await this.getConfig();

    Parse.Cloud.define(`twilio:checkVerification`, async (request) => {
      const config = await AppTwilio.getConfig();
      const accountSid: string = config.twilioAccountSid;
      const authToken: string = config.twilioAuthToken;
      const verifySid: string = config.twilioVerifySid;
      const client = new Twilio(accountSid, authToken);

      const { phone, code } = request.params;
      const isTester = phone && (phone as string).includes('0000000000');
      let status = isTester ? 'approved' : 'unknown';

      if (!isTester) {
        const verification = await client.verify.services(verifySid)
          .verificationChecks
          .create({ to: phone, code });

        status = verification.status;
      } else {
        console.log('Tester logged in');
      }

      return {
        status,
        password: status === 'approved' ? await generateUserPassword(phone) : undefined
      };
    });

    Parse.Cloud.define(`twilio:getVerifiedNumbers`, async () => {
      return {
        numbers: await AppTwilio.getAccountPhoneNumbers()
      };
    });

    Parse.Cloud.define(`twilio:sendVerificationSms`, async (request) => {
      const config = await AppTwilio.getConfig();
      const accountSid: string = config.twilioAccountSid;
      const authToken: string = config.twilioAuthToken;
      const verifySid: string = config.twilioVerifySid;
      const client = new Twilio(accountSid, authToken);

      const { phone } = request.params;
      const isTester = phone && (phone as string).includes('0000000000');
      if (isTester) return 'Welcome tester';

      const verification = await client.verify.services(verifySid)
        .verifications
        .create({ to: phone, channel: 'sms' });
      return verification.sid;
    });
  }
}

/**
 * Get the password for a user account.
 * If the user does not exist, it will be created.
 * If the user exists, their password will be changed.
 * @param phone User's phone number (expected to be the same as their username)
 * @returns New generated password
 */
async function generateUserPassword(phone: string): Promise<string> {
  const password = generateRandomPassword();
  const user = await new Parse.Query(Parse.User)
    .equalTo('username', phone)
    .first({ useMasterKey: true });
  try {
    if (!user) {
      await Parse.User.signUp(phone, password, { phone }, { useMasterKey: true });
    } else {
      user.setPassword(password);
      await user.save(null, { useMasterKey: true });
    }
  } catch (e) {
    if (e.code === Parse.Error.USERNAME_TAKEN) {
      user.setPassword(password);
      await user.save(null, { useMasterKey: true });
    }
    throw e;
  }
  return password;
}
