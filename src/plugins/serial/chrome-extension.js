import { promisify } from 'util';
import { SerialPort, list } from './lib/chrome-serial';
import BaseSerial from './base-serial';

// eslint-disable-next-line no-console
console.log('using chrome extension');
class ExtensionSerial extends BaseSerial {
  constructor() {
    super();
    this.requestRequired = false;
    this._listPromise = promisify(list);
    this.devices = [];
    this._currentDevice = null;
    this._rl = false;
    this.implementation = 'chrome-extension';
  }

  async listDevices() {
    this.devices = (await this._listPromise())
      .filter((dev) => dev.manufacturer || dev.vendorId !== '0x0' || dev.productId !== '0x0')
      .map((dev) => ({ name: dev.comName, value: dev.comName }));
    return this.devices;
  }

  async _getDevice(value) {
    const devices = await this._listPromise();
    return devices.find((d) => d.comName === value) || null;
  }

  async isDevice(value) {
    return !!(await this._getDevice(value));
  }

  async setCurrentDevice(value) {
    if (!(await this.isDevice(value))) return;
    if (this._port) this.disconnect();
    this.currentDevice = value;
    this.emit('currentDevice', value);
    try {
      await this.connect();
    } catch (err) {
      if (err.message === 'Access denied.') {
        this.emit('errorPrompt', 'access_denied');
      }
      // eslint-disable-next-line no-console
      console.error([err]);
    }
  }

  setSignals(signals) {
    return new Promise((resolve, reject) => {
      if (!this._port) reject(new Error('Cannot write to closed port.'));
      else {
        this._port.set(this._transSignal(signals), (err) => {
          if (err) reject(err);
          else resolve();
        });
      }
    });
  }

  drain() {
    return new Promise((resolve, reject) => {
      if (!this._port) reject(new Error('Cannot write to closed port.'));
      else {
        this._port.drain((err) => {
          if (err) reject(err);
          else resolve();
        });
      }
    });
  }

  async writeBuff(buff) {
    if (!this._port) throw new Error('Cannot write to closed port.');
    // console.log('down', Buffer.from(buff).toString('hex'));
    await this._port.write({ data: Buffer.from(buff).toString('base64') });
    // await this._port.flush();
    // setTimeout(() => this._port.flush(), 10);
  }

  async write(message) {
    if (this.mute) return;
    await this.writeBuff(Buffer.from(message, this.encoding));
  }

  connect() {
    return new Promise((resolve, reject) => {
      if (!this.currentDevice || this._port) {
        // console.log('connect', this.currentDevice, this._port);
        resolve();
        return;
      }
      this._port = new SerialPort(
        this.currentDevice,
        { baudRate: this.baud },
        true,
        (err) => {
          if (err) {
            this.emit('message', `<ERROR: ${err.message}>`);
            reject(err);
          }
          this._port.on('data', (buff) => {
            // console.log('up', buff, buff.toString('hex'));
            this.emit('data', buff);
            if (!this.mute) this.emit('message', buff.toString(this.encoding));
          });
          this._port.on('close', () => {
            this.connected = false;
            this.emit('disconnect', this.currentDevice);
            this._port = null;
            // this.currentDevice = null;
          });
          this._port.on('disconnect', () => {
            this.connected = false;
            this.emit('disconnect', this.currentDevice);
            this._port = null;
            // this.currentDevice = null;
          });
          this._port.on('error', (error) => {
            this.emit('message', `<ERROR: ${error.message}>`);
          });
          this.connected = true;
          this.emit('connected', this.currentDevice);
          this.setSignals('on');
          resolve(this.currentDevice);
        },
      );
    });
  }

  disconnect() {
    return new Promise((resolve, reject) => {
      if (!this._port) return;
      this._port.once('disconnect', (err) => (err ? reject(err) : resolve()));
      this._port.close();
    });
  }
}

export default ExtensionSerial;
