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
    // eslint-disable-next-line no-param-reassign
    Vue.$currentStore = this;
    // eslint-disable-next-line no-param-reassign
    Vue.prototype.$currentStore = this;
    this.Vue = Vue;
  }

  async save(service) {
    const { Setting } = this.Vue.$FeathersVuex;
    let current = store.getters[`${service}/current`];
    if (!current) current = { id: null };
    let [setting] = await Setting.find({ query: { key: `currentStore.${service}.currentId` } });
    if (!setting) setting = new Setting({ key: `currentStore.${service}.currentId` });
    setting.value = current.id;
    await setting.save();
  }

  async load(service) {
    const { Setting } = this.Vue.$FeathersVuex;
    let current = store.getters[`${service}/current`];
    if (current) return;
    const [setting] = await Setting.find({ query: { key: `currentStore.${service}.currentId` } });
    if (!setting) return;
    [current] = await store.dispatch(`${service}/find`);
    if (!current) return;
    store.commit(`${service}/setCurrent`, current);
  }
}

export default new CurrentStore();
