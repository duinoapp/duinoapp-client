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
    } catch (err) { console.error(err); }
    this.lastBaud = this.baud;
    this.baud = baud;
    await this.connect();
    window.localStorage.currentBaudRate = baud;
    return baud;
  }

  async resetBaud() {
    this.setBaud(this.lastBaud);
  }

  async setMute(val) { this.mute = val; }

  _transSignal(sig) {
    if (sig === 'on' || sig === true) return { dtr: true, rts: true };
    if (sig === 'off' || sig === false) return { dtr: false, rts: false };
    return sig;
  }

  async setSignals(signals) { return signals; }

  async write(message) { return message; }

  async writeBuff(buff) { return buff; }

  async connect() { this.connected = true; }

  async disconnect() { this.connected = false; }

  async setDeviceName(value, name) {
    if (await this.isDevice(value)) this.devices.push({ value, name });
  }

  async getDeviceName(value) {
    return (this.devices.find((d) => d.value === value) || { name: '' }).name;
  }
}

export default BaseSerial;
