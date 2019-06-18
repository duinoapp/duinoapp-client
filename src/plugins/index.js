import './vuetify';
import Vue from 'vue';
import './serial';
import CompileServer from './compile-server';

Vue.use(CompileServer);

CompileServer.on('console.log', console.log);
CompileServer.on('console.error', console.error);
