import { readFileSync } from 'fs';

const secretFile = process.env.WPP_SECRET_KEY_FILE;
let secretFromFile: string | undefined;
if (secretFile) {
  try {
    secretFromFile = readFileSync(secretFile, 'utf8').trim();
  } catch (error) {
    secretFromFile = undefined;
  }
}

const publicUrl = process.env.WPP_PUBLIC_URL || process.env.WPP_HOST || 'http://localhost';
let derivedHost = publicUrl;
let derivedPort = process.env.WPP_PORT || '21465';
try {
  const parsed = new URL(publicUrl);
  derivedHost = `${parsed.protocol}//${parsed.hostname}`;
  derivedPort = parsed.port || (parsed.protocol === 'https:' ? '443' : '80');
} catch (error) {
  // keep defaults
}

export default {
  secretKey: process.env.WPP_SECRET_KEY || secretFromFile || 'THISISMYSECURETOKEN',
  host: derivedHost,
  port: derivedPort,
  deviceName: 'Dialogix WPPConnect',
  poweredBy: 'WPPConnect-Server',
  startAllSession: true,
  tokenStoreType: 'file',
  maxListeners: 15,
  customUserDataDir: './userDataDir/',
  webhook: {
    url: process.env.WPP_WEBHOOK_URL || null,
    autoDownload: true,
    uploadS3: false,
    readMessage: true,
    allUnreadOnStart: false,
    listenAcks: true,
    onPresenceChanged: true,
    onParticipantsChanged: true,
    onReactionMessage: true,
    onPollResponse: true,
    onRevokedMessage: true,
    onLabelUpdated: true,
    onSelfMessage: false,
  },
  chatwoot: {
    sendQrCode: true,
    sendStatus: true,
  },
  archive: {
    enable: false,
    waitTime: 10,
    daysToArchive: 45,
  },
  log: {
    level: 'silly',
    logger: ['console', 'file'],
  },
  createOptions: {
    browserArgs: [
      '--disable-web-security',
      '--no-sandbox',
      '--disable-web-security',
      '--aggressive-cache-discard',
      '--disable-cache',
      '--disable-application-cache',
      '--disable-offline-load-stale-cache',
      '--disk-cache-size=0',
      '--disable-background-networking',
      '--disable-default-apps',
      '--disable-extensions',
      '--disable-sync',
      '--disable-translate',
      '--hide-scrollbars',
      '--metrics-recording-only',
      '--mute-audio',
      '--no-first-run',
      '--safebrowsing-disable-auto-update',
      '--ignore-certificate-errors',
      '--ignore-ssl-errors',
      '--ignore-certificate-errors-spki-list',
    ],
  },
  mapper: {
    enable: false,
    prefix: 'dialogix-',
  },
  db: {
    mongodbDatabase: 'tokens',
    mongodbCollection: '',
    mongodbUser: '',
    mongodbPassword: '',
    mongodbHost: '',
    mongoIsRemote: true,
    mongoURLRemote: '',
    mongodbPort: 27017,
    redisHost: 'localhost',
    redisPort: 6379,
    redisPassword: '',
    redisDb: 0,
    redisPrefix: 'docker',
  },
  aws_s3: {
    region: 'sa-east-1',
    access_key_id: null,
    secret_key: null,
    defaultBucketName: null,
  },
};
