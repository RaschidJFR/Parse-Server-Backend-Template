// This script runs independently from main.ts in Back4app. as this is the entry point for the
// Express app for web hosting and hooks. To test in development mode, require this module from main.ts.
// On Back4app it gets loaded automatically.

// Do not to install package express (unless you want to override that from Back4app or other BAS),
// just add its @types. For testing, install it globally and link it: `$npm i g express` then `$ npm link express`.
import { Express } from 'express';
// On Back4app, `app` is already defined in the global context.
declare var app: Express;

import * as VoiceResponse from 'twilio/lib/twiml/VoiceResponse';
import * as bodyParser from 'body-parser';
import { AppTwilio } from '@modules/twilio';
import { environment } from '@app/env';

type CallStatus = 'queued' | 'ringing' | 'in-progress' | 'canceled' | 'completed' | 'busy' | 'no-answer' | 'failed';

const debug = process.env.NODE_ENV == 'development';
console.log(`(${new Date().toISOString()}) loading express app in ${debug ? 'dev' : 'prod'} mode...`);


// Default route
app.get('/', async (_req, res) => {
  res.send('Hello!');
});

app.post(environment.webhooks.twilio.voice,
  bodyParser.urlencoded({ extended: false }),
  async (req, res) => {
    const from = req.body && req.body.From;
    const to = req.body && req.body.To;
    const voiceResponse = await getCallOrderResponse(from, to);

    res.type('text/xml');
    res.send(voiceResponse.toString());
  });

app.post(environment.webhooks.twilio.test,
  bodyParser.urlencoded({ extended: false }),
  async (_req, res) => {

    const voiceResponse = await getTestResponse();
    res.type('text/xml');
    res.send(voiceResponse.toString());
    console.log(voiceResponse.toString());
  });

app.post(environment.webhooks.twilio.status,
  bodyParser.urlencoded({ extended: false }),
  async (req, res) => {
    const direction = req.body && req.body.Direction;
    const callStatus: CallStatus = req.body && req.body.CallStatus;
    const to = req.body && req.body.To;
    const from = req.body && req.body.From;

    const isFinished = callStatus === 'busy'
      || callStatus === 'canceled'
      || callStatus === 'completed'
      || callStatus === 'failed'
      || callStatus === 'no-answer';

    if (isFinished) {
      // do something when call is finished
    }

    res.sendStatus(200);
  });

// Start listening if on local server
if (debug) {
  const environment = require('@app/env').environment;
  const express = require('express');

  // Serve system page templates on `/action`
  app.use('/action', express.static(environment.assetsPath + '/templates/system/pages'));

  // Start app
  app.listen(7007, () => console.log(`Development app listening on port ${7007}\n`));
}

console.log('express app loaded\n');

/**
 * Connect a user to another user or service
 */
async function getCallOrderResponse(callingNumber: string, calledNumber: string): Promise<VoiceResponse> {
  const voiceResponse = new VoiceResponse();
  try {

    // do something

  } catch (e) {
    console.error(e);
    voiceResponse.reject({ reason: e.toString() });
  }
  return voiceResponse;
}

async function getTestResponse() {
  const config = await AppTwilio.getConfig();

  const verifiedNumbers: string[] = await AppTwilio.getAccountPhoneNumbers();

  const voiceResponse = new VoiceResponse();
  voiceResponse.dial({ callerId: verifiedNumbers[0] }).number(config.twilioTestPhone[0]);
  voiceResponse.say({ language: 'es-MX' }, 'Mensaje automático: si tuviste respuesta, felicidades, la prueba ha sido exitosa.');
  voiceResponse.say({ language: 'es-MX' }, 'Si no escuchaste sonar el tono, es probable que te falte configurar un número de prueba en el panel de control.');
  voiceResponse.pause();
  return voiceResponse;
}
