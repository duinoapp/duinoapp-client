import EventEmitter from 'events';
import io from 'socket.io-client';
import stats from 'stats-lite';
import omit from 'lodash/omit';
import get from 'lodash/get';
import store from '../store';
import { genId } from '../store/tools';

const asyncTimeout = (timeout) => new Promise((resolve) => setTimeout(resolve, timeout));

class CompileServer extends EventEmitter {
  constructor() {
    super();
    this.url = null;
    this.socket = null;
    store.subscribe((mutation) => {
      if (mutation.type === 'setCurrentServer') {
        this.setServer(store.getters['servers/find']({ query: { uuid: store.getters.currentServer } }).data[0]);
      }
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
    const { Server } = this.Vue.$FeathersVuex.api;
    const res = await fetch('/servers.json');
    const servers = await res.json();
    await Promise.all(servers.map(async (serv) => {
      const server = new Server({ address: serv, isCustom: false });
      if ((await Server.find({ query: { uuid: server.uuid } })).length) return;
      await server.save();
    }));
    await Promise.all((await Server.find()).map(async (server) => {
      const serverData = await this.pingServer(server.address);
      Object.keys(serverData).forEach((i) => {
        // eslint-disable-next-line no-param-reassign
        server[i] = serverData[i];
      });
      await server.patch();
      if (server.uuid && server.uuid === store.getters.currentServer) {
        this.setServer(server);
      }
    }));
    if (!store.getters.currentServer) {
      const [server] = Server.findInStore({ query: { ping: { $gt: 0 }, $sort: { ping: 1 }, $limit: 1 } }).data;
      if (server) store.commit('setCurrentServer', server.uuid);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  pingServer(url, timeout = 10000) {
    return new Promise((resolve) => {
      const sampleSize = 10;
      const socket = io(`${url}/ping`.replace('//ping', '/ping'));
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
    if (!serverConfig) return;
    this.url = serverConfig.address;
    this.server = serverConfig;
    // window.localStorage.existingAddress = this.url;
    // eslint-disable-next-line no-console
    console.log(`loading server: ${this.url}`);
    this.load();
  }

  async load() {
    const { Core, Board /* , Library */ } = this.Vue.$FeathersVuex.api;
    await this.connect();
    const cores = (await this.socket.emitAsync('info.cores')); // .map(core => new Core({ ...omit(core, ['uuid']), coreId: core.uuid }));
    const boards = (await this.socket.emitAsync('info.boards')); // .map(board => new Board(board));
    // const libraries = (await this.socket.emitAsync('info.libraries'));
    // // .map(lib => new Library(lib));
    this.disconnect();
    // await Promise.all(
    //   (await Core.find()).map(core => !cores.some(c => c.uuid === core.uuid) && core.remove()),
    // );
    // await Promise.all(
    //   (await Board.find()).map(board => !boards.some(b => b.uuid === board.uuid) && board.remove()),
    // );
    // await Promise.all(
    //   (await Library.find()).map(lib => !libraries.some(l => l.uuid === lib.uuid) && lib.remove()),
    // );

    // console.log('saving cores', cores);
    const existingCores = (await Core.find()).reverse();
    // console.log('saving cores', existingCores.length);
    const coreIds = await Promise.all(cores.map(
      async (core) => {
        const coreId = genId(core.id, 'cores');
        if (!existingCores.some((ecore) => ecore.uuid === coreId)) {
          await (new Core({ ...omit(core, ['id']), coreId: core.id })).save();
        }
        return coreId;
      },
    ));
    // console.log('saving boards', boards);
    const existingBoards = (await Board.find()).reverse();
    // console.log('saving boards', existingBoards.length);
    const boardIds = await Promise.all(boards.map(async (board) => {
      const boardId = genId(board.fqbn, 'boards');
      const existing = existingBoards.find((eboard) => eboard.uuid === boardId);
      // eslint-disable-next-line no-param-reassign
      if (existing && board.config_options) {
        board.config_options.forEach((option) => {
          // eslint-disable-next-line no-param-reassign
          option.values = option.values.map((val) => ({ ...val, isDefault: val.selected }));
          const exOption = existing.config_options.find((opt) => opt.option === option.option);
          if (!exOption) return;
          // eslint-disable-next-line no-param-reassign
          option.values = option.values.map((value) => ({
            ...value,
            selected: exOption.values.some((val) => val.value === value.value && val.selected),
          }));
        });
        existing.config_options = board.config_options;
        existing.name = board.name;
      }
      if (existing) {
        await existing.save();
      } else {
        const b = new Board(board);
        await b.save();
      }
      return boardId;
    }));
    // console.log('saving libs');
    // const start = Date.now();
    // const existingLibs = (await Library.find()).reverse();
    // console.log('saving libs', existingLibs.length);
    // const libIds = await chunk(libraries, 10)
    //   .reduce((a, libs) => new Promise(async (resolve) => {
    //   const b = await a;
    //   // setTimeout(resolve, 50);
    //   setTimeout(() => requestAnimationFrame(async () => {
    //     const c = await Promise.all(libs.map(async (lib) => {
    //       const libId = genId(lib.name, 'libraries');
    //       if (!existingLibs.some(elib => elib.uuid === libId)) {
    //         await (new Library(omit(lib, ['resources']))).save();
    //       }
    //       return libId;
    //     }));
    //     resolve([...b, ...c]);
    //   }), 50);
    // }), Promise.resolve([]));
    // console.log('finished loading server details', Date.now() - start);
    await Promise.all(
      (await Core.find({ query: { uuid: { $nin: coreIds } } })).map((core) => core.remove()),
    );
    await Promise.all(
      (await Board.find({ query: { uuid: { $nin: boardIds } } })).map((board) => board.remove()),
    );
    // await Promise.all(
    //   (await Library.find({ query: { uuid: { $nin: libIds } } })).map(lib => lib.remove()),
    // );
    // console.log('cleaned old fields');
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
        this.socket.on('console.log', (msg) => this.emit('console.log', msg));
        this.socket.on('console.error', (msg) => this.emit('console.error', msg));
      }
    });
  }

  disconnect() {
    this.socket.disconnect();
    this.socket = null;
  }

  _setSketch() {
    const project = store.getters['projects/find']({ query: { uuid: store.getters.currentProject } }).data[0];
    return this.socket.emitAsync('files.setSketch', `${project.ref}/`);
  }

  // eslint-disable-next-line class-methods-use-this
  _getFqbn() {
    const board = store.getters['boards/find']({ query: { uuid: store.getters.currentBoard } }).data[0];
    if (!board) return 'arduino:avr:uno';
    return Object.keys(board.config)
      .filter((i) => !board.config_options
        .find((c) => c.option === i).values
        .find((v) => v.value === board.config[i]).isDefault)
      .reduce((a, i) => `${a}:${i}=${board.config[i]}`, board.fqbn);
  }

  // eslint-disable-next-line class-methods-use-this
  _getFlags() {
    const [settings] = store.getters['settings/find']({ query: { key: 'compiler' } }).data;
    return {
      verbose: settings?.value?.verbose || false,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  _getUploadSpeed() {
    const board = store.getters['boards/find']({ query: { uuid: store.getters.currentBoard } }).data[0];
    const speed = get(board, 'props.upload.speed', 115200);
    if (get(board, 'config.cpu')) {
      return get(board, `props.menu.cpu.${get(board, 'config.cpu')}.upload.speed`, speed);
    }
    return speed;
  }

  async compile(close = true) {
    const mod = close ? 2 : 1;
    this.emit('console.clear');
    this.emit('console.progress', { percent: 0 * mod, message: 'Connecting to compile server...' });
    await this.connect();
    this.emit('console.progress', { percent: 0.05 * mod, message: 'Uploading current code files...' });
    // await this._setSketch();
    const project = store.getters['projects/find']({ query: { uuid: store.getters.currentProject } }).data[0];
    const files = store.getters['files/find']({ query: { projectId: project.uuid } }).data
      .map((f) => ({ content: f.body, name: `${project.ref}/${f.name}` }));
    this.emit('console.progress', { percent: 0.25 * mod, message: 'Compiling code...' });
    const res = await this.socket.emitAsync('compile.start', {
      fqbn: this._getFqbn(),
      files,
      noHex: !close,
      flags: this._getFlags(),
    });
    if (res.error) {
      this.emit('console.error', res.error);
      throw new Error(res.error);
    }
    if (close) {
      this.emit('console.progress', { percent: 1, message: 'Done!' });
      this.disconnect();
    } else {
      this.emit('console.progress', { percent: 0.5 * mod, message: 'Compiling completed!' });
    }
    // this.disconnect();
    // return res.hex;
  }

  async upload() {
    if (!this.Vue.$serial || !this.Vue.$serial.currentDevice) {
      this.emit('console.error', {
        message: 'Device that you want to program needs to be plugged in.',
        cause: 'Disconnected device.',
      });
      return;
    }
    const [board] = store.getters['boards/find']({ query: { uuid: store.getters.currentBoard } }).data;
    const { protocol } = board?.props?.upload;
    const speed = this._getUploadSpeed();
    const speedDiff = this.Vue.$serial.baud !== speed;
    // const hex = await this.compile(false);
    await this.compile(false);
    this.emit('console.progress', { percent: 0.5, message: 'Uploading code...' });
    const id = Math.random().toString(16).substr(2);
    // eslint-disable-next-line no-console
    // console.log(this.Vue.$serial.baud, speed);
    if (speedDiff) await this.Vue.$serial.setBaud(speed);
    // eslint-disable-next-line no-console
    // console.log(this.Vue.$serial.baud, speed);
    this.Vue.$serial.setMute(true);

    const dataUp = (buff) => this.socket.emit(`upload.dataUp.${id}`, buff);
    const dataDown = (buff) => this.Vue.$serial.writeBuff(buff);
    this.Vue.$serial.on('data', dataUp);
    this.socket.on(`upload.dataDown.${id}`, dataDown);

    const project = store.getters['projects/find']({ query: { uuid: store.getters.currentProject } }).data[0];
    const files = store.getters['files/find']({ query: { projectId: project.uuid } }).data
      .map((f) => ({ content: f.body, name: `${project.ref}/${f.name}` }));

    if (['arduino', 'wiring'].includes(protocol)) {
      this.Vue.$serial._beforeWriteFn = async () => {
        // eslint-disable-next-line no-console
        // console.log('before write', protocol);
        await this.Vue.$serial.setSignals('off');
        await asyncTimeout(protocol === 'arduino' ? 250 : 50);
        await this.Vue.$serial.setSignals('on');
        await asyncTimeout(protocol === 'arduino' ? 250 : 100);
      };
    }

    const err = await this.socket.emitAsync('upload.start', {
      id,
      fqbn: this._getFqbn(),
      files,
      flags: this._getFlags(),
    });
    await this.Vue.$serial.setSignals('off');

    if (err) {
      this.emit('console.error', err);
      this.emit('console.progress', { percent: 1.0, message: 'Error!' });
    }
    this.emit('console.progress', { percent: 1.0, message: 'Done!' });

    this.Vue.$serial.off('data', dataUp);
    this.socket.off(`upload.dataDown.${id}`, dataDown);
    this.disconnect();
    if (speedDiff) await this.Vue.$serial.resetBaud();
    this.Vue.$serial.setMute(false);
  }
}

export default new CompileServer();
