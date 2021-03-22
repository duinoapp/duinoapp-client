import Vue from 'vue';
// import { v4 as uuid4 } from 'uuid';
import BaseSerial from './base-serial';

const { serial } = navigator;
const asyncTimeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const DEBUG = true;

// eslint-disable-next-line no-console
console.log('using navserial');
class NavSerial extends BaseSerial {
  constructor() {
    super();
    this.requestRequired = true;
    this.devices = JSON.parse(localStorage.portNames || '[]');
    this._currentDevice = null;
    this._rl = false;
    this._reader = null;
    this._beforeWriteFn = null;
    this._writeLock = false;
    this._lastRead = null;
    this.implementation = 'navserial';
    this.handlesSelect = true;
    this._initSerial();
  }

  // eslint-disable-next-line class-methods-use-this
  async _getDevice(value) {
    // const devices = await serial.getPorts();
    // console.log(devices);
    // return devices.find((d) => d.id === value) || null;
    return value;
  }

  async _readLoop(id) {
    if (!this._rl || id !== this._rl) return;
    if (!this._currentDevice || !this._currentDevice.readable) {
      this._rl = false;
      return;
    }
    try {
      this._reader = this._currentDevice.readable.getReader();
      // eslint-disable-next-line no-constant-condition
      while (id === this._rl) {
        // eslint-disable-next-line no-await-in-loop
        const { value, done } = await this._reader.read();

        const buff = Buffer.from(this._lastRead && this.isDataStreamPaused ? (this._lastRead || []) : []);
        this._lastRead = Buffer.concat([buff, Buffer.from([...value])]);

        if (done) {
          this._reader.releaseLock();
          break;
        }
        // eslint-disable-next-line no-console
        if (DEBUG) console.log('read', Buffer.from([...value]).toString('hex'));
        try {
          if (!this.isDataStreamPaused) {
            this.emit('data', Buffer.from([...value]));
            if (!this.mute) this.emit('message', Buffer.from([...value]).toString(this.encoding));
          }
          // eslint-disable-next-line no-console
        } catch (e) { console.error(e); }
      }
    } catch (e) {
      this.emit('message', `<ERROR: ${e.message}>\r\n`);
      // eslint-disable-next-line no-console
      if (DEBUG) console.error(e);
    }
    if (this._reader) this._reader.releaseLock();
    this._reader = null;
    setTimeout(() => this._readLoop(id), 10);
  }

  async stopReadLoop() {
    this._rl = false;
    if (this._reader) {
      this._reader.cancel();
      await asyncTimeout(100);
      await this.stopReadLoop();
    }
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
    if (this.connected) this.disconnect();
    this._currentDevice = await this._getDevice(value);
    Vue.set(this, 'currentDevice', value);
    this.emit('currentDevice', value);
    try {
      await this.connect();
      window.localStorage.lastSerialPort = JSON.stringify(value.getInfo());
    } catch (err) {
      if (err.message === 'Access denied.') {
        this.emit('errorPrompt', 'access_denied');
      }
      // eslint-disable-next-line no-console
      console.error([err]);
    }
    // eslint-disable-next-line no-console
    if (DEBUG) console.log(value, value.getInfo());
  }

  async _initSerial() {
    const { usbProductId, usbVendorId } = JSON.parse(window.localStorage.lastSerialPort || '{}');
    if (!usbVendorId || !usbProductId) return;
    const devices = await serial.getPorts();
    const device = devices.find((d) => {
      const info = d.getInfo();
      return usbProductId === info.usbProductId && usbVendorId === info.usbVendorId;
    });
    if (device) this.setCurrentDevice(device);
  }

  readBuff() {
    const lastRead = this._lastRead;
    this._lastRead = null;
    return lastRead;
  }

  async writeBuff(buff) {
    if (this._writeLock) {
      // eslint-disable-next-line no-console
      if (DEBUG) console.log('locked', Buffer.from(buff).toString('hex'));
      return;
    }
    if (this._beforeWriteFn) {
      const beforeWriteFn = this._beforeWriteFn;
      this._beforeWriteFn = null;
      this._writeLock = true;
      await beforeWriteFn();
      this._writeLock = false;
    }
    const writer = this._currentDevice.writable.getWriter();
    // console.log(buff);
    // const encoder = new TextEncoder();
    // const encoded = encoder.encode(buff.toString('utf8'), { stream: true });
    // await Promise.all(encoded.map(async (chunk) => {
    //   await writer.ready;
    //   await writer.write(chunk);
    // }));
    // eslint-disable-next-line no-console
    if (DEBUG) console.log('write', Buffer.from(buff).toString('hex'));
    await writer.write(buff);
    await writer.releaseLock();
  }

  async connect() {
    if (!this._currentDevice) {
      // console.log('skipping connect');
      return;
    }
    if (this._currentDevice.readable) {
      try {
        await this.disconnect();
        // eslint-disable-next-line no-console
      } catch (err) { console.error(err); }
    }
    // console.log(await this._currentDevice.getInfo());
    await this._currentDevice.open({
      baudrate: this.baud,
      baudRate: this.baud,
    });
    // console.log(1, this._currentDevice);
    // console.log(1, this._currentDevice.getSignals());
    this.connected = true;
    this.emit('connected', this.currentDevice);
    this.emit('open');
    // const self = this;
    // this._reader = new WritableStream({
    //   start(controller) {
    //     self._controller = controller;
    //   },
    //   write(chunk) {
    //     // console.log('up', Buffer.from(chunk).toString(this.encoding));
    //     if (!self.mute) self.emit('message', Buffer.from(chunk).toString(self.encoding));
    //     self.emit('data', Buffer.from(chunk));
    //   },
    //   abort(err) {
    //     console.log('Sink error:', err);
    //   },
    // });
    // this._readableStreamClosed = this._currentDevice.readable.pipeTo(this._reader, { preventClose: true });
    this._rl = Math.random();
    this._readLoop(this._rl);
  }

  async disconnect() {
    if (!this._currentDevice) return;
    if (this._rl) await this.stopReadLoop();
    await asyncTimeout(100);
    await this._currentDevice.close();
    await asyncTimeout(100);
    // if (this._reader) {
    //   this._controller.error('FooBar');
    //   await this._readableStreamClosed.catch(Math.random);
    // }
    this.connected = false;
    this.emit('disconnect', this.currentDevice);
    this.emit('close');
    // eslint-disable-next-line no-console
    console.log('disconnected');
  }

  async setDeviceName(value, name) {
    if (!(await this.isDevice(value))) return;
    this.devices.push({ value, name });
    localStorage.portNames = JSON.stringify(this.devices);
    this.setCurrentDevice(value);
  }

  setSignals(signals) {
    if (!this._currentDevice) throw new Error('Cannot write to closed port.');
    // eslint-disable-next-line no-console
    if (DEBUG) console.log('signaling', signals);
    const sigs = this._transSignal(signals);
    return this._currentDevice.setSignals(sigs);
  }

  getSignals() {
    if (!this._currentDevice) throw new Error('Cannot read closed port.');
    const signals = this._currentDevice.getSignals();
    return this._transSignal(signals);
  }
}

export default NavSerial;
