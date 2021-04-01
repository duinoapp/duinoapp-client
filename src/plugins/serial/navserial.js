import Vue from 'vue';
// import { v4 as uuid4 } from 'uuid';
import BrowserSerialPort from 'avrgirl-arduino/lib/browser-serialport';
import BaseSerial from './base-serial';

const { serial } = navigator;

// eslint-disable-next-line no-console
console.log('using navserial');
class NavSerial extends BaseSerial {
  constructor() {
    super();
    this.requestRequired = true;
    this.devices = JSON.parse(localStorage.portNames || '[]');
    this._currentDevice = null;
    this.implementation = 'navserial';
    this.handlesSelect = true;

    this._dataHandler = (buff) => {
      this._lastRead = buff;
      // eslint-disable-next-line no-console
      if (this.DEBUG) console.log('read', Buffer.from(buff).toString('hex'));
      if (!this.mute) this.emit('message', buff.toString(this.encoding));
      this.emit('data', buff);
    };
    this._openHandler = (...args) => {
      this.emit('open', ...args);
    };
    this._closeHandler = (...args) => {
      this.emit('close', ...args);
    };

    this._initSerial();
  }

  // eslint-disable-next-line class-methods-use-this
  async _getDevice(value) {
    // const devices = await serial.getPorts();
    // console.log(devices);
    // return devices.find((d) => d.id === value) || null;
    return value;
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

  _registerSerial(port) {
    this.serial = new BrowserSerialPort(port, {
      baudRate: this.baud,
      autoOpen: false,
    });
    this.serial.on('data', this._dataHandler);
    this.serial.on('open', this._openHandler);
    this.serial.on('close', this._closeHandler);
  }

  _unregisterSerial() {
    this.serial.off('data', this._dataHandler);
    this.serial.off('open', this._openHandler);
    this.serial.off('close', this._closeHandler);
  }

  async setCurrentDevice(value) {
    if (!(await this.isDevice(value))) return;
    if (this.connected) await this.disconnect();
    this._currentDevice = await this._getDevice(value);
    Vue.set(this, 'currentDevice', value);

    if (this.serial) this._unregisterSerial();
    this._registerSerial(value);

    this.emit('currentDevice', value);
    try {
      await this.connect();
      window.localStorage.lastNavSerialPort = JSON.stringify(value.getInfo());
    } catch (err) {
      if (err.message === 'Access denied.') {
        this.emit('errorPrompt', 'access_denied');
      }
      // eslint-disable-next-line no-console
      console.error(err);
    }
    // eslint-disable-next-line no-console
    if (this.DEBUG) console.log(value, value.getInfo());
  }

  async _initSerial() {
    const { usbProductId, usbVendorId } = JSON.parse(window.localStorage.lastNavSerialPort || '{}');
    if (!usbVendorId || !usbProductId) return;
    const devices = await serial.getPorts();
    const device = devices.find((d) => {
      const info = d.getInfo();
      return usbProductId === info.usbProductId && usbVendorId === info.usbVendorId;
    });
    if (device) this.setCurrentDevice(device);
  }

  async setDeviceName(value, name) {
    if (!(await this.isDevice(value))) return;
    this.devices.push({ value, name });
    localStorage.portNames = JSON.stringify(this.devices);
    this.setCurrentDevice(value);
  }
}

export default NavSerial;
