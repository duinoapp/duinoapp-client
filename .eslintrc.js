module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
  ],
  plugins: [
    'vuetify',
  ],
  rules: {
    'max-len': [
      'warn',
      {
        ignoreUrls: true,
        ignoreComments: true,
        ignoreRegExpLiterals: true,
        code: 128,
      },
    ],
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-underscore-dangle': 'off',
    'vuetify/no-deprecated-classes': 'warn',
    'vue/valid-v-slot': 'off',
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
};
