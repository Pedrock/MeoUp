const querystring = require('querystring')
const rp = require('request-promise-native')
const { OAuth } = require('oauth-libre')

const OAUTH_VERSION = '1.0'
const SIGNATURE_METHOD = 'HMAC-SHA1'

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
}

module.exports.MeoCloudOAuth = function () {
  return new OAuth(defaultConfig.oauth.request_token_endpoint, defaultConfig.oauth.access_token_endpoint,
    defaultConfig.oauth.consumer_key, defaultConfig.oauth.consumer_secret, OAUTH_VERSION, 'oob', SIGNATURE_METHOD)
}

module.exports.MeoCloud = function (credentials) {
  this.config = Object.assign({}, defaultConfig)
  this.config.oauth.token = credentials.token
  this.config.oauth.token_secret = credentials.token_secret

  const { endpoint, content_endpoint: contentEndpoint, root } = this.config.api

  const getOptions = (requestMethod, endpoint, params) => {
    params = params !== undefined ? params : {}

    const options = {
      oauth: this.config.oauth,
      method: requestMethod,
      uri: endpoint instanceof Array ? endpoint.join('') : endpoint,
      timeout: 0
    }

    const qstring = querystring.stringify(params)

    if (options.method === 'post') {
      options.form = qstring
    } else {
      options.uri += ((qstring !== '') ? ['?', qstring].join('') : qstring)
    }

    return options
  }

  this.accountInfo = () => rp(getOptions('get', [endpoint, 'Account/Info']))

  this.getUploadPipe = (path) => {
    if (path && !path.startsWith('/')) path = '/' + path
    return rp(getOptions('put', [contentEndpoint, 'Files/', root, path]))
  }

  this.share = (path) => {
    if (path && !path.startsWith('/')) path = '/' + path
    return rp(getOptions('post', [contentEndpoint, 'Shares/', root, path]))
  }

  this.delete = (path) => {
    if (path && !path.startsWith('/')) path = '/' + path
    return rp(getOptions('post', [contentEndpoint, 'Fileops/Delete'], { root, path }))
  }
}
