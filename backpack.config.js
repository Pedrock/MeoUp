const path = require('path');

module.exports = {
  webpack: (config, options, webpack) => {
    config.entry.main = path.resolve(__dirname, 'src', 'server', 'index.ts');
    config.output.path = path.resolve(__dirname, 'dist', 'server');
    config.module.rules.push({
      test: /\.tsx?$/,
      use: 'ts-loader',
      exclude: /node_modules/
    });
    config.resolve = {
      extensions: [ '.tsx', '.ts', '.js' ],
      alias: {
        '~': path.resolve(__dirname, 'src', 'server')
      }
    };
    return config;
  }
};
