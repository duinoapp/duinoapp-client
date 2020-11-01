import feathersClient, { makeServicePlugin, BaseModel } from '../feathers-client';
// eslint-disable-next-line import/named
import { genId, meta } from '../tools';

class Library extends BaseModel {
  // Required for $FeathersVuex plugin to work after production transpile.
  static modelName = 'Library'

  // Define default properties here
  static instanceDefaults(data) {
    return {
      uuid: genId(data.name, 'libraries'),
      localPath: null,
      ...meta(),
    };
  }
}
const servicePath = 'libraries';
const servicePlugin = makeServicePlugin({
  Model: Library,
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
