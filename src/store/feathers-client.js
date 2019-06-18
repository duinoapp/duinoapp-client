import feathers from '@feathersjs/feathers';
import local from 'feathers-localstorage';

const app = feathers();
const serviceConfig = { storage: window.localStorage, id: '_id', startId: 1 };

app.use('/projects', local({ ...serviceConfig, name: 'store-projects' }));
app.use('/files', local({ ...serviceConfig, name: 'store-files' }));
app.use('/servers', local({ ...serviceConfig, name: 'store-servers' }));
app.use('/cores', local({ ...serviceConfig, name: 'store-cores' }));
app.use('/boards', local({ ...serviceConfig, name: 'store-boards' }));
app.use('/libraries', local({ ...serviceConfig, name: 'store-libraries' }));
app.use('/settings', local({ ...serviceConfig, name: 'store-settings' }));

export default app;
