import feathersClient, { makeServicePlugin, BaseModel } from '../feathers-client';
// eslint-disable-next-line import/named
import { genId, meta } from '../tools';

class Setting extends BaseModel {
  // Required for $FeathersVuex plugin to work after production transpile.
  static modelName = 'Setting'

  // Define default properties here
  static instanceDefaults(data) {
    return {
      id: genId(data.key, 'settings'),
      key: '',
      value: null,
      ...meta(),
    };
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
