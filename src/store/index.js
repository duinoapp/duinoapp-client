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
    donateMenu: false,
    serialTab: 'program',
    currentServer: window.localStorage.currentServer || null,
    currentBoard: window.localStorage.currentBoard || '51b2904f-b7fd-3df8-9330-0ef1b852b816',
    currentProject: window.localStorage.currentProject || null,
    currentFile: window.localStorage.currentFile || null,
  },
  mutations: {
    toggleSerialShelf(state, val) {
      state.serialShelf = typeof val === 'boolean' ? val : !state.serialShelf;
    },
    toggleDonateMenu(state, val) {
      state.donateMenu = typeof val === 'boolean' ? val : !state.donateMenu;
    },
    setSerialTab(state, val) {
      state.serialTab = val;
    },
    setCurrentServer(state, uuid) {
      window.localStorage.currentServer = uuid;
      state.currentServer = uuid;
    },
    setCurrentBoard(state, uuid) {
      window.localStorage.currentBoard = uuid;
      state.currentBoard = uuid;
    },
    setCurrentProject(state, uuid) {
      window.localStorage.currentProject = uuid;
      state.currentProject = uuid;
    },
    setCurrentFile(state, uuid) {
      window.localStorage.currentFile = uuid;
      state.currentFile = uuid;
    },
  },
  getters: {
    serialShelf(state) { return state.serialShelf; },
    donateMenu(state) { return state.donateMenu; },
    serialTab(state) { return state.serialTab; },
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
