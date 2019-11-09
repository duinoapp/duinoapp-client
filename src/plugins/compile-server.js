import EventEmitter from 'events';
import io from 'socket.io-client';
import stats from 'stats-lite';
import store from '../store';
import serial from './serial';

const chunk = (arr, size) => Array.from(
  { length: Math.ceil(arr.length / size) },
  (v, i) => arr.slice(i * size, i * size + size),
);

class CompileServer extends EventEmitter {
  constructor() {
    super();
    this.url = 'http://localhost:3030';
    this.socket = null;
    store.subscribe((mutation) => {
      if (mutation.type !== 'servers/setCurrent') return;
      this.setServer(store.getters['servers/current']);
    });
  }

  install(Vue) {
    // eslint-disable-next-line no-param-reassign
    Vue.$compiler = this;
    // eslint-disable-next-line no-param-reassign
    Vue.prototype.$compiler = this;
    this.Vue = Vue;
    this.fetchServers();
  }

  async fetchServers() {
    const { Server } = this.Vue.$FeathersVuex;
    const res = await fetch('/servers.json');
    const servers = await res.json();
    await Promise.all(servers.map(async (serv) => {
      if ((await Server.find({ query: { address: serv } })).length) return;
      const server = new Server({ address: serv, isCustom: false });
      await server.save();
    }));
    const storedServers = await Promise.all((await Server.find()).map(async (server) => {
      const serverData = await this.pingServer(server.address);
      Object.keys(serverData).forEach((i) => {
        // eslint-disable-next-line no-param-reassign
        server[i] = serverData[i];
      });
      console.log(server);
      return server.patch();
    }));
    const { existingAddress } = window.localStorage;
    const existingServer = storedServers
      .find(serv => existingAddress && serv.address === existingAddress);
    if (existingServer && !store.getters['servers/current']) {
      store.commit('servers/setCurrent', existingServer);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  pingServer(url, timeout = 10000) {
    return new Promise((resolve) => {
      const sampleSize = 10;
      const socket = io(`${url}/ping`);
      const pings = [];
      let start;
      let serverData = {};
      const pingCB = (data) => {
        if (start) pings.push(Date.now() - start);
        start = Date.now();
        serverData = data;
        if (pings.length < sampleSize) return socket.emit('p', pingCB);
        if (pings.length > sampleSize) return Math.random();
        socket.disconnect();
        console.log(pings);
        if (stats.stdev(pings) > 200) return this.pingServer(url, timeout).then(resolve);
        return resolve({ ...serverData, ping: stats.mean(pings) });
      };
      socket.emit('p', pingCB);
      setTimeout(() => {
        if (pings.length > 0) return;
        socket.disconnect();
        resolve({ ...serverData, ping: -2 });
      }, timeout);
    });
  }

  setServer(serverConfig) {
    this.url = serverConfig.address;
    window.localStorage.existingAddress = this.url;
    console.log(`loading server: ${this.url}`);
    this.load();
  }

  async load() {
    const { Core, Board, Library } = this.Vue.$FeathersVuex;
    await this.connect();
    const cores = await this.socket.emitAsync('info.cores');
    const boards = (await this.socket.emitAsync('info.boards')).map(board => ({ ...board, id: board.fqbn }));
    const libraries = (await this.socket.emitAsync('info.libraries')).map(lib => ({ ...lib, id: lib.name }));
    this.disconnect();
    await Promise.all(
      (await Core.find()).map(core => !cores.some(c => c.id === core.id) && core.remove()),
    );
    await Promise.all(
      (await Board.find()).map(board => !boards.some(b => b.id === board.id) && board.remove()),
    );
    await Promise.all(
      (await Library.find()).map(lib => !libraries.some(l => l.id === lib.id) && lib.remove()),
    );

    console.log('saving cores');
    await Promise.all(cores.map(
      core => (Core.findInStore({ query: { id: core.id } }).data[0] || (new Core(core))).save(),
    ));
    console.log('saving boards');
    await Promise.all(boards.map(async (board) => {
      const existing = Board.findInStore({ query: { id: board.id } }).data[0];
      // eslint-disable-next-line no-param-reassign
      if (existing) board._id = existing._id;
      if (existing && board.config_options) {
        board.config_options.forEach((option) => {
          const exOption = existing.config_options.find(opt => opt.option === option.option);
          if (!exOption) return;
          // eslint-disable-next-line no-param-reassign
          option.values = option.values.map(value => ({
            ...value,
            selected: exOption.values.some(val => val.value === value.value && val.selected),
          }));
        });
      }
      return (new Board(board)).save();
    }));
    console.log('saving libs');
    const start = Date.now();
    await chunk(libraries, 20).reduce((a, libs) => new Promise(async (resolve) => {
      await a;
      setTimeout(resolve, 10);
      await Promise.all(libs.map(lib => (
        Library.findInStore({ query: { id: lib.id } }).data[0]
        || (new Library(lib))
      ).save()));
    }));
    console.log('finished loading server details', Date.now() - start);
  }

  connect(silent = false) {
    return new Promise((res) => {
      this.socket = io(this.url);
      this.socket.once('ready', res);
      this.socket.emitAsync = (action, payload) => new Promise((resolve) => {
        if (typeof payload !== 'undefined') this.socket.emit(action, payload, resolve);
        else this.socket.emit(action, resolve);
      });
      if (!silent) {
        this.socket.on('console.log', msg => this.emit('console.log', msg));
        this.socket.on('console.error', msg => this.emit('console.error', msg));
      }
    });
  }

  disconnect() {
    this.socket.disconnect();
    this.socket = null;
  }

  _setSketch() {
    const project = store.getters['projects/current'];
    return this.socket.emitAsync('files.setSketch', `${project.ref}/`);
  }

  // eslint-disable-next-line class-methods-use-this
  _getFqbn() {
    const board = store.getters['boards/current'];
    if (!board) return 'arduino:avr:uno';
    return Object.keys(board.selected).reduce((a, i) => `${a}:${i}=${board.selected[i]}`, board.fqbn);
  }

  async compile(close = true) {
    const mod = close ? 2 : 1;
    this.emit('console.clear');
    this.emit('console.progress', { percent: 0 * mod, message: 'Connecting to compile server...' });
    await this.connect();
    this.emit('console.progress', { percent: 0.05 * mod, message: 'Uploading current code files...' });
    await this._setSketch();
    const project = store.getters['projects/current'];
    const files = store.getters['files.find']({ query: { _id: { $in: project.files } } }).data
      .map(f => ({ ...f, name: `${project.ref}/${f.name}` }));
    this.emit('console.progress', { percent: 0.25 * mod, message: 'Compiling code...' });
    const err = await this.socket.emitAsync('program.compile', { fqbn: this._getFqbn(), files });
    if (err) {
      this.emit('console.error', err);
      throw new Error(err);
    }
    if (close) {
      this.disconnect();
      this.emit('console.progress', { percent: 1, message: 'Done!' });
    } else {
      this.emit('console.progress', { percent: 0.5 * mod, message: 'Compiling completed!' });
    }
  }

  async upload() {
    if (!serial || !serial.currentDevice) {
      this.emit('console.error', { message: 'Device that you want to program needs to be plugged in.', cause: 'Disconnected device.' });
      return;
    }
    await this.compile(false);
    this.emit('console.progress', { percent: 0.5, message: 'Uploading code...' });
    const id = Math.random().toString(16).substr(2);
    serial.setMute(true);

    const dataUp = buff => this.socket.emit(`upload.dataUp.${id}`, buff);
    const dataDown = buff => serial.writeBuff(buff);
    serial.on('data', dataUp);
    this.socket.on(`upload.dataDown.${id}`, dataDown);

    const err = await this.socket.emitAsync('program.upload', { id, fqbn: this._getFqbn() });
    if (err) {
      this.emit('console.error', err);
    } else {
      this.emit('console.progress', { percent: 1.0, message: 'Done!' });
    }

    serial.off('data', dataUp);
    this.socket.off(`upload.dataDown.${id}`, dataDown);
  }
}

export default new CompileServer();
