const IgnoreNotFoundExportPlugin = require('ignore-not-found-export-webpack-plugin');
const MonacoEditorPlugin = require('monaco-editor-webpack-plugin');
const manifestJSON = require('./public/manifest.json');

module.exports = {
  chainWebpack: (config) => {
    config.module
      .rule('raw')
      .test(/\.txt$/)
      .use('raw-loader')
      .loader('raw-loader')
      .end();
  },
  configureWebpack: {
    plugins: [
      new IgnoreNotFoundExportPlugin({ include: /FeathersVuexPagination/ }),
      new MonacoEditorPlugin({
        // https://github.com/Microsoft/monaco-editor-webpack-plugin#options
        languages: ['cpp', 'markdown'],
      }),
    ],
  },
  pwa: {
    themeColor: manifestJSON.theme_color,
    name: manifestJSON.short_name,
    msTileColor: manifestJSON.background_color,
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: 'service-worker.js',
    },
  },
};
