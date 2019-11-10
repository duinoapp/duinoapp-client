import moment from 'dayjs';
import store from '../store';

class CurrentStore {
  constructor() {
    store.subscribe((mutation) => {
      if (/\/setCurrent$/.test(mutation.type)) {
        this.save(mutation.type.split('/').shift());
      }
    });
  }

  install(Vue) {
    const { Setting } = Vue.$FeathersVuex;
    Setting.find();
    // eslint-disable-next-line no-param-reassign
    Vue.$currentStore = this;
    // eslint-disable-next-line no-param-reassign
    Vue.prototype.$currentStore = this;
    this.Vue = Vue;
  }

  save(service) {
    const { Setting } = this.Vue.$FeathersVuex;
    let current = store.getters[`${service}/current`];
    if (!current) {
      current = { id: null };
    } else if (current.meta) {
      current.meta.currentAt = moment().toJSON();
      current.save();
    }
    let [setting] = Setting.findInStore({ query: { key: `currentStore.${service}.currentId` } }).data;
    if (!setting) setting = new Setting({ key: `currentStore.${service}.currentId` });
    setting.value = current.id;
    setting.save();
  }

  async load(service) {
    const { Setting } = this.Vue.$FeathersVuex;
    let current = store.getters[`${service}/current`];
    if (current) return;
    const [setting] = Setting.findInStore({ query: { key: `currentStore.${service}.currentId` } }).data;
    if (!setting) return;
    [current] = await store.dispatch(`${service}/find`, { quey: { id: setting.value } });
    if (!current) return;
    store.commit(`${service}/setCurrent`, current);
  }
}

export default new CurrentStore();
