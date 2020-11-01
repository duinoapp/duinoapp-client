import feathersClient, { makeServicePlugin, BaseModel } from '../feathers-client';
// eslint-disable-next-line import/named
import { genId, meta, settingsDefaults } from '../tools';

class Setting extends BaseModel {
  // Required for $FeathersVuex plugin to work after production transpile.
  static modelName = 'Setting'

  // Define default properties here
  static instanceDefaults(data) {
    return {
      uuid: genId(data.key, 'settings'),
      key: data.key,
      value: null,
      ...meta(),
    };
  }

  static setupInstance(inst) {
    if (settingsDefaults[inst.key]) {
      // eslint-disable-next-line no-param-reassign
      inst.value = {
        ...settingsDefaults[inst.key],
        ...(inst.value || {}),
      };
    }
    return inst;
  }
}
const servicePath = 'settings';
const servicePlugin = makeServicePlugin({
  Model: Setting,
  service: feathersClient.service(servicePath),
  servicePath,
});

// Setup the client-side Feathers hooks.
feathersClient.service(servicePath).hooks({
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
});

export default servicePlugin;
