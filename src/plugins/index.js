import './vuetify';
import Vue from 'vue';
import './serial';
import FlagIcon from 'vue-flag-icon';
import CompileServer from './compile-server';

Vue.use(FlagIcon);

Vue.use(CompileServer);

CompileServer.on('console.log', console.log);
CompileServer.on('console.error', console.error);
