import EventEmitter from 'events';
import io from 'socket.io-client';
import store from '../store';
import serial from './serial';

class CompileServer extends EventEmitter {
  constructor() {
    super();
    this.url = 'http://localhost:3000';
    this.socket = null;
    store.subscribe((mutation) => {
      if (mutation.type !== 'servers/setCurrentId') return;
      this.setServer(store.getters['servers/current']);
    });
  }

  install(Vue) {
    Vue.prototype.$compiler = this;
  }

  setServer(serverConfig) {
    this.url = serverConfig.address;
    this.load();
  }

  load() {
    const socket = io.connect(this.url);
    socket.emit();
  }

  connect() {
    this.socket = io(this.address);
    this.socket.emitAsync = (action, payload) => new Promise((resolve) => {
      if (payload) this.socket.emit(action, payload, resolve);
      else this.socket.emit(action, resolve);
    });
    this.socket.on('console.log', msg => this.emit('console.log', msg));
  }

  disconnect() {
    this.socket.close();
    this.socket = null;
  }

  _sendFiles() {
    const project = store.getters['projects/current'];
    const files = store.getters['files.find']({ query: { _id: { $in: project.files } } }).data;
    return this.socket.emitAsync('files.new', files.map(f => ({ ...f, name: `${project.ref}/${f.name}` })));
  }

  _setSketch() {
    const project = store.getters['projects/current'];
    return this.socket.emitAsync('files.setSketch', `${project.ref}/`);
  }

  _installCore(coreId) {
    if (!coreId) {
      const board = store.getters['boards/current'];
      const [org, series] = board.fqbn.split(':');
      // eslint-disable-next-line no-param-reassign
      coreId = `${org}:${series}`;
    }
    return this.socket.emitAsync('core.install', coreId);
  }

  _installLibs() {
    const libs = store.getters['libs/find']({ query: { enabled: true } }).data;
    return Promise.all(libs.map(lib => this.socket.emitAsync('lib.install', `${lib.name}${lib.version !== 'latest' ? `@${lib.version}` : ''}`)));
  }

  // eslint-disable-next-line class-methods-use-this
  _getFqbn() {
    const board = store.getters['boards/current'];
    return Object.keys(board.selected).reduce((a, i) => `${a}:${i}=${board.selected[i]}`, board.fqbn);
  }

  async compile(close = true) {
    const mod = close ? 2 : 1;
    this.emit('console.clear');
    this.emit('console.progress', { percent: 0 * mod, message: 'Connecting to compile server...' });
    await this.connect();
    this.emit('console.progress', { percent: 0.05 * mod, message: 'Uploading current code files...' });
    await this._setSketch();
    await this._sendFiles();
    this.emit('console.progress', { percent: 0.1 * mod, message: 'Configuring selected circuit board...' });
    await this._installCore();
    this.emit('console.progress', { percent: 0.15 * mod, message: 'Installing Libraries...' });
    await this._installLibs();
    this.emit('console.progress', { percent: 0.25 * mod, message: 'Compiling code...' });
    await this.socket.emitAsync('program.compile', { fqbn: this._getFqbn() });
    if (close) {
      this.disconnect();
      this.emit('console.progress', { percent: 1, message: 'Done!' });
    }
  }

  async upload() {
    if (!serial || !serial.currentDevice) {
      this.emit('console.error', { message: 'Device that you want to program needs to be plugged in.', cause: 'Disconnected device.' });
    }
    const id = Math.random().toString(16).substr(2);
    await this.compile();
    this.socket.on('');
  }
}

export default new CompileServer();
