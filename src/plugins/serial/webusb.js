import BaseSerial from './base-serial';

const { usb } = navigator;
console.log('using webusb');
class WebUSBSerial extends BaseSerial {
  constructor() {
    super();
    this.requestRequired = true;
    this.devices = JSON.parse(localStorage.deviceNames || '{}');
    this._currentDevice = null;
    this._rl = false;
    this.implementation = 'webusb';
  }

  // eslint-disable-next-line class-methods-use-this
  async _getDevice(value) {
    const devices = await usb.getDevices();
    return devices.find(d => d.serialNumber === value);
  }

  async _readLoop() {
    if (!this._currentDevice || !this._currentDevice.opened) {
      this._rl = false;
      return;
    }
    this._rl = true;
    const res = await this._currentDevice.transferIn(5, 64);
    this.emit('data', Buffer.from(res.data.buffer));
    if (!this.mute) this.emit('message', Buffer.from(res.data.buffer).toString(this.encoding));
  }

  async requestDevice() {
    const device = await usb.requestDevice({ filters: [{ classCode: 2 }] });
    this.emit('deviceNamePrompt', device.serialNumber);
  }

  async isDevice(value) {
    return !!this._getDevice(value);
  }

  async setCurrentDevice(value) {
    if (!(await this.isDevice(value))) return;
    if (this._currentDevice) this.disconnect();
    this._currentDevice = this._getDevice(value);
    this.currentDevice = value;
    this.connect();
  }

  async writeBuff(buff) {
    await this._currentDevice.transferOut(4, buff);
  }

  async write(message) {
    if (this.mute) return;
    await this.writeBuff(Buffer.from(message, this.encoding));
  }

  async connect() {
    if (!this._currentDevice || this._currentDevice.opened) return;
    await this._currentDevice.open();
    await this._currentDevice.setConfiguration(1);
    await this._currentDevice.claimInterface(2);
    await this._currentDevice.controlTransferOut({
      requestType: 'class',
      recipient: 'interface',
      request: 0x22,
      value: 0x01,
      index: 0x02,
    });
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
    localStorage.deviceNames = JSON.stringify(this.devices);
  }
}

export default WebUSBSerial;
