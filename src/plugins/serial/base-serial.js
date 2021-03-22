/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
import EventEmitter from 'events';

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
    this.encoding = 'ascii';
    this.devices = [];
    this.currentDevice = null;
    this.connected = false;
    this.implementation = 'basic';
    this.isDataStreamPaused = false;
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
    try {
      await this.disconnect();
      // eslint-disable-next-line no-console
    } catch (err) { console.error(err); }
    // eslint-disable-next-line no-console
    // console.log('disconnected');
    this.lastBaud = this.baud;
    this.baud = baud;
    await this.connect();
    // eslint-disable-next-line no-console
    // console.log('connected');
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

  async setSignals(signals) { return signals; }

  readBuff() { return null; }

  async writeBuff(buff) { return buff; }

  async connect() { this.connected = true; }

  async disconnect() { this.connected = false; }

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

  read(size) {
    const buff = this.readBuff();
    return buff && buff.slice(0, Math.min(buff.length, size || Infinity));
  }

  drain(cb = () => {}) { cb?.(); }

  flush(cb = () => {}) { cb?.(); }

  pause() {
    this.isDataStreamPaused = true;
    return this;
  }

  resume() {
    this.isDataStreamPaused = true;
    return this;
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
