import Vue from 'vue';
import Vuex from 'vuex';
import files from './modules/files';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    foo: 'bar',
  },
  mutations: {
    initialiseStore(state) {
      // Check if the ID exists
      if (localStorage.getItem('store')) {
        // Replace the state object with the stored item
        this.replaceState(
          Object.assign(state, JSON.parse(localStorage.getItem('store'))),
        );
      }
    },
  },
  actions: {

  },
  modules: {
    files,
  },
});

// Subscribe to store updates
store.subscribe((mutation, state) => {
  // Store the state object as a JSON string
  localStorage.setItem('store', JSON.stringify(state));
});

export default store;
