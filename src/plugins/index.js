import Vue from 'vue';
import './serial';
import FlagIcon from 'vue-flag-icon';
import CompileServer from './compile-server';
import CurrentStore from './current-store';
import Bundler from './bundler';

Vue.use(FlagIcon);

Vue.use(CurrentStore);
Vue.use(CompileServer);
Vue.use(Bundler);

// CompileServer.on('console.log', console.log);
// CompileServer.on('console.error', console.error);
