import Vue from 'vue';
import Vuex from 'vuex';
import feathersVuex from 'feathers-vuex';
import uuid3 from 'uuid/v3';
import merge from 'lodash/merge';
import moment from 'dayjs';
import feathersClient from './feathers-client';

const { service, FeathersVuex } = feathersVuex(feathersClient, { idField: '_id' });

Vue.use(Vuex);
Vue.use(FeathersVuex);

Vue.use(Vuex);

const namespaces = {
  projects: '12c23615-bdde-4b08-a9b5-eff94ee77c64',
  files: 'e54e6456-3120-4d4c-8e91-cf3054c6790b',
  servers: '6e2c0d79-f9da-4840-bdc2-a4beb6eb3383',
  cores: 'ca286417-59ec-4a98-bfff-26b0c722ecca',
  boards: 'd0d642b5-5d32-46a7-a269-96e5776046a2',
  libraries: '404e901a-0521-47f5-8fcf-74f7f7a1dfc9',
  settings: 'db2c24d8-1d30-4176-bf09-709f4c251239',
};

const genId = (value, serv) => uuid3(value, namespaces[serv]);
const meta = () => ({
  get createdAt() {
    return () => moment(this.meta.createdAt);
  },
  get updatedAt() {
    return () => moment(this.meta.createdAt);
  },
  get currentAt() {
    return () => moment(this.meta.createdAt);
  },
  meta: {
    createdAt: moment().toJSON(),
    updatedAt: moment().toJSON(),
    currentAt: moment().toJSON(),
  },
});

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
      instanceDefaults(data) {
        return {
          id: genId(data.ref, 'projects'),
          name: '',
          desc: '',
          localPath: null,
          ...meta(),
        };
      },
    }),
    service('files', {
      instanceDefaults(data) {
        return {
          id: genId(`${data.projectId}:${data.ref}`, 'files'),
          name: '',
          ref: '',
          body: '',
          contentType: '',
          localPath: null,
          projectId: '',
          main: false,
          ...meta(),
        };
      },
    }),
    service('servers', {
      instanceDefaults(data) {
        return {
          id: genId(data.address, 'servers'),
          name: '',
          address: '',
          location: '',
          country: 'AU',
          owner: '',
          website: '',
          description: '',
          ping: -1,
          isCustom: true,
          ...meta(),
        };
      },
    }),
    service('boards', {
      instanceDefaults(data) {
        return {
          id: genId(data.fqbn, 'boards'),
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
          ...meta(),
        };
      },
    }),
    service('cores', {
      instanceDefaults(data) {
        return {
          id: genId(data.coreId, 'cores'),
          ...meta(),
        };
      },
    }),
    service('libraries', {
      instanceDefaults(data) {
        return {
          id: genId(data.name, 'libraries'),
          ...meta(),
        };
      },
    }),
    service('settings', {
      instanceDefaults(data) {
        return {
          id: genId(data.key, 'settings'),
          key: '',
          value: null,
          ...meta(),
        };
      },
    }),
  ],
});

store.namespaces = namespaces;

export default store;
