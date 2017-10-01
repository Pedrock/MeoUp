// @flow
const stream = require('stream');
const querystring = require('querystring');
const rp = require('request-promise-native');
const { OAuth } = require('oauth-libre');
const { WritableStreamBuffer } = require('stream-buffers');

const OAUTH_VERSION = '1.0';
const SIGNATURE_METHOD = 'HMAC-SHA1';

const defaultConfig = {
  api: {
    root: 'sandbox',
    storage: '/1',
    endpoint: 'https://api.meocloud.pt/1/',
    content_endpoint: 'https://api-content.meocloud.pt/1/'
  },
  oauth: {
    request_token_endpoint: 'https://meocloud.pt/oauth/request_token',
    access_token_endpoint: 'https://meocloud.pt/oauth/access_token',
    consumer_key: process.env.MEOCLOUD_CONSUMER_KEY,
    consumer_secret: process.env.MEOCLOUD_CONSUMER_SECRET
  }
};

export function MeoCloudOAuth () {
  return new OAuth(defaultConfig.oauth.request_token_endpoint, defaultConfig.oauth.access_token_endpoint,
    defaultConfig.oauth.consumer_key, defaultConfig.oauth.consumer_secret, OAUTH_VERSION, 'oob', SIGNATURE_METHOD);
}

export class MeoCloud {
  config: { oauth: Object, api: Object };

  constructor (credentials: { token: string, token_secret: string }) {
    this.config = Object.assign({}, defaultConfig);
    this.config.oauth.token = credentials.token;
    this.config.oauth.token_secret = credentials.token_secret;
  }

  getOptions (requestMethod: 'get' | 'post' | 'put' | 'delete', endpoint: string | Array<string>, params?: Object = {}, body?: Buffer | string) {
    const options = {
      oauth: this.config.oauth,
      method: requestMethod,
      uri: endpoint instanceof Array ? endpoint.join('') : endpoint,
      timeout: 0,
      form: undefined,
      body: undefined
    };

    if (body !== undefined) {
      options.body = body;
    }

    const qstring = querystring.stringify(params);
    if (options.method === 'post') {
      options.form = qstring;
    } else {
      options.uri += ((qstring !== '') ? ['?', qstring].join('') : qstring);
    }

    return options;
  }

  accountInfo () {
    const { endpoint } = this.config.api;
    return rp(this.getOptions('get', [endpoint, 'Account/Info']));
  }

  getUploadPipe (path: string) {
    const { root, content_endpoint: contentEndpoint } = this.config.api;
    if (path && !path.startsWith('/')) path = '/' + path;
    return rp(this.getOptions('put', [contentEndpoint, 'Files/', root, path]));
  }

  getChuckedUploadStream (path: string) {
    return new ChuckedUploadStream(this, path);
  }

  share (path: string) {
    const { root, content_endpoint: contentEndpoint } = this.config.api;
    if (path && !path.startsWith('/')) path = '/' + path;
    return rp(this.getOptions('post', [contentEndpoint, 'Shares/', root, path]));
  }

  delete (path: string) {
    const { root, content_endpoint: contentEndpoint } = this.config.api;
    if (path && !path.startsWith('/')) path = '/' + path;
    return rp(this.getOptions('post', [contentEndpoint, 'Fileops/Delete'], { root, path }));
  }
}

const chuckSize = 25000000; // 25 MB

class ChuckedUploadStream extends stream.Writable {
  api: MeoCloud;
  path: string;
  uploadId: string;
  offset: number;
  buffer: WritableStreamBuffer;
  aborted: boolean;

  constructor (api: MeoCloud, path: string) {
    super({ highWaterMark: 2 * chuckSize });
    this.api = api;
    this.path = path;
    if (this.path && !this.path.startsWith('/')) {
      this.path = '/' + this.path;
    }
    this.offset = 0;
    this.buffer = new WritableStreamBuffer({
      initialSize: chuckSize,
      incrementAmount: (1000000) // 1 MB
    });
  }

  sendChuck (chunk: string | Buffer) {
    const { content_endpoint: contentEndpoint } = this.api.config.api;
    const { uploadId: upload_id, offset } = this;
    const params = this.uploadId ? { upload_id, offset } : { offset };
    return rp(this.api.getOptions('put', [contentEndpoint, 'ChunkedUpload'], params, chunk));
  }

  processBuffer (callback: Function) {
    if (this.buffer.size() === 0) {
      return callback();
    }
    const chunk = this.buffer.getContents(chuckSize);
    this.sendChuck(chunk)
    .then(JSON.parse)
    .then((json) => {
      this.uploadId = json.upload_id || this.uploadId;
      this.offset = json.offset;
      console.log(json);
      console.log('Chunk sent!\n');
      callback();
    })
    .catch(err => {
      console.error(err);
      callback(err);
    });
  }

  _write (chunk: string | Buffer, encoding: any, callback: Function): any {
    this.buffer.write(chunk);
    if (this.buffer.size() >= chuckSize) {
      this.processBuffer(callback);
    } else {
      callback();
    }
  }

  _final (callback: Function) {
    console.log('_final');
    if (this.aborted) {
      return callback();
    }
    this.processBuffer((err) => {
      if (err) {
        return callback(err);
      }
      if (this.uploadId === undefined) {
        console.error('No upload ID');
        return callback(new Error('No upload ID'));
      }
      const { root, content_endpoint: contentEndpoint } = this.api.config.api;
      const params = { upload_id: this.uploadId };
      rp(this.api.getOptions('post', [contentEndpoint, 'CommitChunkedUpload/', root, this.path], params))
        .then(() => callback());
    });
  }

  abort () {
    this.aborted = true;
  }
}
