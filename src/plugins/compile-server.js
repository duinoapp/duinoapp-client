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
      if (mutation.type !== 'servers/setCurrent') return;
      this.setServer(store.getters['servers/current']);
    });
  }

  install(Vue) {
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
      if ((await Server.find({ query: { address: serv.address } })).length) return;
      const server = new Server(serv);
      await server.save();
    }));
    await Promise.all((await Server.find()).map(async (server) => {
      console.log(server);
      // eslint-disable-next-line no-param-reassign
      server.ping = await this.pingServer(server.address);
      await server.patch();
    }));
  }

  // eslint-disable-next-line class-methods-use-this
  pingServer(url) {
    return new Promise((resolve) => {
      const sampleSize = 10;
      const socket = io(`${url}/ping`);
      const pings = [];
      let start;
      const pingCB = () => {
        if (start) pings.push(Date.now() - start);
        start = Date.now();
        if (pings.length < sampleSize) return socket.emit('p', pingCB);
        if (pings.length > sampleSize) return Math.random();
        socket.disconnect();
        return resolve(pings.reduce((a, p) => a + p, 0) / pings.length);
      };
      socket.emit('p', pingCB);
      setTimeout(() => {
        console.log(pings);
        if (pings.length > 0) return;
        for (let i = 0; i < sampleSize; i += 1) pings.push(-1);
        resolve(-2);
      }, 1000);
      socket.ack(Date.now());
      console.log(socket);
    });
  }

  setServer(serverConfig) {
    this.url = serverConfig.address;
    console.log(`loading server: ${this.url}`);
    this.load();
  }

  async load() {
    await this.connect();
    console.log('finding cores');
    const cores = await this.socket.emitAsync('core.search', '');
    console.log('finding boards');
    const loadBoards = async (i) => {
      if (i >= cores.length) return;
      const core = cores.Platforms[i];
      await this.loadBoards({
        name: core.Name,
        version: core.Version,
        id: core.ID,
      });
      await loadBoards(i + 1);
    };
    await loadBoards(0);
    console.log('finding libs');
    await this.loadLibs();
    this.disconnect();
  }

  async loadLibs() {
    const libs = (await this.socket.emitAsync('lib.search', '')).libraries;
    const { Library } = this.Vue.$FeathersVuex;
    await Promise.all(libs.map(async (lib) => {
      const library = new Library(
        (await Library.find({ query: { name: lib.Name } }))[0] || { name: lib.Name },
      );
      library.releases = {};
      Object.keys(lib.Releases).forEach((i) => {
        library.releases[i] = {};
        Object.keys(lib.Releases[i]).forEach((j) => {
          library.releases[i][j.toLowerCase()] = lib.Releases[i][j];
        });
      });
      library.releases.latest = library.releases[Object.keys(lib.Releases).pop()];
      if (!library.servers.includes(this.url)) library.servers = [...library.servers, this.url];
      await library.save();
    }));
    await Promise.all((await Library.find({
      query: {
        name: { $nin: libs.map(l => l.Name) },
        servers: this.url,
      },
    })).data.forEach((l) => {
      // eslint-disable-next-line no-param-reassign
      l.servers = l.servers.filter(s => s !== this.url);
      return l.save();
    }));
  }

  async loadBoards(core) {
    const { Board } = this.Vue.$FeathersVuex;
    await this._installCore(core.id);
    const boards = (await this.socket.emitAsync('board.listall')).boards.filter(b => b.fqbn.indexOf(core.id) === 0);
    const loadBoard = async (i) => {
      if (i >= boards.length) return;
      const b = boards[i];
      // const details = await this.socket.emitAsync('board.details', b.fqbn);
      const board = new Board((await Board.find({ query: { fqbn: b.fqbn } }))[0] || b);
      board.core = core;
      board.options = board.options && board.options.map(o => ({
        option: o.Option,
        label: o.OptionLabel,
        values: o.Values && o.Values.map(v => ({
          value: v.Value,
          text: v.ValueLabel,
          default: !!v.Selected,
        })),
      }));
      board.options.forEach((o) => {
        if (typeof board.selected[o.option] === 'undefined' && o.values) board.selected[o.option] = o.values.find(v => v.default);
      });
      if (!board.servers.includes(this.url)) board.servers = [...board.servers, this.url];
      await board.save();
      await loadBoard(i + 1);
    };
    loadBoard(0);
    await Promise.all((await Board.find({
      query: {
        'core.id': core.id,
        fqbn: { $nin: boards.map(b => b.fqbn) },
        servers: this.url,
      },
    })).map((b) => {
      // eslint-disable-next-line no-param-reassign
      b.servers = b.servers.filter(s => s !== this.url);
      return b.save();
    }));
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
      const [org, series] = board ? board.fqbn.split(':') : ['arduino', 'avr'];
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
    await this._sendFiles();
    this.emit('console.progress', { percent: 0.1 * mod, message: 'Configuring selected circuit board...' });
    await this._installCore();
    this.emit('console.progress', { percent: 0.15 * mod, message: 'Installing Libraries...' });
    await this._installLibs();
    this.emit('console.progress', { percent: 0.25 * mod, message: 'Compiling code...' });
    const err = await this.socket.emitAsync('program.compile', { fqbn: this._getFqbn() });
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
