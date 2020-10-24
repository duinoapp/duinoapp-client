import Vue from 'vue';
// import { v4 as uuid4 } from 'uuid';
import BaseSerial from './base-serial';

const { serial } = navigator;

console.log('using navserial');
class NavSerial extends BaseSerial {
  constructor() {
    super();
    this.requestRequired = true;
    this.devices = JSON.parse(localStorage.portNames || '[]');
    this._currentDevice = null;
    this._rl = false;
    this.implementation = 'navserial';
    this.handlesSelect = true;
  }

  // eslint-disable-next-line class-methods-use-this
  async _getDevice(value) {
    // const devices = await serial.getPorts();
    // console.log(devices);
    // return devices.find((d) => d.id === value) || null;
    return value;
  }

  async _readLoop(id = Math.random()) {
    if (this._rl && id !== this._rl) return;
    if (!this._currentDevice || !this._currentDevice.readable) {
      this._rl = false;
      return;
    }
    this._rl = id;
    try {
      this._reader = this._currentDevice.readable.getReader();
      // eslint-disable-next-line no-constant-condition
      while (true) {
        // eslint-disable-next-line no-await-in-loop
        const { value, done } = await this._reader.read();
        if (done) {
          this._reader.releaseLock();
          break;
        }
        this.emit('data', Buffer.from(value));
        if (!this.mute) this.emit('message', Buffer.from(value).toString(this.encoding));
      }
    } catch (e) {
      this.emit('message', `<ERROR: ${e.message}>`);
    }
    if (this._reader) this._reader.releaseLock();
    this._reader = null;
    setTimeout(() => this._readLoop(id), 10);
  }

  async requestDevice() {
    const device = await serial.requestPort({ classCode: 2 });
    this.setCurrentDevice(device);
    // if (!device.id) device.id = uuid4();
    // if (await this.getDeviceName(device.id)) {
    //   console.log(this.getDeviceName(device.id));
    //   this.setCurrentDevice(device.id);
    // } else {
    //   this.emit('deviceNamePrompt', device.id);
    // }
  }

  async isDevice(value) {
    return !!(await this._getDevice(value));
  }

  async setCurrentDevice(value) {
    if (!(await this.isDevice(value))) return;
    if (this._currentDevice) this.disconnect();
    this._currentDevice = await this._getDevice(value);
    Vue.set(this, 'currentDevice', value);
    this.emit('currentDevice', value);
    try {
      await this.connect();
    } catch (err) {
      if (err.message === 'Access denied.') {
        this.emit('errorPrompt', 'access_denied');
      }
      console.error([err]);
    }
  }

  async writeBuff(buff) {
    const writer = this._currentDevice.writable.getWriter();
    // console.log(buff);
    // const encoder = new TextEncoder();
    // const encoded = encoder.encode(buff.toString('utf8'), { stream: true });
    // await Promise.all(encoded.map(async (chunk) => {
    //   await writer.ready;
    //   await writer.write(chunk);
    // }));
    await writer.write(buff);
    await writer.releaseLock();
  }

  async write(message) {
    if (this.mute) return;
    await this.writeBuff(Buffer.from(message, this.encoding));
  }

  async connect() {
    if (!this._currentDevice || this._currentDevice.readable) return;
    await this._currentDevice.open({
      baudrate: this.baud,
    });
    // console.log(1, this._currentDevice);
    // console.log(1, this._currentDevice.getSignals());
    this.connected = true;
    this.emit('connected', this.currentDevice);
    const self = this;
    this._currentDevice.readable.pipeTo(new WritableStream({
      write(chunk) {
        // console.log('up', Buffer.from(chunk).toString(this.encoding));
        if (!self.mute) self.emit('message', Buffer.from(chunk).toString(self.encoding));
        self.emit('data', Buffer.from(chunk));
      },
    }));
    // if (!this._rl) this._readLoop();
  }

  async disconnect() {
    if (!this._currentDevice || !this._currentDevice.opened) return;
    await this._currentDevice.close();
    this.connected = false;
    this.emit('disconnect', this.currentDevice);
  }

  async setDeviceName(value, name) {
    if (!(await this.isDevice(value))) return;
    this.devices.push({ value, name });
    localStorage.portNames = JSON.stringify(this.devices);
    this.setCurrentDevice(value);
  }

  setSignals(signals) {
    if (!this._currentDevice) throw new Error('Cannot write to closed port.');
    return this._currentDevice.setSignals(this._transSignal(signals));
  }
}

export default NavSerial;
