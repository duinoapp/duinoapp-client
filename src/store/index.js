import Vue from 'vue';
import Vuex from 'vuex';
import feathersVuex from 'feathers-vuex';
import merge from 'lodash/merge';
import feathersClient from './feathers-client';

const { service, FeathersVuex } = feathersVuex(feathersClient, { idField: '_id' });

Vue.use(Vuex);
Vue.use(FeathersVuex);

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {

  },
  mutations: {

  },
  actions: {

  },
  modules: {

  },

  plugins: [
    service('projects', {
      instanceDefaults: {
        name: '',
        ref: '',
        desc: '',
      },
    }),
    service('files', {
      instanceDefaults: {
        name: '',
        ref: '',
        body: '',
        localPath: null,
        project: '',
      },
    }),
    service('servers', {
      instanceDefaults: {
        name: '',
        address: '',
        location: '',
        country: 'AU',
        owner: '',
        website: '',
        description: '',
        ping: -1,
        isCustom: true,
      },
    }),
    service('boards', {
      instanceDefaults() {
        return {
          get config() {
            if (!this.config_options) return {};
            const config = {};
            this.config_options.forEach((con) => {
              config[con.option] = (con.values.find(val => val.selected) || {}).value;
            });
            return config;
          },
          get props() {
            if (!this.properties) return {};
            if (!this.config_options || !this.properties.menu) return this.properties;
            return Object.keys(this.config).reduce((a, i) => merge(
              a,
              ((this.properties.menu[i] || {})[this.config[i]] || {}),
            ), this.properties);
          },
        };
      },
    }),
    service('cores'),
    service('libraries'),
    service('settings', {
      instanceDefaults: {
        key: '',
        value: null,
      },
    }),
  ],
});

export default store;
