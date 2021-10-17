/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import EventEmitter from 'events';
import store from '@/store';

/*
Interface should emit the following:
this.emit('data', buffer)
this.emit('message', string) // should be a string version of buffer
// message should not be emitted whilst this.mute === true
this.emit('connected', value)
this.emit('disconnected', value)
this.emit('deviceNamePrompt', value) // prompts the user to input a readable device name
*/

const signalMap = {
  dtr: 'dataTerminalReady',
  rts: 'requestToSend',
  brk: 'break',
  cts: 'clearToSend',
  dsr: 'dataSetReady',
  dcd: 'dataCarrierDetect',
};

class BaseSerial extends EventEmitter {
  constructor() {
    super();
    this.requestRequired = false;
    this.mute = false;
    this.baud = Number(window.localStorage.currentBaudRate) || 115200;
    this.lastBaud = 115200;
    this.devices = [];
    this.currentDevice = null;
    this.connected = false;
    this.implementation = 'basic';
    this.serial = null;
    this.DEBUG = !!process.env.VUE_APP_DEBUG;
    // eslint-disable-next-line no-console
    // console.log('debug', this.DEBUG);
  }

  get encoding() {
    const [settings] = store.getters['settings/find']({ query: { key: 'monitor' } }).data;
    return settings?.value?.encoding || 'ascii';
  }

  install(Vue) {
    // eslint-disable-next-line no-param-reassign
    Vue.$serial = this;
    // eslint-disable-next-line no-param-reassign
    Vue.prototype.$serial = this;
  }

  async requestDevice() { return {}; }

  async listDevices() {
    const isDevices = await Promise.all(this.devices.map((device) => this.isDevice(device.value)));
    return this.devices.filter((device, i) => isDevices[i]);
  }

  async isDevice(value) { return true; }

  async setCurrentDevice(value) { this.currentDevice = value; }

  async setBaud(baud) {
    // eslint-disable-next-line no-console
    if (this.DEBUG) console.log('setting speed', baud);
    if (this.serial) await this.serial.update({ baudRate: baud });
    this.baud = baud;
    window.localStorage.currentBaudRate = baud;
    return baud;
  }

  async resetBaud() {
    this.setBaud(this.lastBaud);
  }

  async setMute(val) { this.mute = val; }

  _transSignal(sig) {
    let trans = {};
    if (typeof sig === 'object') {
      trans = { ...sig };
    }
    if (sig === 'on' || sig === true) {
      trans = {
        dtr: true,
        rts: true,
      };
    }
    if (sig === 'off' || sig === false) {
      trans = {
        dtr: false,
        rts: false,
      };
    }
    Object.keys(signalMap).forEach((i) => {
      if (typeof trans[i] === 'boolean') trans[signalMap[i]] = trans[i];
      if (typeof trans[signalMap[i]] === 'boolean') trans[i] = trans[signalMap[i]];
    });
    return trans;
  }

  async setSignals(signals) {
    if (!this.serial?.isOpen) throw new Error('Cannot write to closed port.');
    // eslint-disable-next-line no-console
    if (this.DEBUG) console.log('signaling', signals);
    const sigs = this._transSignal(signals);
    return this.serial.set(sigs);
  }

  async getSignals() {
    if (!this.serial?.isOpen) throw new Error('Cannot read closed port.');
    const signals = await this.serial.get();
    return this._transSignal(signals);
  }

  readBuff() {
    return new Promise((resolve, reject) => this.serial?.read((buff, err) => {
      if (err) reject(err);
      else resolve();
    }));
  }

  writeBuff(buff) {
    // eslint-disable-next-line no-console
    if (this.DEBUG) console.log('write', buff.toString('hex'));
    return new Promise((resolve, reject) => this.serial.write(buff, (err) => {
      if (err) reject(err);
      else resolve();
    }));
  }

  connect() {
    if (!this.serial) throw new Error('Cannot connect to un-initiated device.');
    if (!this._currentDevice || this.serial.isOpen) {
      // eslint-disable-next-line no-console
      if (this.DEBUG) console.log('skipping connect');
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => this.serial.open((err) => {
      if (err) return reject(err);
      this.connected = true;
      this.emit('connected', this.currentDevice);
      return resolve();
    }));
  }

  async disconnect() {
    if (!this._currentDevice || !this.serial?.isOpen) return;
    this.serial.pause();
    await this.serial.close();
    this.serial.resume();
    this.connected = false;
    this.emit('disconnect', this.currentDevice);
    this.emit('close');
    // eslint-disable-next-line no-console
    if (this.DEBUG) console.log('disconnected');
  }

  async setDeviceName(value, name) {
    if (await this.isDevice(value)) this.devices.push({ value, name });
  }

  async getDeviceName(value) {
    return (this.devices.find((d) => d.value === value) || { name: '' }).name;
  }

  // node-serialport properties
  get isOpen() { return this.connected; }

  get path() { return this.implementation; }

  get baudRate() { return this.baud; }

  async open(cb = () => {}) {
    try {
      await this.connect();
    } catch (err) {
      cb?.(err);
      return;
    }
    cb?.();
  }

  async update(opts = {}, cb = () => {}) {
    try {
      if (opts.baudRate) {
        await this.setBaud(opts.baudRate);
      }
    } catch (err) {
      cb?.(err);
      return;
    }
    cb?.();
  }

  async close(cb = () => {}) {
    try {
      await this.disconnect();
    } catch (err) {
      cb?.(err);
      return;
    }
    cb?.();
  }

  async set(opts = {}, cb = () => {}) {
    try {
      await this.setSignals(opts);
    } catch (err) {
      cb?.(err);
      return;
    }
    cb?.();
  }

  async get(cb = () => {}) {
    let sigs = {};
    try {
      sigs = await this.getSignals();
    } catch (err) {
      cb?.(err, null);
      return;
    }
    cb?.(null, sigs);
  }

  async read(size) {
    const buff = await this.readBuff();
    return buff && buff.slice(0, Math.min(buff.length, size || Infinity));
  }

  drain(cb = () => {}) { cb?.(); }

  flush(cb = () => {}) { cb?.(); }

  pause() {
    this.serial?.paused?.();
  }

  resume() {
    this.serial?.resume?.();
  }

  async write(message, encoding = null, cb = () => {}) {
    if (typeof encoding === 'function') {
      // eslint-disable-next-line no-param-reassign
      cb = encoding;
      // eslint-disable-next-line no-param-reassign
      encoding = null;
    }
    if (this.mute && typeof message === 'string') return;
    try {
      await this.writeBuff(typeof message === 'string' ? Buffer.from(message, encoding || this.encoding) : message);
    } catch (err) {
      cb?.(err);
      return;
    }
    cb?.();
  }
}

export default BaseSerial;
