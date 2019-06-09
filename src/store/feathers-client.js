import feathers from '@feathersjs/feathers';
import local from 'feathers-localstorage';

const app = feathers();
const serviceConfig = { storage: window.localStorage, id: '_id' };

app.use('/projects', local(serviceConfig));
app.use('/files', local(serviceConfig));
app.use('/servers', local(serviceConfig));
app.use('/cores', local(serviceConfig));
app.use('/boards', local(serviceConfig));
app.use('/libraries', local(serviceConfig));
app.use('/settings', local(serviceConfig));

export default app;
