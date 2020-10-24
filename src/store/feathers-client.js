import feathers from '@feathersjs/feathers';
import feathersVuex from 'feathers-vuex';
import local from 'feathers-localstorage';

const feathersClient = feathers();

const serviceConfig = { storage: window.localStorage, id: '_id', startId: 1 };

feathersClient.use('/projects', local({ ...serviceConfig, name: 'store-projects' }));
feathersClient.use('/files', local({ ...serviceConfig, name: 'store-files' }));
feathersClient.use('/servers', local({ ...serviceConfig, name: 'store-servers' }));
feathersClient.use('/cores', local({ ...serviceConfig, name: 'store-cores' }));
feathersClient.use('/boards', local({ ...serviceConfig, name: 'store-boards' }));
feathersClient.use('/libraries', local({ ...serviceConfig, name: 'store-libraries' }));
feathersClient.use('/settings', local({ ...serviceConfig, name: 'store-settings' }));

export default feathersClient;

// Setting up feathers-vuex
const {
  makeServicePlugin, makeAuthPlugin, BaseModel, models, FeathersVuex,
} = feathersVuex(
  feathersClient,
  {
    serverAlias: 'api', // optional for working with multiple APIs (this is the default value)
    idField: '_id', // Must match the id field in your database table/collection
    whitelist: ['$regex', '$options'],
  },
);

export {
  makeAuthPlugin, makeServicePlugin, BaseModel, models, FeathersVuex,
};
