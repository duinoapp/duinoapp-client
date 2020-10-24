const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  target: 'web',
  entry: {
    main: path.join(__dirname, 'main.js'),
  },
  output: {
    path: path.join(__dirname, 'build/'),
    filename: '[name].bundle.js',
  },
  plugins: [
    new CopyWebpackPlugin({ patterns: [{ from: 'static' }] }),
  ],
};
