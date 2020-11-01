import feathersClient, { makeServicePlugin, BaseModel } from '../feathers-client';
// eslint-disable-next-line import/named
import { genId, meta } from '../tools';

class File extends BaseModel {
  // Required for $FeathersVuex plugin to work after production transpile.
  static modelName = 'File'

  // Define default properties here
  static instanceDefaults(data) {
    return {
      uuid: genId(`${data.projectId}:${data.ref}`, 'files'),
      name: '',
      ref: '',
      body: '',
      contentType: '',
      localPath: null,
      projectId: '',
      main: false,
      ...meta(),
    };
  }
}
const servicePath = 'files';
const servicePlugin = makeServicePlugin({
  Model: File,
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
