import feathersClient, { makeServicePlugin, BaseModel } from '../feathers-client';
// eslint-disable-next-line import/named
import { genId, meta } from '../tools';

class Server extends BaseModel {
  // Required for $FeathersVuex plugin to work after production transpile.
  static modelName = 'Server'

  // Define default properties here
  static instanceDefaults(data) {
    return {
      uuid: genId(data.address, 'servers'),
      name: '',
      address: '',
      location: '',
      country: 'AU',
      owner: '',
      website: '',
      description: '',
      ping: -1,
      isCustom: true,
      ...meta(),
    };
  }
}
const servicePath = 'servers';
const servicePlugin = makeServicePlugin({
  Model: Server,
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
