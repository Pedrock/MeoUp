const path = require('path');

require('dotenv').config({
  silent: true,
  path: process.env.NODE_ENV === 'production' ? '.prod.env' : '.dev.env'
});

module.exports = {
  build: {
    vendor: ['vuetify', 'jwt-decode', 'axios']
  },
  buildDir: 'dist/client',
  cache: true,
  css: [{ src: '~assets/style/app.styl', lang: 'styl' }],
  env: {
    HOST: process.env.HOST,
    PORT: process.env.PORT
  },
  head: {
    title: 'meoup',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Nuxt.js project' }
    ],
    link: [
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons' }
    ]
  },
  manifest: {
    name: 'meoup',
    description: 'Website which allows users to transfer files and youtube videos from a URL to a MeoCloud account.',
    theme_color: '#188269'
  },
  modules: [
    '@nuxtjs/pwa',
    '@nuxtjs/component-cache',
    '@nuxtjs/font-awesome'
  ],
  plugins: [
    '~plugins/vuetify.js',
    { src: '~plugins/socket.io', ssr: false }
  ],
  render: {
    static: {
      maxAge: '1y',
      setHeaders (res, path) {
        if (path.includes('sw.js')) {
          res.setHeader('Cache-Control', 'public, max-age=0');
        }
      }
    }
  },
  router: {
    middleware: ['ssr-cookie']
  },
  srcDir: path.resolve(__dirname, 'src', 'client')
};
