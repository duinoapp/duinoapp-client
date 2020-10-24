import Vue from 'vue';
import Vuex from 'vuex';
import { FeathersVuex } from './feathers-client';

Vue.use(Vuex);
Vue.use(FeathersVuex);

const requireModule = require.context(
  // The path where the service modules live
  './services',
  // Whether to look in subfolders
  false,
  // Only include .js files (prevents duplicate imports`)
  /\.js$/,
);
const servicePlugins = requireModule
  .keys()
  .map((modulePath) => requireModule(modulePath).default);

const store = new Vuex.Store({
  state: {
    serialShelf: false,
    currentServer: window.localStorage.currentServer || null,
    currentBoard: window.localStorage.currentBoard || null,
    currentProject: window.localStorage.currentProject || null,
    currentFile: window.localStorage.currentFile || null,
  },
  mutations: {
    toggleSerialStore(state) {
      state.serialShelf = !state.serialShelf;
    },
    setCurrentServer(state, id) {
      window.localStorage.currentServer = id;
      state.currentServer = id;
    },
    setCurrentBoard(state, id) {
      window.localStorage.currentBoard = id;
      state.currentBoard = id;
    },
    setCurrentProject(state, id) {
      window.localStorage.currentProject = id;
      state.currentProject = id;
    },
    setCurrentFile(state, id) {
      window.localStorage.currentFile = id;
      state.currentSFile = id;
    },
  },
  getters: {
    serialShelf(state) { return state.serialShelf; },
    currentServer(state) { return state.currentServer; },
    currentBoard(state) { return state.currentBoard; },
    currentProject(state) { return state.currentProject; },
    currentFile(state) { return state.currentFile; },
  },
  actions: {

  },
  modules: {

  },

  plugins: [
    ...servicePlugins,
  ],
});

export default store;
