import merge from 'lodash/merge';
import feathersClient, { makeServicePlugin, BaseModel } from '../feathers-client';
// eslint-disable-next-line import/named
import { genId, meta } from '../tools';

class Board extends BaseModel {
  // Required for $FeathersVuex plugin to work after production transpile.
  static modelName = 'Board'

  // Define default properties here
  // eslint-disable-next-line class-methods-use-this
  static instanceDefaults(data) {
    return {
      uuid: genId(data.fqbn, 'boards'),
      get config() {
        if (!this.config_options) return {};
        const config = {};
        this.config_options.forEach((con) => {
          config[con.option] = (
            con.values.find((val) => val.selected)
            || con.values.find((val) => val.isDefault)
            || {}
          ).value;
        });
        return config;
      },
      get props() {
        if (!this.properties) return {};
        if (!this.config_options || !this.properties.menu) return this.properties;
        return Object.keys(this.config).reduce((a, i) => merge(
          a,
          ((this.properties.menu[i] || {})[this.config[i]] || {}),
        ), this.properties);
      },
      ...meta(),
    };
  }
}
const servicePath = 'boards';
const servicePlugin = makeServicePlugin({
  Model: Board,
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
