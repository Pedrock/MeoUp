// @flow
const querystring = require('querystring');
const rp = require('request-promise-native');
const { OAuth } = require('oauth-libre');

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

  getOptions (requestMethod: 'get' | 'post' | 'put' | 'delete', endpoint: string | Array<string>, params?: Object = {}) {
    const options = {
      oauth: this.config.oauth,
      method: requestMethod,
      uri: endpoint instanceof Array ? endpoint.join('') : endpoint,
      timeout: 0,
      form: undefined
    };

    const qstring = querystring.stringify(params);

    if (options.method === 'post') {
      options.form = qstring;
    } else {
      options.uri += ((qstring !== '') ? ['?', qstring].join('') : qstring);
    }

    return options;
  };

  accountInfo () {
    const { endpoint } = this.config.api;
    return rp(this.getOptions('get', [endpoint, 'Account/Info']));
  }

  getUploadPipe (path: string) {
    const { root, content_endpoint: contentEndpoint } = this.config.api;
    if (path && !path.startsWith('/')) path = '/' + path;
    return rp(this.getOptions('put', [contentEndpoint, 'Files/', root, path]));
  };

  share (path: string) {
    const { root, content_endpoint: contentEndpoint } = this.config.api;
    if (path && !path.startsWith('/')) path = '/' + path;
    return rp(this.getOptions('post', [contentEndpoint, 'Shares/', root, path]));
  };

  delete (path: string) {
    const { root, content_endpoint: contentEndpoint } = this.config.api;
    if (path && !path.startsWith('/')) path = '/' + path;
    return rp(this.getOptions('post', [contentEndpoint, 'Fileops/Delete'], { root, path }));
  };
}
