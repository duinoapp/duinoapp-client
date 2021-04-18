import Vue from 'vue';
import './serial';
import CompileServer from './compile-server';
import CurrentStore from './current-store';
import Bundler from './bundler';
import Uploader from './uploader';

Vue.use(CurrentStore);
Vue.use(CompileServer);
Vue.use(Bundler);
Vue.use(Uploader);

// CompileServer.on('console.log', console.log);
// CompileServer.on('console.error', console.error);
