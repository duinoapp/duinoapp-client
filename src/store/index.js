import Vue from 'vue';
import Vuex from 'vuex';
import feathersVuex from 'feathers-vuex';
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
        description: '',
        files: [],
        boards: [],
        libraries: [],
      },
    }),
    service('files', {
      instanceDefaults: {
        name: '',
        ref: '',
        content: '',
        localPath: null,
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
    service('boards'),
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
