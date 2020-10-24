import Vue from 'vue';
import './plugins';
import vuetify from './plugins/vuetify';
import App from './App.vue';
import router from './router';
import store from './store/index';
import './registerServiceWorker';
import 'roboto-fontface/css/roboto/roboto-fontface.css';
import '@mdi/font/css/materialdesignicons.css';
import './assets/global.scss';

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
  beforeCreate() {
  },
}).$mount('#app');
