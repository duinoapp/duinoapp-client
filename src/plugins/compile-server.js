import EventEmitter from 'events';
import omit from 'lodash/omit';
import store from '../store';
import { genId } from '../store/tools';

class CompileServer extends EventEmitter {
  constructor() {
    super();
    this.url = null;
    this.socket = null;
    this.initialising = true;
    this.initPromise = new Promise((resolve) => {
      this._initResolve = resolve;
    });
    store.subscribe((mutation) => {
      if (mutation.type === 'setCurrentServer') {
        this.load();
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

  currentServer() {
    const { Server } = this.Vue.$FeathersVuex.api;
    return Server.findInStore({ query: { uuid: store.getters.currentServer } }).data[0];
  }

  isValid() {
    return !!this.currentServer()?.valid;
  }

  async serverReq(path, opts = {}, server = null) {
    const { address } = server || this.currentServer() || {};
    if (!address) return null;
    const res = await fetch(`${address}/v3/${path}`, opts);
    if (!res.ok || res.status === 204) return null;
    return res.json();
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
      let serverData;
      try {
        serverData = await this.serverReq('info/server', null, server);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
      }
      Object.keys(serverData || {}).forEach((i) => {
        // eslint-disable-next-line no-param-reassign
        server[i] = serverData[i];
      });
      // eslint-disable-next-line no-param-reassign
      server.valid = !!serverData;
      await server.patch();
      if (server.uuid === store.getters.currentServer) {
        await this.load();
      }
    }));
    if (!store.getters.currentServer) {
      const [server] = Server.findInStore({ query: { valid: true, $limit: 1 } }).data;
      if (server) store.commit('setCurrentServer', server.uuid);
    }
    this.initialising = false;
    this._initResolve?.();
  }

  waitInit() {
    return this.initPromise;
  }

  async load() {
    if (!this.isValid()) return;
    // eslint-disable-next-line no-console
    console.log('loading start');
    const { Core, Board } = this.Vue.$FeathersVuex.api;

    const cores = await this.serverReq('info/cores');
    const boards = await this.serverReq('info/boards');

    const existingCores = (await Core.find()).reverse();
    const coreIds = await Promise.all(cores.map(
      async (core) => {
        const coreId = genId(core.id, 'cores');
        if (!existingCores.some((ecore) => ecore.uuid === coreId)) {
          await (new Core({ ...omit(core, ['id']), coreId: core.id })).save();
        }
        return coreId;
      },
    ));

    const existingBoards = (await Board.find()).reverse();
    const boardIds = await Promise.all(boards.map(async (board) => {
      const boardId = genId(board.fqbn, 'boards');
      const existing = existingBoards.find((eboard) => eboard.uuid === boardId);
      // eslint-disable-next-line no-param-reassign
      if (existing && board.config_options) {
        board.config_options.forEach((option) => {
          // eslint-disable-next-line no-param-reassign
          option.values = option.values.map((val) => ({ ...val, isDefault: val.selected }));
          const exOption = existing?.config_options?.find((opt) => opt.option === option.option);
          if (!exOption) return;
          // eslint-disable-next-line no-param-reassign
          option.values = option.values.map((value) => ({
            ...value,
            selected: exOption.values.some((val) => val.value === value.value && val.selected),
          }));
        });
        existing.config_options = board.config_options;
      }
      if (existing) {
        existing.name = board.name;
        existing.properties = board.properties;
        existing.productIds = board.identification_pref?.map((pref) => parseInt(pref.usbID?.PID?.replace, 16));
        existing.supported = this.Vue.$uploader.isSupported(existing);
        await existing.save();
      } else {
        const b = new Board(board);
        b.supported = this.Vue.$uploader.isSupported(b);
        await b.save();
      }
      return boardId;
    }));

    await Promise.all(
      (await Core.find({ query: { uuid: { $nin: coreIds } } })).map((core) => core.remove()),
    );
    await Promise.all(
      (await Board.find({ query: { uuid: { $nin: boardIds } } })).map((board) => board.remove()),
    );
    // eslint-disable-next-line no-console
    console.log('loading finished');
  }

  async librariesSearch(search, limit = 10, {
    skip = 0, sortBy = 'name', sortDesc = false, exact = false,
  } = {}) {
    await this.initPromise;
    const e = encodeURIComponent;
    const query = `?search=${
      e(search ?? '')
    }&limit=${limit}&skip=${skip}&sortBy=${e(sortBy)}&sortDesc=${sortDesc}&exact=${exact}`;
    const res = await this.serverReq(`info/libraries${query}`);
    return res || {
      limit, skip, total: 0, data: [],
    };
  }

  // eslint-disable-next-line class-methods-use-this
  _getFqbn() {
    const board = store.getters['boards/find']({ query: { uuid: store.getters.currentBoard } }).data[0];
    if (!board) return 'arduino:avr:uno';
    return Object.keys(board.config)
      .filter((i) => board.config[i] && !board.config_options
        .find((c) => c.option === i).values
        .find((v) => v.value === board.config[i]).isDefault)
      .reduce((a, i) => `${a}:${i}=${board.config[i]}`, board.fqbn);
  }

  // eslint-disable-next-line class-methods-use-this
  _getFlags() {
    const [settings] = store.getters['settings/find']({ query: { key: 'compiler' } }).data;
    return {
      verbose: settings?.value?.verbose || false,
      preferLocal: settings?.value?.preferLocal || false,
    };
  }

  async _getLibs({ libraries }) {
    if (!libraries?.length) return [];
    const search = libraries.map(({ name }) => name.replaceAll(' ', '.')).join(',');
    const { data } = await this.librariesSearch(search, libraries.length, { exact: true });
    return libraries.map((lib) => ({
      ...lib,
      url: data
        ?.find(({ name }) => name === lib.name)?.urls
        ?.find(({ version }) => version === lib.version)?.url,
    }));
  }

  async compile(mod = 2, logErr = true) {
    this.emit('console.clear');
    // await this._setSketch();
    const project = store.getters['projects/find']({ query: { uuid: store.getters.currentProject } }).data[0];
    const files = store.getters['files/find']({ query: { projectId: project.uuid } }).data
      .map((f) => ({ content: f.body, name: `${project.ref}/${f.name}` }));
    this.emit('console.progress', { percent: 0, message: 'Initialising Libraries...' });
    const libs = await this._getLibs(project);
    // if (libs.length) {
    //   await this.serverReq('libraries/cache', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ libs }),
    //   });
    // }
    this.emit('console.progress', { percent: 0.25 * mod, message: 'Compiling code...' });
    const req = {
      fqbn: this._getFqbn(),
      files,
      flags: this._getFlags(),
      libs,
    };
    const start = Date.now();
    let res;
    try {
      res = await this.serverReq('compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });
    } catch (err) {
      res = {
        error: Date.now() - start > 29.5 * 1000
          ? 'Compiling timed out after 30 seconds.\r\n'
            + 'If you are using libraries for the first time, try again a few times.\r\n'
            + 'If this problem persists, please try reaching out on the Discord.\r\n'
          : 'An Unknown issue occurred whilst compiling.\r\n'
            + 'Please try reaching out on the Discord if this persists.\r\n'
            + `${err.message}\r\n`,
      };
    }
    if (res.error) {
      if (logErr) this.emit('console.error', res.error);
      throw new Error(res.error);
    }
    this.emit('console.log', res.log);
    if (res.log.includes('In function \'spiTransferBytesNL\':')) {
      this.emit('console.log', '> Please note that the above "-Wincompatible-pointer-types" warning is only a warning.\r\n');
    }
    this.emit('console.progress', { percent: 1, message: 'Done!' });
    return res;
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
    const flags = this._getFlags();
    try {
      const res = await this.compile(1, false);
      if (!res.hex && !res.files) throw new Error('Failed to compile code');
      this.emit('console.progress', { percent: 0.5, message: 'Uploading code...' });
      // eslint-disable-next-line no-console
      // console.log(this.Vue.$serial);
      await this.Vue.$uploader.upload(res, { ...flags });
      this.emit('console.progress', { percent: 1.0, message: 'Done!' });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      this.emit('console.error', err);
      this.emit('console.progress', { percent: 1.0, message: 'Error!' });
    }
  }
}

export default new CompileServer();
