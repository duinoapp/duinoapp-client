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
    // eslint-disable-next-line no-param-reassign
    Vue.$currentStore = this;
    // eslint-disable-next-line no-param-reassign
    Vue.prototype.$currentStore = this;
    this.Vue = Vue;
  }

  async save(service) {
    const { Setting } = this.Vue.$FeathersVuex;
    let current = store.getters[`${service}/current`];
    console.log(service, current);
    if (!current) {
      current = { id: null };
    } else if (current.meta) {
      current.meta.currentAt = moment().toJSON();
      current.save();
    }
    let setting = await this.findSetting(service);
    if (!setting) setting = new Setting({ key: `currentStore.${service}.currentId` });
    setting.value = current.id;
    setting.save();
    if (service === 'projects') this.currentProjectFile();
  }

  async load(service) {
    let current = store.getters[`${service}/current`];
    if (current) return;
    const setting = await this.findSetting(service);
    if (!setting) return;
    [current] = await store.dispatch(`${service}/find`, { quey: { id: setting.value } });
    if (!current) return;
    store.commit(`${service}/setCurrent`, current);
  }

  async findSetting(service) {
    const { Setting } = this.Vue.$FeathersVuex;
    const settings = await Setting.find({ query: { key: `currentStore.${service}.currentId` } });
    if (!settings.length) return null;
    const setting = settings.shift();
    settings.forEach(set => set.remove()); // remove any duplicates
    return setting;
  }

  async currentProjectFile() {
    const { File } = this.Vue.$FeathersVuex;
    const project = store.getters['projects/current'];
    if (!project) return;
    const [file] = await File.find({ query: { projectId: project.id, main: true } });
    if (file) store.commit('files/setCurrent', file);
  }
}

export default new CurrentStore();
