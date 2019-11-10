import uuid4 from 'uuid/v4';
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
  }

  // eslint-disable-next-line class-methods-use-this
  async _getDevice(value) {
    const devices = await serial.getPorts();
    return devices.find(d => d.id === value) || null;
  }

  async _readLoop() {
    if (!this._currentDevice || !this._currentDevice.readable) {
      this._rl = false;
      return;
    }
    this._rl = true;
    try {
      let reader = this._currentDevice.readable.getReader();
      // eslint-disable-next-line no-constant-condition
      while (true) {
        // eslint-disable-next-line no-await-in-loop
        const { value, done } = await reader.read();
        this.emit('data', Buffer.from(value));
        if (!this.mute) this.emit('message', Buffer.from(value).toString(this.encoding));
        if (done) {
          break;
        }
      }
      reader = undefined;
    } catch (e) {
      this.emit('message', `<ERROR: ${e.message}>`);
    }
    this._readLoop();
  }

  async requestDevice() {
    const device = await serial.requestPort({ filters: [{ classCode: 2 }] });
    if (!device.id) device.id = uuid4();
    if (await this.getDeviceName(device.id)) {
      console.log(this.getDeviceName(device.id));
      this.setCurrentDevice(device.id);
    } else {
      this.emit('deviceNamePrompt', device.id);
    }
  }

  async isDevice(value) {
    return !!(await this._getDevice(value));
  }

  async setCurrentDevice(value) {
    if (!(await this.isDevice(value))) return;
    if (this._currentDevice) this.disconnect();
    this._currentDevice = await this._getDevice(value);
    this.currentDevice = value;
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
    const writer = this._currentDevice.writeable.getWriter();
    const encoder = new TextEncoder();
    const encoded = encoder.encode(buff.toString('utf8'), { stream: true });
    await Promise.all(encoded.map(async (chunk) => {
      await writer.ready;
      await writer.write(chunk);
    }));
    await writer.ready;
    await writer.close();
  }

  async write(message) {
    if (this.mute) return;
    await this.writeBuff(Buffer.from(message, this.encoding));
  }

  async connect() {
    if (!this._currentDevice || this._currentDevice.readable) return;
    console.log(1, this._currentDevice);
    await this._currentDevice.open({
      baudrate: this.baud,
    });
    this.connected = true;
    this.emit('connected', this.currentDevice);
    if (!this._rl) this._readLoop();
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
}

export default NavSerial;
