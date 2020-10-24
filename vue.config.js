const IgnoreNotFoundExportPlugin = require('ignore-not-found-export-webpack-plugin');

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
    ],
  }
};
